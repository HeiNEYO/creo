"use client";

import { Plus, Search, Upload } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { createContactServer } from "@/lib/contacts/actions";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type ContactRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
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
};

export function ContactsView({ initialContacts }: ContactsViewProps) {
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

  const selected = contacts.find((r) => r.id === openId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => {
      const blob = `${displayName(c)} ${c.email} ${(c.tags ?? []).join(" ")}`.toLowerCase();
      return blob.includes(q);
    });
  }, [contacts, query]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    startTransition(async () => {
      const res = await createContactServer({
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });
      if (res.ok) {
        setEmail("");
        setFirstName("");
        setLastName("");
        setAddOpen(false);
        const supabase = createClient();
        const { data } = await supabase
          .from("contacts")
          .select(
            "id, email, first_name, last_name, tags, source, subscribed, created_at"
          )
          .order("created_at", { ascending: false });
        if (data) {
          setContacts(data as ContactRow[]);
        }
      } else {
        setFormError(res.error);
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Contacts"
        description={`${contacts.length} contact${contacts.length !== 1 ? "s" : ""}`}
        action={
          <div className="flex flex-wrap gap-2">
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
        <Card className="mb-4 border-dashed p-4 text-creo-sm text-[#616161] dark:text-[#a3a3a3]">
          L’import CSV sera disponible dans une prochaine version. En attendant,
          ajoute tes contacts un par un ou via ton CRM.
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

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
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
          Tags
        </Button>
      </div>

      {contacts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-creo-md font-medium text-[#202223] dark:text-white">
            Aucun contact
          </p>
          <p className="mt-2 max-w-sm text-creo-sm text-[#616161] dark:text-[#a3a3a3]">
            Ajoute ton premier contact pour commencer à segmenter ton audience.
          </p>
          <Button type="button" className="mt-6" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Ajouter un contact
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center text-creo-sm text-creo-gray-500">
          Aucun résultat pour « {query} ».
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-creo-sm">
            <thead className="border-b border-creo-gray-100 bg-creo-gray-50 text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-[#a3a3a3]">
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
                    "cursor-pointer border-b border-creo-gray-100 hover:bg-creo-gray-50 dark:border-[#2a2a2a] dark:hover:bg-[#1a1a1a]",
                    openId === r.id && "bg-creo-purple-pale/40 dark:bg-[#1f1f3a]/50"
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
                    <p className="text-creo-xs text-creo-gray-500 dark:text-[#a3a3a3]">
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
      )}

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-creo-gray-200 bg-creo-white shadow-creo-modal transition-transform duration-200 dark:border-[#2a2a2a] dark:bg-[#141414]",
          openId ? "translate-x-0" : "translate-x-full"
        )}
      >
        {selected ? (
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between border-b border-creo-gray-100 p-6 dark:border-[#2a2a2a]">
              <div className="flex gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-creo-purple-pale text-lg font-semibold text-creo-purple dark:bg-[#1f1f3a]">
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
                  <p className="text-creo-sm text-creo-gray-500 dark:text-[#a3a3a3]">
                    {selected.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-creo-gray-500 hover:bg-creo-gray-100 dark:hover:bg-[#2a2a2a]"
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
                  Formations
                </h3>
                <p className="mt-2 text-creo-sm text-creo-gray-500">
                  Historique des achats — à relier aux commandes (prochaine
                  étape produit).
                </p>
              </section>
            </div>
            <div className="border-t border-creo-gray-100 p-4 dark:border-[#2a2a2a]">
              <Button type="button" className="w-full" variant="outline" disabled>
                Envoyer un email (bientôt)
              </Button>
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
