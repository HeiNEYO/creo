-- Stripe Connect (compte vendeur) + champs pour pages publiques checkout.

ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS stripe_connect_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_connect_charges_enabled boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_workspaces_stripe_connect_account_id
  ON public.workspaces (stripe_connect_account_id)
  WHERE stripe_connect_account_id IS NOT NULL;

-- Inclut le type de page et si Stripe est prêt (paiements directs).
CREATE OR REPLACE FUNCTION public.get_public_page(
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
  stripe_ready boolean
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
      AND w.stripe_connect_account_id IS NOT NULL AS stripe_ready
  FROM public.pages p
  INNER JOIN public.workspaces w ON w.id = p.workspace_id
  WHERE w.slug = p_workspace_slug
    AND p.slug = p_page_slug
    AND p.published = true
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_page(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_page(text, text) TO anon, authenticated;
