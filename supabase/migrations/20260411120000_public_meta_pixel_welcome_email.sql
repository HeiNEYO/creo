-- Pixel Meta exposé aux pages publiques (consentement cookies côté app).
-- Email de bienvenue plateforme : horodatage pour n’envoyer qu’une fois.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamptz;

-- Intégrations (meta_pixel_id, webhook_url, etc.) — migration 20260403120000 ; requis si dépôt SQL partiel.
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Le type de retour (RETURNS TABLE) change : CREATE OR REPLACE seul est refusé par PostgreSQL (42P13).
DROP FUNCTION IF EXISTS public.get_public_page(text, text);

CREATE FUNCTION public.get_public_page(
  p_workspace_slug text,
  p_page_slug text
)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  type text,
  content jsonb,
  seo_title text,
  seo_description text,
  stripe_ready boolean,
  meta_pixel_id text
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
    p.type,
    p.content,
    p.seo_title,
    p.seo_description,
    COALESCE(w.stripe_connect_charges_enabled, false)
      AND w.stripe_connect_account_id IS NOT NULL AS stripe_ready,
    NULLIF(TRIM(w.settings ->> 'meta_pixel_id'), '') AS meta_pixel_id
  FROM public.pages p
  INNER JOIN public.workspaces w ON w.id = p.workspace_id
  WHERE w.slug = p_workspace_slug
    AND p.slug = p_page_slug
    AND p.published = true
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_page(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_page(text, text) TO anon, authenticated;
