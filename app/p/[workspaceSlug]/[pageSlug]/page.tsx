import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicPageRenderer } from "@/components/public/public-page-renderer";
import {
  fetchPublicPage,
  trackPublicPageView,
} from "@/lib/public-pages/fetch-public-page";

type Props = {
  params: { workspaceSlug: string; pageSlug: string };
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

export default async function PublicPublishedPage({ params }: Props) {
  const row = await fetchPublicPage(params.workspaceSlug, params.pageSlug);
  if (!row) {
    notFound();
  }

  await trackPublicPageView(params.workspaceSlug, params.pageSlug, null);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <PublicPageRenderer title={row.title} content={row.content} />
    </div>
  );
}
