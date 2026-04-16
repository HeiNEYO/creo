-- Slugs pour /learn/{slug}, normalisation, unicité globale des cours publiés.
-- Ce fichier est idempotent : tu peux l’exécuter seul dans l’éditeur SQL même si
-- 20260416120000 n’a pas encore été appliquée (colonnes + index workspace + RLS si besoin).

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS compare_at_price numeric(12, 2);

COMMENT ON COLUMN public.courses.slug IS 'Identifiant URL unique par workspace pour /learn/{slug}';
COMMENT ON COLUMN public.courses.compare_at_price IS 'Prix barré (optionnel) si supérieur au prix affiché';

CREATE UNIQUE INDEX IF NOT EXISTS courses_workspace_slug_lower_unique
  ON public.courses (workspace_id, lower(slug))
  WHERE slug IS NOT NULL AND length(trim(slug)) > 0;

-- RLS lecture publique (anon) si les politiques n’existent pas encore
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'courses'
      AND policyname = 'courses_select_published_public'
  ) THEN
    CREATE POLICY "courses_select_published_public"
      ON public.courses
      FOR SELECT
      TO anon, authenticated
      USING (status = 'published');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'course_modules'
      AND policyname = 'course_modules_select_published_public'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'course_lessons'
      AND policyname = 'course_lessons_select_published_public'
  ) THEN
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
  END IF;
END $$;

UPDATE public.courses
SET slug = lower(trim(slug))
WHERE slug IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS courses_published_slug_lower_global_unique
  ON public.courses (lower(trim(slug)))
  WHERE status = 'published'
    AND slug IS NOT NULL
    AND length(trim(slug)) > 0;
