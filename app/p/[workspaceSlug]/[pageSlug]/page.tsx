import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicPageRenderer } from "@/components/public/public-page-renderer";
import {
  fetchPublicPage,
  trackPublicPageView,
} from "@/lib/public-pages/fetch-public-page";

type Props = {
  params: { workspaceSlug: string; pageSlug: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await fetchPublicPage(params.workspaceSlug, params.pageSlug);
  if (!row) {
    return { title: "Page introuvable" };
  }
  const desc = row.seo_description?.trim() || undefined;
  return {
    title: row.seo_title?.trim() || row.title,
    description: desc,
  };
}

export default async function PublicPublishedPage({ params, searchParams }: Props) {
  const row = await fetchPublicPage(params.workspaceSlug, params.pageSlug);
  if (!row) {
    notFound();
  }

  const isDashboardPreview = searchParams.creo_preview === "1";
  if (!isDashboardPreview) {
    await trackPublicPageView(params.workspaceSlug, params.pageSlug, null);
  }

  const paid = searchParams.paid;
  const paidOk = paid === "1" || paid === "true";
  const paidCancelled = paid === "0" || paid === "false";

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <PublicPageRenderer
        title={row.title}
        content={row.content}
        pageType={row.type}
        stripeReady={row.stripe_ready}
        workspaceSlug={params.workspaceSlug}
        pageSlug={params.pageSlug}
        pageId={row.id}
        paidOk={paidOk}
        paidCancelled={paidCancelled}
        metaPixelId={row.meta_pixel_id}
      />
    </div>
  );
}
