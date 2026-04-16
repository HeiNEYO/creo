import { renderPublicBlock } from "@/components/public/public-block-renderer";
import { PublicCheckoutButton } from "@/components/public/public-checkout-button";
import { PublicMetaPixel } from "@/components/public/public-meta-pixel";
import { parseCheckoutContent } from "@/lib/public-pages/checkout-config";
import { pageFontStack, pageThemeFromContent } from "@/lib/public-pages/page-theme";

type Block = {
  id?: string;
  type?: string;
  text?: string;
  data?: unknown;
};

function blocksFromContent(content: unknown): Block[] {
  if (!content || typeof content !== "object") return [];
  const blocks = (content as { blocks?: unknown }).blocks;
  if (!Array.isArray(blocks)) return [];
  return blocks.filter((b): b is Block => b && typeof b === "object");
}

export function PublicPageRenderer({
  title,
  content,
  pageType,
  stripeReady,
  workspaceSlug,
  pageSlug,
  pageId,
  paidOk,
  paidCancelled,
  metaPixelId,
}: {
  title: string;
  content: unknown;
  pageType: string;
  stripeReady: boolean;
  workspaceSlug: string;
  pageSlug: string;
  pageId: string;
  paidOk?: boolean;
  paidCancelled?: boolean;
  metaPixelId?: string | null;
}) {
  const blocks = blocksFromContent(content);
  const checkoutCfg = pageType === "checkout" ? parseCheckoutContent(content) : null;
  const showPay =
    pageType === "checkout" && checkoutCfg !== null;
  const payDisabled = !stripeReady;
  const payReason = payDisabled
    ? "Le vendeur doit lier son compte Stripe à CRÉO (Intégrations) et terminer la configuration pour accepter les paiements."
    : undefined;

  const { meta, globalStyles: gs } = pageThemeFromContent(content);
  const pageBg = meta.backgroundColor?.trim() || "#ffffff";
  const contentMax = Math.min(1920, Math.max(320, meta.maxWidth || 1200));
  const baseFs = Math.min(24, Math.max(12, gs.baseFontSize || 16));

  const articleStyle = {
    maxWidth: `${contentMax}px`,
    fontFamily: pageFontStack(gs.fontBody),
    fontSize: `${baseFs}px`,
    color: gs.primaryColor,
    ["--creo-page-primary" as string]: gs.primaryColor,
    ["--creo-page-secondary" as string]: gs.secondaryColor,
    ["--creo-page-accent" as string]: gs.accentColor,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageBg }}>
      <article className="creo-public-page mx-auto px-4 py-12" style={articleStyle}>
      <PublicMetaPixel pixelId={metaPixelId ?? null} />
      <h1
        className="text-3xl font-bold tracking-tight"
        style={{ fontFamily: pageFontStack(gs.fontHeading), color: gs.primaryColor }}
      >
        {title}
      </h1>
      {paidOk ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
          Paiement reçu. Merci !
        </p>
      ) : null}
      {paidCancelled && !paidOk ? (
        <p className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200">
          Paiement annulé. Tu peux réessayer quand tu veux.
        </p>
      ) : null}
      <div className="mt-8 space-y-6" style={{ color: gs.secondaryColor }}>
        {blocks.length === 0 ? (
          <p style={{ color: gs.secondaryColor }}>Cette page est publiée. Ajoute du contenu dans le builder.</p>
        ) : (
          blocks.map((b, i) => {
            const key = b.id ?? `b-${i}`;
            return renderPublicBlock(b, key, checkoutCfg, pageId);
          })
        )}
      </div>
      {showPay && checkoutCfg ? (
        <PublicCheckoutButton
          workspaceSlug={workspaceSlug}
          pageSlug={pageSlug}
          label={checkoutCfg.button_label}
          disabled={payDisabled}
          disabledReason={payReason}
        />
      ) : null}
    </article>
    </div>
  );
}
