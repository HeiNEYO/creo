-- Formations : slug public (/learn/{slug}), prix de comparaison (promo affichée),
-- lecture anonyme du contenu publié (modules + leçons).

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS compare_at_price numeric(12, 2);

COMMENT ON COLUMN public.courses.slug IS 'Identifiant URL unique par workspace pour /learn/{slug}';
COMMENT ON COLUMN public.courses.compare_at_price IS 'Prix barré (optionnel) si supérieur au prix affiché';

CREATE UNIQUE INDEX IF NOT EXISTS courses_workspace_slug_lower_unique
  ON public.courses (workspace_id, lower(slug))
  WHERE slug IS NOT NULL AND length(trim(slug)) > 0;

-- Lecture publique : formations publiées + arborescence associée
CREATE POLICY "courses_select_published_public"
  ON public.courses
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "course_modules_select_published_public"
  ON public.course_modules
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.courses c
      WHERE c.id = course_modules.course_id
        AND c.status = 'published'
    )
  );

CREATE POLICY "course_lessons_select_published_public"
  ON public.course_lessons
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.course_modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = course_lessons.module_id
        AND c.status = 'published'
    )
  );
