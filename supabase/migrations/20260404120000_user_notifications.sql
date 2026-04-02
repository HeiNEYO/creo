-- Notifications in-app (CRÉO → utilisateur). Insertions futures : service_role ou Edge Functions.

CREATE TABLE public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_notifications_user_id ON public.user_notifications (user_id);
CREATE INDEX idx_user_notifications_user_unread
  ON public.user_notifications (user_id)
  WHERE read_at IS NULL;

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_notifications_select_own"
  ON public.user_notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_notifications_update_own"
  ON public.user_notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Message d’accueil (une fois par utilisateur, sans doublon si la migration est rejouée).
INSERT INTO public.user_notifications (user_id, title, body, link)
SELECT
  p.id,
  'Bienvenue sur CRÉO',
  'Découvre le cockpit, crée une page et consulte tes analytics.',
  '/dashboard'
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1
  FROM public.user_notifications n
  WHERE n.user_id = p.id
);
