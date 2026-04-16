import type { PageBlock } from "@/lib/pages/page-blocks";

function pickData(block: PageBlock): Record<string, unknown> {
  const d = block.data;
  if (d && typeof d === "object" && !Array.isArray(d)) return d as Record<string, unknown>;
  return {};
}

/** Aperçu compact dans le canvas builder */
export function BlockPreview({ block }: { block: PageBlock }) {
  const text = typeof block.text === "string" ? block.text : "";
  const d = pickData(block);

  if (block.type === "divider") {
    return <hr className="border-creo-gray-200" />;
  }
  if (block.type === "quote") {
    return (
      <blockquote className="border-l-4 border-zinc-300 pl-3 text-creo-sm italic text-creo-gray-700">
        {text || "Citation…"}
      </blockquote>
    );
  }
  if (block.type === "heading" || block.type === "h1") {
    return <p className="text-lg font-semibold text-creo-black">{text || "Titre…"}</p>;
  }
  if (block.type === "h2") {
    return <p className="text-base font-semibold text-creo-black">{text || "Sous-titre…"}</p>;
  }
  if (block.type === "hero") {
    const headline = typeof d.headline === "string" ? d.headline : "Hero";
    const sub =
      typeof d.subheadline === "string" ? d.subheadline : "Sous-titre du hero";
    const bg = typeof d.backgroundColor === "string" ? d.backgroundColor : "#f4f4f5";
    return (
      <div className="rounded-creo-md px-4 py-6" style={{ backgroundColor: bg }}>
        <p className="text-xl font-bold text-creo-black">{headline}</p>
        <p className="mt-2 text-creo-sm text-creo-gray-700">{sub}</p>
      </div>
    );
  }
  if (block.type === "optin_form") {
    const btn = typeof d.buttonLabel === "string" ? d.buttonLabel : "Recevoir";
    return (
      <div className="rounded-creo-md border border-creo-gray-200 bg-creo-gray-50/80 p-4">
        <p className="text-creo-sm text-creo-gray-800">{text || "Texte d’accroche opt-in."}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded border border-dashed border-creo-gray-300 px-2 py-1 text-creo-xs text-creo-gray-500">
            Email
          </span>
          <button
            type="button"
            className="rounded-creo-md bg-zinc-800 px-3 py-1.5 text-creo-xs font-medium text-white"
          >
            {btn}
          </button>
        </div>
      </div>
    );
  }
  if (block.type === "features") {
    const items = Array.isArray(d.items) ? d.items : [];
    return (
      <div className="grid gap-2 sm:grid-cols-3">
        {(items.length ? items : [{ title: "…", text: "" }]).slice(0, 3).map((it, i) => {
          const row = it && typeof it === "object" ? (it as { title?: string; text?: string }) : {};
          return (
            <div key={i} className="rounded border border-creo-gray-100 bg-creo-gray-50/50 p-2 text-creo-xs">
              <p className="font-medium">{row.title ?? "Titre"}</p>
              <p className="mt-1 text-creo-gray-600">{row.text ?? "…"}</p>
            </div>
          );
        })}
      </div>
    );
  }
  if (block.type === "testimonials" || block.type === "testimonial_mini") {
    const items = Array.isArray(d.items) ? d.items : [];
    return (
      <div className="space-y-2 text-creo-sm">
        {(items.length ? items : [{ quote: "« … »", author: "" }]).map((it, i) => {
          const row = it && typeof it === "object" ? (it as { quote?: string; author?: string }) : {};
          return (
            <p key={i} className="italic text-creo-gray-700">
              {row.quote ?? "Témoignage"}
              {row.author ? (
                <span className="not-italic text-creo-xs text-creo-gray-500"> — {row.author}</span>
              ) : null}
            </p>
          );
        })}
      </div>
    );
  }
  if (block.type === "faq") {
    const items = Array.isArray(d.items) ? d.items : [];
    return (
      <div className="space-y-1 text-creo-sm">
        {(items.length ? items : [{ q: "Question ?", a: "Réponse." }]).map((it, i) => {
          const row = it && typeof it === "object" ? (it as { q?: string; a?: string }) : {};
          return (
            <div key={i} className="rounded border border-creo-gray-100 px-2 py-1.5">
              <p className="font-medium">{row.q ?? "FAQ"}</p>
              <p className="text-creo-xs text-creo-gray-600">{row.a ?? ""}</p>
            </div>
          );
        })}
      </div>
    );
  }
  if (block.type === "countdown") {
    const end = typeof d.endAt === "string" ? d.endAt : "";
    const label = end
      ? new Date(end).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })
      : "date non définie";
    return (
      <p className="border-y border-creo-gray-200 py-2 text-center text-creo-xs text-creo-gray-600 dark:border-zinc-700 dark:text-zinc-400">
        Compte à rebours → {label}
      </p>
    );
  }
  if (block.type === "social_proof") {
    return (
      <div className="text-center text-creo-xs text-creo-gray-500">
        {typeof d.label === "string" ? d.label : "Logos / preuve sociale"}
      </div>
    );
  }
  if (block.type === "exit_popup") {
    return (
      <div className="rounded border border-dashed border-amber-200 bg-amber-50/50 px-3 py-2 text-creo-xs text-amber-900">
        Popup sortie {d.enabled ? "(activée)" : "(désactivée)"}
      </div>
    );
  }
  if (block.type === "footer_legal") {
    const links = Array.isArray(d.links) ? d.links : [];
    return (
      <div className="flex flex-wrap gap-2 text-creo-xs text-creo-gray-500">
        {(links.length ? links : [{ label: "Mentions", href: "#" }]).map((l, i) => {
          const row = l && typeof l === "object" ? (l as { label?: string }) : {};
          return (
            <span key={i} className="underline">
              {row.label ?? "Lien"}
            </span>
          );
        })}
      </div>
    );
  }
  if (block.type === "video_embed" || block.type === "lesson_video") {
    return (
      <div className="flex aspect-video items-center justify-center rounded-creo-md bg-creo-gray-900/90 text-creo-xs text-white">
        Vidéo {typeof d.url === "string" && d.url ? "(URL renseignée)" : "(URL)"}
      </div>
    );
  }
  if (block.type === "price_cta" || block.type === "price_readonly") {
    return (
      <div className="rounded-creo-md border-2 border-zinc-200 bg-zinc-50 p-4 text-center">
        <p className="text-creo-sm font-semibold">Prix (produit)</p>
        <p className="mt-2 text-creo-xs text-creo-gray-600">Lecture seule — défini dans le produit / checkout</p>
        <p className="mt-3 text-creo-xs font-medium text-zinc-800">
          {typeof d.label === "string" ? d.label : "CTA"}
        </p>
      </div>
    );
  }
  if (block.type === "order_summary" || block.type === "customer_info" || block.type === "payment_stripe") {
    return (
      <div className="rounded border border-creo-gray-200 bg-creo-gray-50 px-3 py-2 text-creo-xs text-creo-gray-600">
        {block.type === "order_summary" && "Récapitulatif commande (données produit)"}
        {block.type === "customer_info" && "Nom & email (verrouillé)"}
        {block.type === "payment_stripe" && "Formulaire de paiement Stripe (verrouillé)"}
      </div>
    );
  }
  if (block.type === "legal_checkout") {
    return (
      <p className="text-creo-xs text-creo-gray-500">
        CGV / remboursement — liens obligatoires sur la page checkout.
      </p>
    );
  }
  if (block.type === "confirmation" || block.type === "access_button") {
    return (
      <div className="rounded-creo-md border border-emerald-200 bg-emerald-50/50 p-3 text-creo-sm">
        {block.type === "confirmation" ? (
          <>
            <p className="font-semibold">{typeof d.headline === "string" ? d.headline : "Merci !"}</p>
            <p className="mt-1 text-creo-xs text-creo-gray-600">
              {typeof d.text === "string" ? d.text : "Message de confirmation."}
            </p>
          </>
        ) : (
          <span className="font-medium text-zinc-800">
            {typeof d.label === "string" ? d.label : "Accéder"}
          </span>
        )}
      </div>
    );
  }

  return <p className="text-creo-sm leading-relaxed text-creo-gray-700">{text || "Bloc…"}</p>;
}
