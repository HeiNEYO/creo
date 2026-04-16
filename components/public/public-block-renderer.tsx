import type { CSSProperties, ReactNode } from "react";

import { PublicOptinForm } from "@/components/public/public-optin-form";
import { PublicCountdown } from "@/components/public/public-countdown";
import { elementStylePayloadToCss } from "@/lib/pages/editor/element-style-to-css";
import { resolveButtonStyleData } from "@/lib/pages/editor/button-editor-presets";
import type { CheckoutContentConfig } from "@/lib/public-pages/checkout-config";

type Block = {
  id?: string;
  type?: string;
  text?: string;
  data?: unknown;
};

function dataObj(b: Block): Record<string, unknown> {
  const d = b.data;
  if (d && typeof d === "object" && !Array.isArray(d)) return d as Record<string, unknown>;
  return {};
}

/** Aperçu / rendu public : retire les scripts et iframes dangereuses. */
function stripDangerousHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtube-nocookie.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const m = u.pathname.match(/\/embed\/([^/]+)/);
      if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function renderPublicBlock(
  b: Block,
  key: string,
  checkoutCfg: CheckoutContentConfig | null,
  pageId?: string | null
): ReactNode {
  const text = typeof b.text === "string" ? b.text : "";
  const d = dataObj(b);

  if (b.type === "paragraph" || b.type === "text") {
    const html = typeof d.html === "string" ? d.html : "";
    const wrapStyle = elementStylePayloadToCss(d.elementStyle);
    if (html.trim()) {
      return (
        <div key={key} style={wrapStyle} className="max-w-none">
          <div
            className="creo-rich-text max-w-none leading-relaxed [&_img]:max-w-full [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
            dangerouslySetInnerHTML={{ __html: stripDangerousHtml(html) }}
          />
        </div>
      );
    }
    return (
      <div key={key} style={wrapStyle} className="max-w-none">
        <p className="creo-rich-text leading-relaxed">{text}</p>
      </div>
    );
  }

  if (b.type === "image") {
    const src = typeof d.src === "string" ? d.src : "";
    const alt = typeof d.alt === "string" ? d.alt : "";
    if (!src.trim()) {
      return (
        <div
          key={key}
          className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-600 dark:text-zinc-400"
        >
          Image : ajoute une URL dans l’éditeur.
        </div>
      );
    }
    const fit =
      d.objectFit === "contain" || d.objectFit === "fill" || d.objectFit === "none" || d.objectFit === "scale-down"
        ? d.objectFit
        : "cover";
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={key}
        src={src}
        alt={alt}
        className="h-auto w-full max-w-full rounded-lg"
        style={{ objectFit: fit }}
      />
    );
  }

  if (b.type === "button") {
    const label = text || "Bouton";
    const href = typeof d.url === "string" && d.url.trim() ? d.url : "#";
    const newTab = d.newTab === true;
    const r = resolveButtonStyleData(d);
    const bevel =
      r.bevelHighlight !== "transparent" && r.bevelShadow !== "transparent"
        ? `inset 0 1px 0 ${r.bevelHighlight}, inset 0 -1px 0 ${r.bevelShadow}`
        : undefined;
    const style: CSSProperties = {
      borderRadius: 8,
      boxShadow: bevel,
      ["--btn-bg" as string]: r.bgColor,
      ["--btn-fg" as string]: r.textColor,
      ["--btn-h-bg" as string]: r.hoverBgColor,
      ["--btn-h-fg" as string]: r.hoverTextColor,
      ["--btn-h-scale" as string]: String(r.hoverScale),
      ["--btn-t-ms" as string]: `${r.transitionMs}ms`,
    };
    if (r.borderTopWidth > 0) style.borderTop = `${r.borderTopWidth}px solid ${r.borderTopColor}`;
    if (r.borderBottomWidth > 0) style.borderBottom = `${r.borderBottomWidth}px solid ${r.borderBottomColor}`;
    if (r.borderLeftWidth > 0) style.borderLeft = `${r.borderLeftWidth}px solid ${r.borderColor}`;
    if (r.borderRightWidth > 0) style.borderRight = `${r.borderRightWidth}px solid ${r.borderColor}`;
    return (
      <a
        key={key}
        href={href}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        className="creo-public-btn"
        style={style}
      >
        {label}
      </a>
    );
  }
  if (b.type === "heading" || b.type === "h1") {
    const tag = typeof d.tag === "string" && /^h[1-6]$/.test(d.tag) ? d.tag : "h2";
    const size =
      tag === "h1"
        ? "text-3xl md:text-4xl"
        : tag === "h2"
          ? "text-2xl md:text-3xl"
          : tag === "h3"
            ? "text-xl md:text-2xl"
            : "text-lg md:text-xl";
    const Tag = tag as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    const headingStyle = elementStylePayloadToCss(d.elementStyle);
    return (
      <Tag
        key={key}
        className={`creo-block-heading font-semibold tracking-tight ${size}`}
        style={headingStyle}
      >
        {text}
      </Tag>
    );
  }
  if (b.type === "h2") {
    return (
      <h3 key={key} className="creo-block-heading text-xl font-semibold">
        {text}
      </h3>
    );
  }
  if (b.type === "quote") {
    return (
      <blockquote
        key={key}
        className="border-l-4 border-zinc-300 pl-4 text-lg italic text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
      >
        {text}
      </blockquote>
    );
  }
  if (b.type === "divider") {
    return <hr key={key} className="border-zinc-200 dark:border-zinc-700" />;
  }

  if (b.type === "hero") {
    const headline = typeof d.headline === "string" ? d.headline : "Titre";
    const sub = typeof d.subheadline === "string" ? d.subheadline : "";
    const bg = typeof d.backgroundColor === "string" ? d.backgroundColor : "#fafafa";
    return (
      <section
        key={key}
        className="rounded-xl px-6 py-10 text-center"
        style={{ backgroundColor: bg }}
      >
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{headline}</h2>
        {sub ? <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-300">{sub}</p> : null}
      </section>
    );
  }

  if (b.type === "optin_form") {
    const btn = typeof d.buttonLabel === "string" ? d.buttonLabel : "Recevoir";
    if (!pageId) {
      return (
        <section
          key={key}
          className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-700 dark:bg-zinc-900/40"
        >
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Formulaire opt-in : identifiant de page manquant (aperçu).
          </p>
        </section>
      );
    }
    return (
      <PublicOptinForm key={key} pageId={pageId} buttonLabel={btn} introText={text || undefined} />
    );
  }

  if (b.type === "features") {
    const items = Array.isArray(d.items) ? d.items : [];
    return (
      <ul key={key} className="grid gap-4 sm:grid-cols-3">
        {items.map((it, i) => {
          const row = it && typeof it === "object" ? (it as { title?: string; text?: string }) : {};
          return (
            <li
              key={i}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/50"
            >
              <p className="font-semibold text-zinc-900 dark:text-white">{row.title ?? ""}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{row.text ?? ""}</p>
            </li>
          );
        })}
      </ul>
    );
  }

  if (b.type === "testimonials" || b.type === "testimonial_mini") {
    const items = Array.isArray(d.items) ? d.items : [];
    return (
      <div key={key} className="space-y-4">
        {items.map((it, i) => {
          const row = it && typeof it === "object" ? (it as { quote?: string; author?: string }) : {};
          return (
            <blockquote
              key={i}
              className="border-l-4 border-violet-400 pl-4 text-zinc-700 dark:text-zinc-300"
            >
              <p className="italic">{row.quote ?? ""}</p>
              {row.author ? <footer className="mt-2 text-sm text-zinc-500">— {row.author}</footer> : null}
            </blockquote>
          );
        })}
      </div>
    );
  }

  if (b.type === "faq") {
    const items = Array.isArray(d.items) ? d.items : [];
    return (
      <dl key={key} className="space-y-4">
        {items.map((it, i) => {
          const row = it && typeof it === "object" ? (it as { q?: string; a?: string }) : {};
          return (
            <div key={i}>
              <dt className="font-semibold text-zinc-900 dark:text-white">{row.q ?? ""}</dt>
              <dd className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{row.a ?? ""}</dd>
            </div>
          );
        })}
      </dl>
    );
  }

  if (b.type === "countdown") {
    const end = typeof d.endAt === "string" ? d.endAt : "";
    return <PublicCountdown key={key} endAt={end} />;
  }

  if (b.type === "social_proof") {
    return (
      <p key={key} className="text-center text-sm text-[color:var(--creo-page-secondary,#737373)]">
        {typeof d.label === "string" ? d.label : "Ils nous font confiance"}
      </p>
    );
  }

  if (b.type === "footer_legal") {
    const links = Array.isArray(d.links) ? d.links : [];
    return (
      <footer key={key} className="flex flex-wrap gap-4 border-t border-zinc-200 pt-8 text-sm text-zinc-500 dark:border-zinc-700">
        {links.map((l, i) => {
          const row = l && typeof l === "object" ? (l as { label?: string; href?: string }) : {};
          return (
            <a key={i} href={row.href ?? "#"} className="creo-public-inline-link underline">
              {row.label ?? "Lien"}
            </a>
          );
        })}
      </footer>
    );
  }

  if (b.type === "video_embed" || b.type === "lesson_video") {
    const url = typeof d.url === "string" ? d.url : "";
    const embed = url ? youtubeEmbedUrl(url) : null;
    if (embed) {
      return (
        <div key={key} className="aspect-video overflow-hidden rounded-xl bg-zinc-900">
          <iframe
            title="Vidéo"
            src={embed}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      );
    }
    return (
      <div
        key={key}
        className="aspect-video overflow-hidden rounded-xl border border-dashed border-zinc-600 bg-zinc-900/80 text-center text-sm text-zinc-400"
      >
        <div className="flex h-full items-center justify-center p-4">
          {url ? `Colle une URL YouTube valide — ${url.slice(0, 48)}…` : "Colle une URL de vidéo YouTube"}
        </div>
      </div>
    );
  }

  if (b.type === "order_summary") {
    return (
      <div
        key={key}
        className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/50"
      >
        {checkoutCfg ? (
          <>
            <p className="font-semibold text-zinc-900 dark:text-white">{checkoutCfg.product_name}</p>
            <p className="mt-2 text-lg font-bold text-zinc-900 dark:text-white">
              {(checkoutCfg.price_cents / 100).toFixed(2)} €
            </p>
          </>
        ) : (
          <p className="text-sm text-zinc-600">Récapitulatif commande (configure le checkout dans l’éditeur)</p>
        )}
      </div>
    );
  }

  if (b.type === "customer_info") {
    return (
      <div key={key} className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-600">
        Nom et email du client (collectés avant paiement)
      </div>
    );
  }

  if (b.type === "payment_stripe") {
    return (
      <div key={key} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900/40">
        Paiement sécurisé par Stripe — utilise le bouton ci-dessous.
      </div>
    );
  }

  if (b.type === "legal_checkout") {
    const terms = typeof d.termsUrl === "string" ? d.termsUrl : "";
    const refund = typeof d.refundUrl === "string" ? d.refundUrl : "";
    return (
      <p key={key} className="text-xs text-zinc-500">
        En commandant tu acceptes les{" "}
        {terms ? (
          <a href={terms} className="creo-public-inline-link underline">
            conditions
          </a>
        ) : (
          "conditions"
        )}{" "}
        et la{" "}
        {refund ? (
          <a href={refund} className="creo-public-inline-link underline">
            politique de remboursement
          </a>
        ) : (
          "politique de remboursement"
        )}
        .
      </p>
    );
  }

  if (b.type === "confirmation") {
    const h = typeof d.headline === "string" ? d.headline : "Merci !";
    const body = typeof d.text === "string" ? d.text : "";
    return (
      <div key={key} className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
        <h2 className="text-xl font-semibold text-emerald-900 dark:text-emerald-200">{h}</h2>
        {body ? <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-300">{body}</p> : null}
      </div>
    );
  }

  if (b.type === "access_button") {
    const label = typeof d.label === "string" ? d.label : "Accéder";
    const href = typeof d.href === "string" ? d.href : "#";
    return (
      <a
        key={key}
        href={href}
        className="creo-public-accent-fill inline-flex rounded-lg px-5 py-2.5 text-sm font-medium"
      >
        {label}
      </a>
    );
  }

  if (b.type === "price_cta" || b.type === "price_readonly") {
    return (
      <div key={key} className="rounded-xl border-2 border-violet-300 bg-violet-50/50 p-6 text-center dark:border-violet-800 dark:bg-violet-950/30">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Prix affiché depuis le produit</p>
        <p className="mt-3 text-lg font-bold text-zinc-900 dark:text-white">—</p>
        <p className="mt-2 text-sm font-medium text-violet-700 dark:text-violet-300">
          {typeof d.label === "string" ? d.label : "Acheter"}
        </p>
      </div>
    );
  }

  return (
    <div key={key} className="rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-700">
      Bloc « {b.type ?? "inconnu"} » — rendu à étendre.
    </div>
  );
}
