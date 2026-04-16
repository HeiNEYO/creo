-- Campagnes d'envoi vs modèles réutilisables (bibliothèque)
ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS is_template boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_email_campaigns_workspace_template
  ON public.email_campaigns (workspace_id, is_template);
