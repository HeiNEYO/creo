import { BuilderShell } from "@/components/builder/builder-shell";

type PageProps = { params: { pageId: string } };

export default function BuilderPage({ params }: PageProps) {
  return <BuilderShell pageId={params.pageId} />;
}
