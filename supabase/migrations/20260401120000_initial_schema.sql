-- CRÉO — schéma initial + RLS (accès par appartenance au workspace)
-- Exécuter via Supabase CLI (`supabase db push`) ou SQL Editor du dashboard.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profils (liés à auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Workspaces
-- ---------------------------------------------------------------------------
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  owner_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  plan text NOT NULL DEFAULT 'starter',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT workspaces_plan_check CHECK (
    plan IN ('starter', 'creator', 'pro', 'agency')
  )
);

CREATE INDEX idx_workspaces_owner_id ON public.workspaces (owner_id);

-- ---------------------------------------------------------------------------
-- Membres workspace
-- ---------------------------------------------------------------------------
CREATE TABLE public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT workspace_members_role_check CHECK (
    role IN ('owner', 'admin', 'member')
  ),
  CONSTRAINT workspace_members_workspace_user_unique UNIQUE (workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_user_id ON public.workspace_members (user_id);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members (workspace_id);

-- ---------------------------------------------------------------------------
-- Pages (builder JSON)
-- ---------------------------------------------------------------------------
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  slug text NOT NULL,
  type text NOT NULL DEFAULT 'custom',
  content jsonb NOT NULL DEFAULT '{"id":"","blocks":[]}'::jsonb,
  published boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  thumbnail_url text,
  views bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pages_type_check CHECK (
    type IN ('landing', 'sales', 'optin', 'thankyou', 'checkout', 'custom')
  ),
  CONSTRAINT pages_workspace_slug_unique UNIQUE (workspace_id, slug)
);

CREATE INDEX idx_pages_workspace_id ON public.pages (workspace_id);

-- ---------------------------------------------------------------------------
-- Tunnels
-- ---------------------------------------------------------------------------
CREATE TABLE public.funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  name text NOT NULL,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_funnels_workspace_id ON public.funnels (workspace_id);

-- ---------------------------------------------------------------------------
-- Formations
-- ---------------------------------------------------------------------------
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  price numeric(12, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL DEFAULT 'draft',
  access_type text NOT NULL DEFAULT 'paid',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT courses_status_check CHECK (status IN ('draft', 'published')),
  CONSTRAINT courses_access_type_check CHECK (
    access_type IN ('paid', 'free', 'members_only')
  )
);

CREATE INDEX idx_courses_workspace_id ON public.courses (workspace_id);

CREATE TABLE public.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  title text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_course_modules_course_id ON public.course_modules (course_id);

CREATE TABLE public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.course_modules (id) ON DELETE CASCADE,
  title text NOT NULL,
  content_type text NOT NULL DEFAULT 'text',
  content_url text,
  content_text text,
  duration integer,
  position integer NOT NULL DEFAULT 0,
  is_free_preview boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_lessons_content_type_check CHECK (
    content_type IN ('video', 'text', 'pdf', 'audio')
  )
);

CREATE INDEX idx_course_lessons_module_id ON public.course_lessons (module_id);

-- ---------------------------------------------------------------------------
-- Contacts
-- ---------------------------------------------------------------------------
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  phone text,
  tags text[] NOT NULL DEFAULT '{}',
  custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  subscribed boolean NOT NULL DEFAULT true,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contacts_workspace_email_unique UNIQUE (workspace_id, email)
);

CREATE INDEX idx_contacts_workspace_id ON public.contacts (workspace_id);
CREATE INDEX idx_contacts_email ON public.contacts (email);

-- ---------------------------------------------------------------------------
-- Emails — campagnes & séquences
-- ---------------------------------------------------------------------------
CREATE TABLE public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL DEFAULT '',
  preview_text text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_campaigns_status_check CHECK (
    status IN ('draft', 'scheduled', 'sent')
  )
);

CREATE INDEX idx_email_campaigns_workspace_id ON public.email_campaigns (workspace_id);

CREATE TABLE public.email_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  name text NOT NULL,
  trigger_type text NOT NULL DEFAULT 'manual',
  trigger_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_sequences_workspace_id ON public.email_sequences (workspace_id);

CREATE TABLE public.email_sequence_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid NOT NULL REFERENCES public.email_sequences (id) ON DELETE CASCADE,
  subject text NOT NULL DEFAULT '',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  delay_days integer NOT NULL DEFAULT 0,
  delay_hours integer NOT NULL DEFAULT 0,
  position integer NOT NULL DEFAULT 0
);

CREATE INDEX idx_email_sequence_steps_sequence_id ON public.email_sequence_steps (sequence_id);

-- ---------------------------------------------------------------------------
-- Commandes
-- ---------------------------------------------------------------------------
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts (id) ON DELETE SET NULL,
  product_type text NOT NULL,
  product_id uuid,
  amount numeric(12, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_product_type_check CHECK (
    product_type IN ('course', 'membership')
  ),
  CONSTRAINT orders_status_check CHECK (
    status IN (
      'pending',
      'paid',
      'failed',
      'refunded',
      'canceled'
    )
  )
);

CREATE INDEX idx_orders_workspace_id ON public.orders (workspace_id);
CREATE INDEX idx_orders_contact_id ON public.orders (contact_id);

-- ---------------------------------------------------------------------------
-- Inscriptions & progression
-- ---------------------------------------------------------------------------
CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.contacts (id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT enrollments_course_contact_unique UNIQUE (course_id, contact_id)
);

CREATE INDEX idx_enrollments_workspace_id ON public.enrollments (workspace_id);
CREATE INDEX idx_enrollments_contact_id ON public.enrollments (contact_id);

CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES public.enrollments (id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.course_lessons (id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  last_viewed_at timestamptz,
  CONSTRAINT lesson_progress_enrollment_lesson_unique UNIQUE (enrollment_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_enrollment_id ON public.lesson_progress (enrollment_id);

-- ---------------------------------------------------------------------------
-- Communauté
-- ---------------------------------------------------------------------------
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  author_type text NOT NULL,
  title text,
  content text NOT NULL DEFAULT '',
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_posts_author_type_check CHECK (
    author_type IN ('creator', 'member')
  )
);

CREATE INDEX idx_community_posts_workspace_id ON public.community_posts (workspace_id);

-- ---------------------------------------------------------------------------
-- Affiliés
-- ---------------------------------------------------------------------------
CREATE TABLE public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.contacts (id) ON DELETE CASCADE,
  code text NOT NULL,
  commission_percent numeric(5, 2) NOT NULL DEFAULT 0,
  total_earned numeric(12, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT affiliates_status_check CHECK (status IN ('pending', 'active')),
  CONSTRAINT affiliates_workspace_code_unique UNIQUE (workspace_id, code)
);

CREATE INDEX idx_affiliates_workspace_id ON public.affiliates (workspace_id);

-- ---------------------------------------------------------------------------
-- Analytics
-- ---------------------------------------------------------------------------
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  page_id uuid REFERENCES public.pages (id) ON DELETE SET NULL,
  event_type text NOT NULL,
  session_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT analytics_events_event_type_check CHECK (
    event_type IN ('view', 'click', 'conversion')
  )
);

CREATE INDEX idx_analytics_events_workspace_id ON public.analytics_events (workspace_id);
CREATE INDEX idx_analytics_events_page_id ON public.analytics_events (page_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events (created_at);

-- ---------------------------------------------------------------------------
-- Cohérence workspace (contact / course / enrollment / commande / affilié)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_enrollment_workspace_consistency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  course_ws uuid;
  contact_ws uuid;
BEGIN
  SELECT c.workspace_id INTO course_ws FROM public.courses c WHERE c.id = NEW.course_id;
  SELECT ct.workspace_id INTO contact_ws FROM public.contacts ct WHERE ct.id = NEW.contact_id;
  IF course_ws IS NULL THEN
    RAISE EXCEPTION 'enrollments: course_id invalide';
  END IF;
  IF contact_ws IS NULL THEN
    RAISE EXCEPTION 'enrollments: contact_id invalide';
  END IF;
  IF NEW.workspace_id IS DISTINCT FROM course_ws
     OR NEW.workspace_id IS DISTINCT FROM contact_ws THEN
    RAISE EXCEPTION 'enrollments.workspace_id doit correspondre au cours et au contact';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enrollments_workspace_consistency
  BEFORE INSERT OR UPDATE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_enrollment_workspace_consistency();

CREATE OR REPLACE FUNCTION public.enforce_order_contact_workspace()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.contact_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.contacts ct
    WHERE ct.id = NEW.contact_id
      AND ct.workspace_id = NEW.workspace_id
  ) THEN
    RAISE EXCEPTION 'orders: le contact doit appartenir au même workspace';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_contact_workspace
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_order_contact_workspace();

CREATE OR REPLACE FUNCTION public.enforce_affiliate_contact_workspace()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.contacts ct
    WHERE ct.id = NEW.contact_id
      AND ct.workspace_id = NEW.workspace_id
  ) THEN
    RAISE EXCEPTION 'affiliates: le contact doit appartenir au même workspace';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER affiliates_contact_workspace
  BEFORE INSERT OR UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_affiliate_contact_workspace();

-- ---------------------------------------------------------------------------
-- Triggers updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER pages_set_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Nouvel utilisateur → profil
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS — fonctions helper (SECURITY DEFINER, search_path fixé)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspaces w
    WHERE w.id = ws_id
      AND w.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = ws_id
      AND wm.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_workspace(ws_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspaces w
    WHERE w.id = ws_id
      AND w.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = ws_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS — activer sur toutes les tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Policies : profiles
-- ---------------------------------------------------------------------------
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Policies : workspaces
-- ---------------------------------------------------------------------------
CREATE POLICY "workspaces_select_member"
  ON public.workspaces FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(id));

CREATE POLICY "workspaces_insert_owner"
  ON public.workspaces FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_update_manager"
  ON public.workspaces FOR UPDATE
  TO authenticated
  USING (public.can_manage_workspace(id))
  WITH CHECK (public.can_manage_workspace(id));

CREATE POLICY "workspaces_delete_owner"
  ON public.workspaces FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Policies : workspace_members
-- ---------------------------------------------------------------------------
CREATE POLICY "workspace_members_select"
  ON public.workspace_members FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "workspace_members_insert"
  ON public.workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_manage_workspace(workspace_id)
    OR EXISTS (
        SELECT 1
        FROM public.workspaces w
        WHERE w.id = workspace_id
          AND w.owner_id = auth.uid()
          AND user_id = auth.uid()
      )
  );

CREATE POLICY "workspace_members_update"
  ON public.workspace_members FOR UPDATE
  TO authenticated
  USING (public.can_manage_workspace(workspace_id))
  WITH CHECK (public.can_manage_workspace(workspace_id));

CREATE POLICY "workspace_members_delete"
  ON public.workspace_members FOR DELETE
  TO authenticated
  USING (
    public.can_manage_workspace(workspace_id)
    OR user_id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- Policies : tables scoping workspace_id (CRUD membre)
-- ---------------------------------------------------------------------------
CREATE POLICY "pages_all"
  ON public.pages FOR ALL
  TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "funnels_all"
  ON public.funnels FOR ALL
  TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "courses_all"
  ON public.courses FOR ALL
  TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "course_modules_all"
  ON public.course_modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.courses c
      WHERE c.id = course_id
        AND public.is_workspace_member(c.workspace_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.courses c
      WHERE c.id = course_id
        AND public.is_workspace_member(c.workspace_id)
    )
  );

CREATE POLICY "course_lessons_all"
  ON public.course_lessons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.course_modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = module_id
        AND public.is_workspace_member(c.workspace_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.course_modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = module_id
        AND public.is_workspace_member(c.workspace_id)
    )
  );

CREATE POLICY "contacts_all"
  ON public.contacts FOR ALL
  TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "email_campaigns_all"
  ON public.email_campaigns FOR ALL
  TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "email_sequences_all"
  ON public.email_sequences FOR ALL
  TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "email_sequence_steps_all"
  ON public.email_sequence_steps FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.email_sequences s
      WHERE s.id = sequence_id
        AND public.is_workspace_member(s.workspace_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.email_sequences s
      WHERE s.id = sequence_id
        AND public.is_workspace_member(s.workspace_id)
    )
  );

CREATE POLICY "orders_all"
  ON public.orders FOR ALL
  TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "enrollments_all"
  ON public.enrollments FOR ALL
  TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "lesson_progress_all"
  ON public.lesson_progress FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.enrollments e
      WHERE e.id = enrollment_id
        AND public.is_workspace_member(e.workspace_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.enrollments e
      WHERE e.id = enrollment_id
        AND public.is_workspace_member(e.workspace_id)
    )
  );

CREATE POLICY "community_posts_all"
  ON public.community_posts FOR ALL
  TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "affiliates_all"
  ON public.affiliates FOR ALL
  TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "analytics_events_all"
  ON public.analytics_events FOR ALL
  TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));
