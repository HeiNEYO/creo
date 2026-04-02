import type { SupabaseClient } from "@supabase/supabase-js";

import type { CourseStructureDTO, CourseLessonDTO } from "@/lib/courses/types";

type DbLesson = {
  id: string;
  module_id: string;
  title: string;
  content_type: string;
  content_url: string | null;
  content_text: string | null;
  duration: number | null;
  position: number;
  is_free_preview: boolean;
};

const CT = ["video", "text", "pdf", "audio"] as const;

function asContentType(v: string): CourseLessonDTO["content_type"] {
  return (CT.includes(v as (typeof CT)[number]) ? v : "text") as CourseLessonDTO["content_type"];
}

export async function loadCourseStructure(
  supabase: SupabaseClient,
  courseId: string
): Promise<CourseStructureDTO> {
  const { data: modules, error: mErr } = await supabase
    .from("course_modules")
    .select("id, course_id, title, position")
    .eq("course_id", courseId)
    .order("position", { ascending: true });

  if (mErr) {
    return { modules: [] };
  }
  if (!modules?.length) {
    return { modules: [] };
  }

  const moduleIds = modules.map((m) => m.id);
  const { data: lessons, error: lErr } = await supabase
    .from("course_lessons")
    .select(
      "id, module_id, title, content_type, content_url, content_text, duration, position, is_free_preview"
    )
    .in("module_id", moduleIds)
    .order("position", { ascending: true });

  if (lErr) {
    return {
      modules: modules.map((m) => ({
        id: m.id,
        course_id: m.course_id,
        title: m.title,
        position: m.position,
        lessons: [],
      })),
    };
  }

  const byModule = new Map<string, DbLesson[]>();
  for (const row of lessons ?? []) {
    const list = byModule.get(row.module_id) ?? [];
    list.push(row as DbLesson);
    byModule.set(row.module_id, list);
  }

  return {
    modules: modules.map((m) => ({
      id: m.id,
      course_id: m.course_id,
      title: m.title,
      position: m.position,
      lessons: (byModule.get(m.id) ?? []).map((l) => ({
        id: l.id,
        module_id: l.module_id,
        title: l.title,
        content_type: asContentType(l.content_type),
        content_url: l.content_url,
        content_text: l.content_text,
        duration: l.duration,
        position: l.position,
        is_free_preview: l.is_free_preview,
      })),
    })),
  };
}
