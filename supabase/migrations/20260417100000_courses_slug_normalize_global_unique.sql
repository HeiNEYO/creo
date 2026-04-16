-- Slugs cohérents en minuscules pour /learn/{slug} et unicité globale des cours publiés
-- (évite qu’une même URL ne pointe vers plusieurs formations de workspaces différents).

UPDATE public.courses
SET slug = lower(trim(slug))
WHERE slug IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS courses_published_slug_lower_global_unique
  ON public.courses (lower(trim(slug)))
  WHERE status = 'published'
    AND slug IS NOT NULL
    AND length(trim(slug)) > 0;
