import { notFound, redirect } from "next/navigation";

import { CourseEditorClient } from "@/components/dashboard/courses/course-editor-client";
import { loadCourseStructure } from "@/lib/courses/load-course-structure";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";
import { isUuid } from "@/lib/utils/uuid";

export const dynamic = "force-dynamic";

type PageProps = { params: { id: string } };

function normalizeCourseRow(course: {
  id: string;
  title: unknown;
  description: unknown;
  status: unknown;
  price: unknown;
  currency: unknown;
  thumbnail_url?: unknown;
  access_type?: unknown;
  slug?: unknown;
  compare_at_price?: unknown;
}) {
  const raw = course.price;
  const priceNum =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? parseFloat(raw)
        : Number(raw);
  const cap = course.compare_at_price;
  const compareNum =
    cap == null
      ? null
      : typeof cap === "number"
        ? cap
        : typeof cap === "string"
          ? parseFloat(cap)
          : Number(cap);
  return {
    id: String(course.id),
    title: typeof course.title === "string" ? course.title : "",
    description:
      course.description === undefined || course.description === null
        ? null
        : String(course.description),
    status: typeof course.status === "string" ? course.status : "draft",
    price: Number.isFinite(priceNum) ? priceNum : 0,
    currency:
      typeof course.currency === "string" && course.currency
        ? course.currency.toLowerCase()
        : "eur",
    thumbnail_url:
      typeof course.thumbnail_url === "string" && course.thumbnail_url.trim()
        ? course.thumbnail_url.trim()
        : null,
    access_type:
      typeof course.access_type === "string" ? course.access_type : "paid",
    slug: typeof course.slug === "string" && course.slug.trim() ? course.slug.trim() : null,
    compare_at_price:
      compareNum != null && Number.isFinite(compareNum) && compareNum >= 0 ? compareNum : null,
  };
}

export default async function CourseEditorPage({ params }: PageProps) {
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
      "id, title, description, status, price, currency, thumbnail_url, access_type, slug, compare_at_price"
    )
    .eq("id", params.id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const course = normalizeCourseRow(data);
  const structure = await loadCourseStructure(supabase, course.id);

  return <CourseEditorClient course={course} structure={structure} />;
}
