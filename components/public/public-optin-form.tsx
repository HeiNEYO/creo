"use client";

import { useState } from "react";

type Props = {
  pageId: string;
  buttonLabel: string;
  introText?: string;
};

export function PublicOptinForm({ pageId, buttonLabel, introText }: Props) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setPending(true);
    try {
      const res = await fetch("/api/public/contacts/optin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId,
          email,
          firstName: firstName.trim() || undefined,
          tags: ["newsletter"],
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMsg(data.error ?? "Erreur d’inscription.");
      } else {
        setMsg("Merci ! Tu es inscrit(e).");
        setEmail("");
        setFirstName("");
      }
    } catch {
      setMsg("Erreur réseau.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-700 dark:bg-zinc-900/40">
      {introText ? <p className="mb-4 text-zinc-700 dark:text-zinc-300">{introText}</p> : null}
      <form className="flex max-w-md flex-col gap-3" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor={`optin-email-${pageId}`}>
          Email
        </label>
        <input
          id={`optin-email-${pageId}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ton@email.com"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          disabled={pending}
        />
        <input
          type="text"
          name="first_name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Prénom (optionnel)"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending}
          className="creo-public-accent-fill rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Envoi…" : buttonLabel}
        </button>
      </form>
      {msg ? <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{msg}</p> : null}
    </section>
  );
}
