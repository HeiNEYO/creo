export type CourseLessonDTO = {
  id: string;
  module_id: string;
  title: string;
  content_type: "video" | "text" | "pdf" | "audio";
  content_url: string | null;
  content_text: string | null;
  duration: number | null;
  position: number;
  is_free_preview: boolean;
};

export type CourseModuleDTO = {
  id: string;
  course_id: string;
  title: string;
  position: number;
  lessons: CourseLessonDTO[];
};

export type CourseStructureDTO = {
  modules: CourseModuleDTO[];
};
