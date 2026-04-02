-- Onboarding profil, paramètres workspace, pages publiques (RPC sécurisées).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_json jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.profiles
SET onboarding_completed_at = now()
WHERE onboarding_completed_at IS NULL;

ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Page publiée : lecture sans révéler les workspaces non concernés.
CREATE OR REPLACE FUNCTION public.get_public_page(
  p_workspace_slug text,
  p_page_slug text
)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  content jsonb,
  seo_title text,
  seo_description text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.title,
    p.slug,
    p.content,
    p.seo_title,
    p.seo_description
  FROM public.pages p
  INNER JOIN public.workspaces w ON w.id = p.workspace_id
  WHERE w.slug = p_workspace_slug
    AND p.slug = p_page_slug
    AND p.published = true
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_page(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_page(text, text) TO anon, authenticated;

-- Compteur vues + événement analytics (appelable en anon pour pages publiées).
CREATE OR REPLACE FUNCTION public.track_public_page_view(
  p_workspace_slug text,
  p_page_slug text,
  p_session_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wid uuid;
  pid uuid;
BEGIN
  SELECT w.id, p.id
  INTO wid, pid
  FROM public.workspaces w
  INNER JOIN public.pages p ON p.workspace_id = w.id
  WHERE w.slug = p_workspace_slug
    AND p.slug = p_page_slug
    AND p.published = true
  LIMIT 1;

  IF pid IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.pages
  SET views = views + 1
  WHERE id = pid
    AND published = true;

  INSERT INTO public.analytics_events (workspace_id, page_id, event_type, session_id, metadata)
  VALUES (wid, pid, 'view', p_session_id, '{}'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.track_public_page_view(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_public_page_view(text, text, text) TO anon, authenticated;
