"use client";

import { Plus, Search, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  createContactServer,
  deleteContactServer,
  importContactsCsvServer,
  updateContactTagsServer,
} from "@/lib/contacts/actions";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type ContactRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone?: string | null;
  tags: string[];
  source: string | null;
  subscribed: boolean;
  created_at: string;
};

function displayName(c: ContactRow): string {
  const n = [c.first_name, c.last_name].filter(Boolean).join(" ").trim();
  if (n) return n;
  const local = c.email.split("@")[0];
  return local || c.email;
}

function formatCreated(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(d);
}

type ContactsViewProps = {
  initialContacts: ContactRow[];
  /** Mode CRM : pagination et filtres côté serveur (URL). */
  crmPagination?: {
    total: number;
    page: number;
    pageSize: number;
  };
  crmFilters?: {
    q?: string;
    tag?: string;
    sort?: string;
    dir?: "asc" | "desc";
  };
  /** Base des formulaires GET (recherche / tri). */
  contactsBasePath?: string;
  /** Export CSV — réservé aux plans Creator+ (cohérent avec l’API). */
  exportCsvEnabled?: boolean;
};

function buildContactsQuery(
  base: Record<string, string | undefined>
): string {
  const p = new URLSearchParams();
  Object.entries(base).forEach(([k, v]) => {
    if (v !== undefined && v !== "") {
      p.set(k, v);
    }
  });
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function ContactsView({
  initialContacts,
  crmPagination,
  crmFilters,
  contactsBasePath = "/dashboard/email-crm/contacts",
  exportCsvEnabled = false,
}: ContactsViewProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState(initialContacts);
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [importNote, setImportNote] = useState(false);
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tags, setTags] = useState("");
  const [tagEdit, setTagEdit] = useState("");
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [tagError, setTagError] = useState<string | null>(null);
  const [contactActionError, setContactActionError] = useState<string | null>(null);

  const selected = contacts.find((r) => r.id === openId);

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  useEffect(() => {
    if (!openId) {
      setTagEdit("");
      return;
    }
    setContactActionError(null);
    const c = contacts.find((r) => r.id === openId);
    setTagEdit((c?.tags ?? []).join(", "));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync seulement à l’ouverture du panneau
  }, [openId]);

  const filtered = useMemo(() => {
    if (crmPagination) {
      return contacts;
    }
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => {
      const blob = `${displayName(c)} ${c.email} ${(c.tags ?? []).join(" ")}`.toLowerCase();
      return blob.includes(q);
    });
  }, [contacts, query, crmPagination]);

  const totalLabel = crmPagination
    ? crmPagination.total
    : contacts.length;

  async function refreshContacts() {
    const supabase = createClient();
    const { data } = await supabase
      .from("contacts")
      .select(
        "id, email, first_name, last_name, phone, tags, source, subscribed, created_at"
      )
      .order("created_at", { ascending: false });
    if (data) {
      setContacts(data as ContactRow[]);
    }
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    startTransition(async () => {
      const res = await createContactServer({
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        tags: tags || undefined,
      });
      if (res.ok) {
        setEmail("");
        setFirstName("");
        setLastName("");
        setTags("");
        setAddOpen(false);
        if (crmPagination) {
          router.refresh();
        } else {
          await refreshContacts();
        }
      } else {
        setFormError(res.error);
      }
    });
  }

  function handleCsvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      return;
    }
    setImportMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      startTransition(async () => {
        const res = await importContactsCsvServer(text);
        if (res.ok) {
          setImportMsg(
            `Import terminé : ${res.imported} ajouté(s), ${res.skipped} ignoré(s).`
          );
          if (crmPagination) {
            router.refresh();
          } else {
            await refreshContacts();
          }
        } else {
          setImportMsg(res.error);
        }
      });
    };
    reader.readAsText(file, "UTF-8");
  }

  function saveTags() {
    if (!selected) {
      return;
    }
    setTagError(null);
    startTransition(async () => {
      const res = await updateContactTagsServer({
        contactId: selected.id,
        tags: tagEdit,
      });
      if (res.ok) {
        if (crmPagination) {
          router.refresh();
        } else {
          await refreshContacts();
        }
      } else {
        setTagError(res.error);
      }
    });
  }

  function removeContact() {
    if (!selected) {
      return;
    }
    if (
      !window.confirm(
        `Supprimer définitivement le contact ${selected.email} ? Cette action est irréversible.`
      )
    ) {
      return;
    }
    setContactActionError(null);
    startTransition(async () => {
      const res = await deleteContactServer({ contactId: selected.id });
      if (res.ok) {
        setOpenId(null);
        if (crmPagination) {
          router.refresh();
        } else {
          await refreshContacts();
        }
      } else {
        setContactActionError(res.error);
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Contacts"
        description={`${totalLabel} contact${totalLabel !== 1 ? "s" : ""}${
          crmPagination && crmPagination.total > contacts.length
            ? ` (page ${crmPagination.page})`
            : ""
        }`}
        action={
          <div className="flex flex-wrap gap-2">
            {crmPagination ? (
              exportCsvEnabled ? (
                <a
                  href={`/api/dashboard/email-crm/contacts/export${buildContactsQuery({
                    q: crmFilters?.q,
                    tag: crmFilters?.tag,
                    sort: crmFilters?.sort,
                    dir: crmFilters?.dir,
                  })}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Exporter CSV
                </a>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  title="Réservé au plan Creator ou supérieur"
                >
                  Exporter CSV
                </Button>
              )
            ) : null}
            {crmPagination && !exportCsvEnabled ? (
              <Link
                href="/dashboard/settings?section=subscription-creo"
                className={buttonVariants({ variant: "ghost", size: "sm", className: "text-creo-purple" })}
              >
                Abonnement
              </Link>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setImportNote((v) => !v)}
            >
              <Upload className="size-4" />
              Importer CSV
            </Button>
            <Button type="button" size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Ajouter
            </Button>
          </div>
        }
      />

      {importNote ? (
        <Card className="mb-4 space-y-3 border-dashed p-4 text-creo-sm text-[#616161] dark:text-creo-gray-500">
          <p>
            Fichier CSV avec en-tête :{" "}
            <code className="text-creo-xs">email</code>,{" "}
            <code className="text-creo-xs">first_name</code>,{" "}
            <code className="text-creo-xs">last_name</code>,{" "}
            <code className="text-creo-xs">tags</code> (séparés par virgules).
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            disabled={pending}
            onChange={handleCsvChange}
            className="block w-full max-w-md text-creo-sm"
          />
          {importMsg ? <p className="text-creo-black dark:text-white">{importMsg}</p> : null}
        </Card>
      ) : null}

      {addOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 dark:bg-black/60"
            aria-label="Fermer"
            onClick={() => setAddOpen(false)}
          />
          <Card className="relative z-10 w-full max-w-md space-y-4 p-6">
            <h2 className="text-lg font-semibold text-[#202223] dark:text-white">
              Nouveau contact
            </h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="c-email">Email *</Label>
                <Input
                  id="c-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={pending}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="c-fn">Prénom</Label>
                  <Input
                    id="c-fn"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={pending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-ln">Nom</Label>
                  <Input
                    id="c-ln"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={pending}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-tags">Tags (séparés par virgules)</Label>
                <Input
                  id="c-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="lead, newsletter"
                  disabled={pending}
                />
              </div>
              {formError ? (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {formError}
                </p>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                  disabled={pending}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        {crmPagination ? (
          <form
            method="get"
            action={contactsBasePath}
            className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
          >
            <div className="relative min-w-[200px] max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-creo-gray-400" />
              <Input
                className="pl-9"
                name="q"
                placeholder="Email, nom…"
                defaultValue={crmFilters?.q ?? ""}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Input
                name="tag"
                placeholder="Tag exact"
                defaultValue={crmFilters?.tag ?? ""}
                className="w-40"
              />
              <input type="hidden" name="sort" value={crmFilters?.sort ?? "created_at"} />
              <input type="hidden" name="dir" value={crmFilters?.dir ?? "desc"} />
              <Button type="submit" size="sm" variant="secondary">
                Filtrer
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-creo-gray-400" />
              <Input
                className="pl-9"
                placeholder="Email, nom, tag…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="button" variant="ghost" size="sm" disabled>
              Filtres
            </Button>
          </div>
        )}
        {crmPagination ? (
          <div className="flex flex-wrap items-center gap-2 text-creo-sm text-creo-gray-500">
            <span>Trier :</span>
            <Link
              href={`${contactsBasePath}${buildContactsQuery({
                q: crmFilters?.q,
                tag: crmFilters?.tag,
                sort: "created_at",
                dir: crmFilters?.sort === "created_at" && crmFilters?.dir === "asc" ? "desc" : "asc",
              })}`}
              className={cn(
                "rounded px-2 py-1 hover:bg-creo-gray-100 dark:hover:bg-white/10",
                crmFilters?.sort !== "email" && crmFilters?.sort !== "name"
                  ? "font-medium text-creo-black dark:text-white"
                  : ""
              )}
            >
              Date
            </Link>
            <Link
              href={`${contactsBasePath}${buildContactsQuery({
                q: crmFilters?.q,
                tag: crmFilters?.tag,
                sort: "email",
                dir: crmFilters?.sort === "email" && crmFilters?.dir === "asc" ? "desc" : "asc",
              })}`}
              className={cn(
                "rounded px-2 py-1 hover:bg-creo-gray-100 dark:hover:bg-white/10",
                crmFilters?.sort === "email" ? "font-medium text-creo-black dark:text-white" : ""
              )}
            >
              Email
            </Link>
          </div>
        ) : null}
      </div>

      {contacts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-creo-md font-medium text-[#202223] dark:text-white">
            Aucun contact
          </p>
          <p className="mt-2 max-w-sm text-creo-sm text-[#616161] dark:text-creo-gray-500">
            Ajoute ton premier contact pour commencer à segmenter ton audience.
          </p>
          <Button type="button" className="mt-6" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Ajouter un contact
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center text-creo-sm text-creo-gray-500">
          Aucun résultat
          {crmFilters?.q ? ` pour « ${crmFilters.q} »` : ""}.
        </Card>
      ) : (
        <>
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-creo-sm">
            <thead className="border-b border-creo-gray-100 bg-creo-gray-50 text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500 dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-raised)] dark:text-creo-gray-500">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" aria-label="Tout" disabled />
                </th>
                <th className="px-4 py-3">Contact</th>
                <th className="hidden px-4 py-3 md:table-cell">Tags</th>
                <th className="hidden px-4 py-3 lg:table-cell">Source</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className={cn(
                    "cursor-pointer border-b border-creo-gray-100 hover:bg-creo-gray-50 dark:border-[var(--creo-dashboard-border)] dark:hover:bg-[#1a1a1a]",
                    openId === r.id && "bg-creo-purple-pale/40 dark:bg-creo-purple-pale/35"
                  )}
                  onClick={() => setOpenId(r.id)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" aria-label={r.email} disabled />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-creo-black dark:text-white">
                      {displayName(r)}
                    </p>
                    <p className="text-creo-xs text-creo-gray-500 dark:text-creo-gray-500">
                      {r.email}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(r.tags ?? []).length === 0 ? (
                        <span className="text-creo-xs text-creo-gray-400">—</span>
                      ) : (
                        r.tags.map((t) => (
                          <Badge key={t} variant="purple">
                            {t}
                          </Badge>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {r.source ? (
                      <Badge variant="gray">{r.source}</Badge>
                    ) : (
                      <span className="text-creo-xs text-creo-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={r.subscribed ? "green" : "gray"}>
                      {r.subscribed ? "Abonné" : "Désabonné"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        {crmPagination &&
        Math.ceil(crmPagination.total / crmPagination.pageSize) > 1 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-creo-sm text-creo-gray-500">
              Page {crmPagination.page} sur{" "}
              {Math.max(
                1,
                Math.ceil(crmPagination.total / crmPagination.pageSize)
              )}
            </p>
            <div className="flex gap-2">
              <Link
                href={`${contactsBasePath}${buildContactsQuery({
                  q: crmFilters?.q,
                  tag: crmFilters?.tag,
                  sort: crmFilters?.sort,
                  dir: crmFilters?.dir,
                  page:
                    crmPagination.page <= 1
                      ? undefined
                      : String(crmPagination.page - 1),
                })}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className:
                    crmPagination.page <= 1 ? "pointer-events-none opacity-40" : "",
                })}
                aria-disabled={crmPagination.page <= 1}
              >
                Précédent
              </Link>
              <Link
                href={`${contactsBasePath}${buildContactsQuery({
                  q: crmFilters?.q,
                  tag: crmFilters?.tag,
                  sort: crmFilters?.sort,
                  dir: crmFilters?.dir,
                  page: String(crmPagination.page + 1),
                })}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className:
                    crmPagination.page >=
                    Math.ceil(crmPagination.total / crmPagination.pageSize)
                      ? "pointer-events-none opacity-40"
                      : "",
                })}
              >
                Suivant
              </Link>
            </div>
          </div>
        ) : null}
        </>
      )}

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-creo-gray-200 bg-creo-white shadow-creo-modal transition-transform duration-200 dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-panel)]",
          openId ? "translate-x-0" : "translate-x-full"
        )}
      >
        {selected ? (
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between border-b border-creo-gray-100 p-6 dark:border-[var(--creo-dashboard-border)]">
              <div className="flex gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-creo-purple-pale text-lg font-semibold text-creo-purple dark:bg-creo-info-pale">
                  {displayName(selected)
                    .split(" ")
                    .map((x) => x[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h2 className="text-creo-md font-semibold dark:text-white">
                    {displayName(selected)}
                  </h2>
                  <p className="text-creo-sm text-creo-gray-500 dark:text-creo-gray-500">
                    {selected.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-creo-gray-500 hover:bg-creo-gray-100 dark:hover:bg-[var(--creo-gray-300)]"
                onClick={() => setOpenId(null)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <section>
                <h3 className="text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500">
                  Informations
                </h3>
                <div className="mt-3 space-y-2 text-creo-sm">
                  <p className="dark:text-white">
                    <span className="text-creo-gray-500">Inscrit le </span>
                    {formatCreated(selected.created_at)}
                  </p>
                </div>
              </section>
              <section>
                <h3 className="text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500">
                  Tags
                </h3>
                <div className="mt-2 space-y-2">
                  <Input
                    value={tagEdit}
                    onChange={(e) => setTagEdit(e.target.value)}
                    placeholder="tag1, tag2"
                    disabled={pending}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => saveTags()}
                  >
                    Enregistrer les tags
                  </Button>
                  {tagError ? (
                    <p className="text-creo-xs text-red-600 dark:text-red-400" role="alert">
                      {tagError}
                    </p>
                  ) : null}
                </div>
              </section>
              <section>
                <h3 className="text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500">
                  Formations
                </h3>
                <p className="mt-2 text-creo-sm text-creo-gray-500">
                  Historique des achats — à relier aux commandes (prochaine
                  étape produit).
                </p>
              </section>
            </div>
            <div className="space-y-2 border-t border-creo-gray-100 p-4 dark:border-[var(--creo-dashboard-border)]">
              <a
                href={`mailto:${encodeURIComponent(selected.email)}?subject=${encodeURIComponent(
                  `Message — ${displayName(selected)}`
                )}`}
                className={buttonVariants({ variant: "outline", className: "inline-flex w-full justify-center" })}
              >
                Ouvrir l’e-mail (app par défaut)
              </a>
              <Button
                type="button"
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                disabled={pending}
                onClick={removeContact}
              >
                Supprimer ce contact
              </Button>
              {contactActionError ? (
                <p className="text-center text-creo-xs text-red-600 dark:text-red-400" role="alert">
                  {contactActionError}
                </p>
              ) : null}
              <p className="text-center text-creo-xs text-creo-gray-500">
                Envois automatisés depuis CRÉO : voir{" "}
                <a href="/dashboard/email-crm/tags" className="text-creo-purple underline">
                  Tags CRM
                </a>
                .
              </p>
            </div>
          </div>
        ) : null}
      </div>
      {openId ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] dark:bg-black/50"
          aria-label="Fermer le panneau"
          onClick={() => setOpenId(null)}
        />
      ) : null}
    </>
  );
}
