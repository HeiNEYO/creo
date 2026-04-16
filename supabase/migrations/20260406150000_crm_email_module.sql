-- ---------------------------------------------------------------------------
-- CRM & Email Marketing — tables et extensions (workspace-scoped)
-- ---------------------------------------------------------------------------

-- Tags normalisés par workspace (contacts.tags text[] reste la source d’affichage rapide ; sync côté app)
CREATE TABLE public.workspace_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  color_hex text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT workspace_tags_workspace_slug_unique UNIQUE (workspace_id, slug)
);

CREATE INDEX idx_workspace_tags_workspace_id ON public.workspace_tags (workspace_id);

-- Segments dynamiques (règles JSON — évaluées côté serveur / jobs)
CREATE TABLE public.crm_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  name text NOT NULL,
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_crm_segments_workspace_id ON public.crm_segments (workspace_id);

-- Paramètres email par workspace
CREATE TABLE public.workspace_email_settings (
  workspace_id uuid PRIMARY KEY REFERENCES public.workspaces (id) ON DELETE CASCADE,
  from_name text,
  from_email text,
  reply_to text,
  double_opt_in boolean NOT NULL DEFAULT false,
  double_opt_in_subject text,
  double_opt_in_html text,
  verification_dns jsonb NOT NULL DEFAULT '{}'::jsonb,
  unsub_page_id uuid REFERENCES public.pages (id) ON DELETE SET NULL,
  confirm_page_id uuid REFERENCES public.pages (id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Événements email (ouvertures, clics, bounce, désabonnement — alimentés par webhooks / tracking futurs)
CREATE TABLE public.email_campaign_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.email_campaigns (id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts (id) ON DELETE SET NULL,
  event_type text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_campaign_events_workspace ON public.email_campaign_events (workspace_id);
CREATE INDEX idx_email_campaign_events_campaign ON public.email_campaign_events (campaign_id);
CREATE INDEX idx_email_campaign_events_contact ON public.email_campaign_events (contact_id);
CREATE INDEX idx_email_campaign_events_type ON public.email_campaign_events (event_type);

-- Historique des envois par contact (réception campagne)
CREATE TABLE public.contact_email_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.contacts (id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.email_campaigns (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contact_email_deliveries_unique UNIQUE (contact_id, campaign_id)
);

CREATE INDEX idx_contact_email_deliveries_contact ON public.contact_email_deliveries (contact_id);

-- Extensions contacts
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS crm_status text NOT NULL DEFAULT 'active';

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS engagement_score numeric(6, 2);

ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_crm_status_check;

ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_crm_status_check CHECK (
    crm_status IN ('active', 'unsubscribed', 'bounced', 'complained')
  );

-- Extensions campagnes
ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS sender_name text;

ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS sender_email text;

ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS scheduled_for timestamptz;

ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Europe/Paris';

ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS recipient_rules jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS stats jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.email_campaigns DROP CONSTRAINT IF EXISTS email_campaigns_status_check;

ALTER TABLE public.email_campaigns
  ADD CONSTRAINT email_campaigns_status_check CHECK (
    status IN ('draft', 'scheduled', 'sending', 'sent', 'paused')
  );

-- RLS
ALTER TABLE public.workspace_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_email_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_tags_all"
  ON public.workspace_tags FOR ALL
  TO authenticated
  USING (public.is_workspace_member (workspace_id))
  WITH CHECK (public.is_workspace_member (workspace_id));

CREATE POLICY "crm_segments_all"
  ON public.crm_segments FOR ALL
  TO authenticated
  USING (public.is_workspace_member (workspace_id))
  WITH CHECK (public.is_workspace_member (workspace_id));

CREATE POLICY "workspace_email_settings_all"
  ON public.workspace_email_settings FOR ALL
  TO authenticated
  USING (public.is_workspace_member (workspace_id))
  WITH CHECK (public.is_workspace_member (workspace_id));

CREATE POLICY "email_campaign_events_all"
  ON public.email_campaign_events FOR ALL
  TO authenticated
  USING (public.is_workspace_member (workspace_id))
  WITH CHECK (public.is_workspace_member (workspace_id));

CREATE POLICY "contact_email_deliveries_all"
  ON public.contact_email_deliveries FOR ALL
  TO authenticated
  USING (public.is_workspace_member (workspace_id))
  WITH CHECK (public.is_workspace_member (workspace_id));
