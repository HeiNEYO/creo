"use client";

import { Download, Printer, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import type { WorkspaceOrderRow } from "@/lib/orders/get-workspace-orders";
import { PageHeader } from "@/components/dashboard/page-header";
import { NavIconOrders } from "@/components/icons/creo-nav-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type StatusFilter =
  | "all"
  | "paid"
  | "pending"
  | "failed"
  | "refunded"
  | "canceled";

type ProductFilter = "all" | "page" | "course" | "membership";

type DatePreset = "all" | "7d" | "30d" | "90d";

const STATUS_LABELS: Record<string, string> = {
  paid: "Payée",
  pending: "En attente",
  failed: "Échouée",
  refunded: "Remboursée",
  canceled: "Annulée",
};

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  page: "Page",
  course: "Formation",
  membership: "Abonnement",
};

function fmtMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function orderRef(id: string): string {
  return `#${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-800 ring-emerald-600/10 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-500/20";
    case "pending":
      return "bg-sky-50 text-sky-800 ring-sky-600/10 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-500/20";
    case "failed":
      return "bg-orange-50 text-orange-900 ring-orange-600/15 dark:bg-orange-950/40 dark:text-orange-200 dark:ring-orange-500/20";
    case "refunded":
      return "bg-zinc-100 text-zinc-700 ring-zinc-500/10 dark:bg-zinc-800/80 dark:text-zinc-300 dark:ring-zinc-500/20";
    case "canceled":
      return "bg-zinc-100 text-zinc-600 ring-zinc-500/10 dark:bg-zinc-800/60 dark:text-zinc-400 dark:ring-zinc-500/15";
    default:
      return "bg-zinc-100 text-zinc-700 ring-zinc-500/10 dark:bg-zinc-800/80 dark:text-zinc-300";
  }
}

function inDatePreset(iso: string, preset: DatePreset): boolean {
  if (preset === "all") return true;
  const d = new Date(iso).getTime();
  const now = Date.now();
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  return d >= now - days * 86400000;
}

function exportCsv(rows: WorkspaceOrderRow[]) {
  const headers = [
    "Commande",
    "Date",
    "Client",
    "Email",
    "Produit",
    "Type",
    "Statut",
    "Montant",
    "Devise",
  ];
  const lines = rows.map((r) => {
    const client = r.customerName || r.customerEmail || "—";
    const cells = [
      orderRef(r.id),
      fmtDateTime(r.createdAt),
      client,
      r.customerEmail ?? "",
      r.productLabel,
      PRODUCT_TYPE_LABELS[r.productType] ?? r.productType,
      STATUS_LABELS[r.status] ?? r.status,
      String(r.amount),
      r.currency,
    ];
    return cells
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(";");
  });
  const blob = new Blob([`\uFEFF${headers.join(";")}\n${lines.join("\n")}`], {
    type: "text/csv;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `commandes-creo-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

type Props = {
  orders: WorkspaceOrderRow[];
};

export function OrdersView({ orders }: Props) {
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<StatusFilter>("all");
  const [productFilter, setProductFilter] = useState<ProductFilter>("all");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((r) => {
      if (!inDatePreset(r.createdAt, datePreset)) return false;
      if (productFilter !== "all" && r.productType !== productFilter) return false;
      if (statusTab !== "all" && r.status !== statusTab) return false;
      if (!q) return true;
      const hay = [
        orderRef(r.id).toLowerCase(),
        r.id.toLowerCase(),
        r.customerName?.toLowerCase() ?? "",
        r.customerEmail?.toLowerCase() ?? "",
        r.productLabel.toLowerCase(),
        STATUS_LABELS[r.status]?.toLowerCase() ?? r.status,
        PRODUCT_TYPE_LABELS[r.productType]?.toLowerCase() ?? "",
      ].join(" ");
      return hay.includes(q);
    });
  }, [orders, search, statusTab, productFilter, datePreset]);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: orders.length,
      paid: 0,
      pending: 0,
      failed: 0,
      refunded: 0,
      canceled: 0,
    };
    for (const r of orders) {
      if (r.status === "paid") c.paid += 1;
      else if (r.status === "pending") c.pending += 1;
      else if (r.status === "failed") c.failed += 1;
      else if (r.status === "refunded") c.refunded += 1;
      else if (r.status === "canceled") c.canceled += 1;
    }
    return c;
  }, [orders]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  const onPrint = useCallback(() => {
    window.print();
  }, []);

  const onExport = useCallback(() => {
    exportCsv(filtered);
  }, [filtered]);

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "paid", label: "Payées" },
    { key: "pending", label: "En attente" },
    { key: "failed", label: "Échouées" },
    { key: "refunded", label: "Remboursées" },
    { key: "canceled", label: "Annulées" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commandes"
        description="Historique des commandes du workspace (Stripe / checkout)."
        leading={
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-creo-purple-pale dark:bg-creo-purple-pale"
            aria-hidden
          >
            <span className="inline-flex scale-[1.12] [&_img]:!opacity-100 dark:[&_img]:!opacity-100">
              <NavIconOrders />
            </span>
          </div>
        }
        action={
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-[10px]"
              onClick={onPrint}
            >
              <Printer className="size-4" aria-hidden />
              Imprimer
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-[10px]"
              onClick={onExport}
              disabled={filtered.length === 0}
            >
              <Download className="size-4" aria-hidden />
              Exporter CSV
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-4 print:hidden">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8c9196] dark:text-creo-gray-500"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher par n° de commande, client, e-mail, produit…"
            className="h-11 rounded-[12px] border-[#e3e5e8] bg-white pl-10 pr-4 text-[13px] dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-raised)]"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={datePreset}
            onChange={(e) => {
              setDatePreset(e.target.value as DatePreset);
              setPage(1);
            }}
            className="h-10 min-w-[140px] rounded-[10px] border border-[#e3e5e8] bg-white px-3 text-[13px] text-[#202223] dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-raised)] dark:text-white"
            aria-label="Période"
          >
            <option value="all">Toutes les dates</option>
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
          </select>
          <select
            value={productFilter}
            onChange={(e) => {
              setProductFilter(e.target.value as ProductFilter);
              setPage(1);
            }}
            className="h-10 min-w-[160px] rounded-[10px] border border-[#e3e5e8] bg-white px-3 text-[13px] dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-raised)] dark:text-white"
            aria-label="Type de produit"
          >
            <option value="all">Tous les types</option>
            <option value="page">Page</option>
            <option value="course">Formation</option>
            <option value="membership">Abonnement</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 print:hidden">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map(({ key, label }) => {
            const n = counts[key];
            const active = statusTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setStatusTab(key);
                  setPage(1);
                }}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[14px] font-medium transition-colors",
                  active
                    ? "bg-creo-purple text-white shadow-sm ring-1 ring-creo-purple-dark/20 dark:bg-creo-purple-light dark:text-white dark:ring-creo-purple/30"
                    : "bg-[var(--creo-dashboard-canvas)] text-[#616161] hover:bg-creo-purple-pale hover:text-creo-purple dark:bg-white/[0.08] dark:text-creo-gray-400 dark:hover:bg-creo-purple-pale/40 dark:hover:text-creo-blue-readable",
                )}
              >
                {label} ({n})
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#616161] dark:text-creo-gray-500">
          <span>
            {filtered.length === 0
              ? "Aucun résultat"
              : `Affichage ${start + 1} – ${Math.min(start + pageSize, filtered.length)} sur ${filtered.length}`}
          </span>
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">Lignes par page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-9 rounded-[10px] border border-[#e3e5e8] bg-white px-2 text-[12px] dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-raised)] dark:text-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-[var(--creo-dashboard-card-radius)] border border-[#e3e5e8] bg-white dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-panel)]",
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#e3e5e8] bg-[#fafbfb] text-[11px] font-semibold uppercase tracking-wide text-[#616161] dark:border-[var(--creo-dashboard-border)] dark:bg-white/[0.04] dark:text-creo-gray-500">
                <th className="px-4 py-3">Commande</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-12 text-center text-[#8c9196] dark:text-creo-gray-500"
                    colSpan={7}
                  >
                    Aucune commande ne correspond aux filtres.
                  </td>
                </tr>
              ) : (
                pageRows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-[var(--creo-dashboard-canvas)] last:border-0 dark:border-white/[0.06]"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] font-medium text-[#202223] dark:text-white">
                      {orderRef(r.id)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[#202223] dark:text-white">
                      {fmtDateTime(r.createdAt)}
                    </td>
                    <td className="max-w-[200px] px-4 py-3">
                      <div className="truncate font-medium text-[#202223] dark:text-white">
                        {r.customerName || "—"}
                      </div>
                      {r.customerEmail ? (
                        <div className="truncate text-[12px] text-[#616161] dark:text-creo-gray-500">
                          {r.customerEmail}
                        </div>
                      ) : null}
                    </td>
                    <td className="max-w-[220px] px-4 py-3 text-[#202223] dark:text-white">
                      <span className="line-clamp-2">{r.productLabel}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[#616161] dark:text-creo-gray-500">
                      {PRODUCT_TYPE_LABELS[r.productType] ?? r.productType}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                          statusBadgeClass(r.status),
                        )}
                      >
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-[#202223] dark:text-white">
                      {fmtMoney(r.amount, r.currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-[10px]"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Précédent
          </Button>
          <span className="text-[13px] text-[#616161] dark:text-creo-gray-500">
            Page {safePage} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-[10px]"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Suivant
          </Button>
        </div>
      ) : null}
    </div>
  );
}
