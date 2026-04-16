import { notFound, redirect } from "next/navigation";

import { LearnCourseExperience } from "@/components/learn/learn-course-experience";
import { loadCourseStructure } from "@/lib/courses/load-course-structure";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";
import { isUuid } from "@/lib/utils/uuid";

export const dynamic = "force-dynamic";

function normalize(row: Record<string, unknown>) {
  const raw = row.price;
  const priceNum =
    typeof raw === "number" ? raw : typeof raw === "string" ? parseFloat(raw) : Number(raw);
  const cap = row.compare_at_price;
  const compareNum =
    cap == null
      ? null
      : typeof cap === "number"
        ? cap
        : typeof cap === "string"
          ? parseFloat(cap)
          : Number(cap);
  return {
    id: String(row.id),
    title: typeof row.title === "string" ? row.title : "",
    description:
      row.description === undefined || row.description === null
        ? null
        : String(row.description),
    thumbnail_url:
      typeof row.thumbnail_url === "string" && row.thumbnail_url.trim()
        ? row.thumbnail_url.trim()
        : null,
    price: Number.isFinite(priceNum) ? priceNum : 0,
    currency:
      typeof row.currency === "string" && row.currency
        ? row.currency.toLowerCase()
        : "eur",
    compare_at_price:
      compareNum != null && Number.isFinite(compareNum) && compareNum >= 0 ? compareNum : null,
    status: typeof row.status === "string" ? row.status : "draft",
    slug: typeof row.slug === "string" && row.slug.trim() ? row.slug.trim() : null,
    access_type:
      typeof row.access_type === "string" ? row.access_type : "paid",
  };
}

export default async function CoursePreviewPage({ params }: { params: { id: string } }) {
  if (!isUuid(params.id)) {
    notFound();
  }

  const { supabase, user, workspaceId } = await getWorkspaceContext();
  if (!user) {
    redirect("/login");
  }
  if (!workspaceId) {
    redirect("/dashboard/courses");
  }

  const { data, error } = await supabase
    .from("courses")
    .select(
      "id, title, description, thumbnail_url, price, currency, status, slug, compare_at_price, access_type"
    )
    .eq("id", params.id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const course = normalize(data as Record<string, unknown>);
  const structure = await loadCourseStructure(supabase, course.id);

  return (
    <LearnCourseExperience
      variant="preview"
      course={course}
      structure={structure}
      backHref={`/dashboard/courses/${params.id}`}
    />
  );
}
