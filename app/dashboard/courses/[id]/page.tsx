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
}) {
  const raw = course.price;
  const priceNum =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? parseFloat(raw)
        : Number(raw);
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
    .select("id, title, description, status, price, currency")
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
