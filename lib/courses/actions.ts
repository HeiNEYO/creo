"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

function revalidateCourse(courseId: string) {
  revalidatePath("/dashboard/courses");
  revalidatePath(`/dashboard/courses/${courseId}`);
}

export async function updateCourseServer(input: {
  courseId: string;
  title?: string;
  description?: string | null;
  price?: number;
  currency?: string;
  status?: "draft" | "published";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const patch: Record<string, unknown> = {};
  if (typeof input.title === "string") {
    const t = input.title.trim();
    if (!t) {
      return { ok: false, error: "Le titre est requis." };
    }
    patch.title = t;
  }
  if (input.description !== undefined) {
    patch.description = input.description?.trim() || null;
  }
  if (typeof input.price === "number" && Number.isFinite(input.price) && input.price >= 0) {
    patch.price = input.price;
  }
  if (typeof input.currency === "string" && input.currency.trim()) {
    patch.currency = input.currency.trim().toLowerCase();
  }
  if (input.status === "draft" || input.status === "published") {
    patch.status = input.status;
  }

  if (Object.keys(patch).length === 0) {
    return { ok: true };
  }

  const { error } = await supabase
    .from("courses")
    .update(patch)
    .eq("id", input.courseId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCourse(input.courseId);
  return { ok: true };
}

export async function createCourseModuleServer(input: {
  courseId: string;
  title?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const title = (input.title ?? "Nouveau module").trim() || "Nouveau module";

  const { data: last } = await supabase
    .from("course_modules")
    .select("position")
    .eq("course_id", input.courseId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (last?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("course_modules")
    .insert({
      course_id: input.courseId,
      title,
      position,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCourse(input.courseId);
  return { ok: true, id: data.id };
}

export async function updateCourseModuleServer(input: {
  moduleId: string;
  courseId: string;
  title: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Le titre du module est requis." };
  }

  const { error } = await supabase
    .from("course_modules")
    .update({ title })
    .eq("id", input.moduleId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCourse(input.courseId);
  return { ok: true };
}

export async function deleteCourseModuleServer(input: {
  moduleId: string;
  courseId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const { error } = await supabase
    .from("course_modules")
    .delete()
    .eq("id", input.moduleId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCourse(input.courseId);
  return { ok: true };
}

export async function createCourseLessonServer(input: {
  moduleId: string;
  courseId: string;
  title?: string;
  contentType?: "video" | "text" | "pdf" | "audio";
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const title = (input.title ?? "Nouvelle leçon").trim() || "Nouvelle leçon";
  const contentType = input.contentType ?? "text";

  const { data: last } = await supabase
    .from("course_lessons")
    .select("position")
    .eq("module_id", input.moduleId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (last?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("course_lessons")
    .insert({
      module_id: input.moduleId,
      title,
      content_type: contentType,
      position,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCourse(input.courseId);
  return { ok: true, id: data.id };
}

export async function updateCourseLessonServer(input: {
  lessonId: string;
  courseId: string;
  title?: string;
  content_type?: "video" | "text" | "pdf" | "audio";
  content_text?: string | null;
  content_url?: string | null;
  duration?: number | null;
  is_free_preview?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const patch: Record<string, unknown> = {};
  if (typeof input.title === "string") {
    const t = input.title.trim();
    if (!t) {
      return { ok: false, error: "Le titre de la leçon est requis." };
    }
    patch.title = t;
  }
  if (input.content_type) {
    patch.content_type = input.content_type;
  }
  if (input.content_text !== undefined) {
    patch.content_text = input.content_text;
  }
  if (input.content_url !== undefined) {
    patch.content_url = input.content_url;
  }
  if (input.duration !== undefined) {
    patch.duration = input.duration;
  }
  if (typeof input.is_free_preview === "boolean") {
    patch.is_free_preview = input.is_free_preview;
  }

  if (Object.keys(patch).length === 0) {
    return { ok: true };
  }

  const { error } = await supabase
    .from("course_lessons")
    .update(patch)
    .eq("id", input.lessonId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCourse(input.courseId);
  return { ok: true };
}

export async function deleteCourseLessonServer(input: {
  lessonId: string;
  courseId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const { error } = await supabase
    .from("course_lessons")
    .delete()
    .eq("id", input.lessonId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCourse(input.courseId);
  return { ok: true };
}

export async function createCourseServer(input: {
  title: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);

  if (!workspaceId) {
    return { ok: false, error: "Aucun workspace." };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Le titre est requis." };
  }

  const { data, error } = await supabase
    .from("courses")
    .insert({
      workspace_id: workspaceId,
      title,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateCourse(data.id);
  return { ok: true, id: data.id };
}
