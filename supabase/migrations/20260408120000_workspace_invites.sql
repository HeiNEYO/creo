-- Invitations d’équipe (email + token) + acceptation sécurisée (email invité = auth).

CREATE TABLE public.workspace_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  token text NOT NULL UNIQUE,
  invited_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at timestamptz,
  CONSTRAINT workspace_invites_role_check CHECK (role IN ('admin', 'member')),
  CONSTRAINT workspace_invites_email_nonempty CHECK (length(trim(email)) > 0)
);

CREATE INDEX idx_workspace_invites_workspace_id ON public.workspace_invites (workspace_id);
CREATE INDEX idx_workspace_invites_token ON public.workspace_invites (token);

CREATE UNIQUE INDEX workspace_invites_workspace_email_pending
  ON public.workspace_invites (workspace_id, lower(trim(email)))
  WHERE accepted_at IS NULL;

ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_invites_select"
  ON public.workspace_invites FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "workspace_invites_insert"
  ON public.workspace_invites FOR INSERT
  TO authenticated
  WITH CHECK (public.can_manage_workspace(workspace_id));

CREATE POLICY "workspace_invites_delete"
  ON public.workspace_invites FOR DELETE
  TO authenticated
  USING (public.can_manage_workspace(workspace_id));

CREATE OR REPLACE FUNCTION public.accept_workspace_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  inv public.workspace_invites%ROWTYPE;
  uemail text;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Non connecté.');
  END IF;

  IF p_token IS NULL OR length(trim(p_token)) < 10 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Lien d’invitation invalide.');
  END IF;

  SELECT email INTO uemail FROM auth.users WHERE id = uid;
  IF uemail IS NULL OR length(trim(uemail)) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Email du compte introuvable.');
  END IF;

  SELECT * INTO inv
  FROM public.workspace_invites
  WHERE token = trim(p_token)
    AND accepted_at IS NULL
    AND expires_at > now()
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Invitation invalide ou expirée.');
  END IF;

  IF lower(trim(uemail)) <> lower(trim(inv.email)) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Connecte-toi avec l’email qui a reçu l’invitation (' || trim(inv.email) || ').'
    );
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = inv.workspace_id
      AND wm.user_id = uid
  ) THEN
    UPDATE public.workspace_invites
    SET accepted_at = now()
    WHERE id = inv.id;
    RETURN jsonb_build_object('ok', true, 'workspace_id', inv.workspace_id, 'already_member', true);
  END IF;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (inv.workspace_id, uid, inv.role);

  UPDATE public.workspace_invites
  SET accepted_at = now()
  WHERE id = inv.id;

  RETURN jsonb_build_object('ok', true, 'workspace_id', inv.workspace_id, 'already_member', false);
END;
$$;

REVOKE ALL ON FUNCTION public.accept_workspace_invite(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_workspace_invite(text) TO authenticated;
