-- Bootstrap workspace : exécuté avec les droits du propriétaire de la fonction pour éviter
-- les échecs RLS quand le JWT n’est pas encore aligné avec PostgREST (Server Actions, etc.).
-- auth.uid() reste celui de l’appelant.

CREATE OR REPLACE FUNCTION public.ensure_default_workspace()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  au text;
  meta jsonb;
  v_full_name text;
  prefix text;
  slug text;
  new_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.user_id = uid LIMIT 1) THEN
    RETURN;
  END IF;

  SELECT u.email, u.raw_user_meta_data
  INTO au, meta
  FROM auth.users u
  WHERE u.id = uid;

  v_full_name := nullif(trim(meta ->> 'full_name'), '');
  IF v_full_name IS NOT NULL THEN
    UPDATE public.profiles p
    SET full_name = v_full_name
    WHERE p.id = uid;
  END IF;

  prefix := lower(split_part(coalesce(au, ''), '@', 1));
  prefix := regexp_replace(prefix, '[^a-z0-9]+', '-', 'g');
  prefix := regexp_replace(prefix, '(^-+|-+$)', '', 'g');
  IF prefix IS NULL OR prefix = '' THEN
    prefix := 'workspace';
  END IF;
  prefix := left(prefix, 48);

  slug := prefix || '-' || left(replace(gen_random_uuid()::text, '-', ''), 12);

  INSERT INTO public.workspaces (name, slug, owner_id)
  VALUES ('Mon workspace', slug, uid)
  RETURNING id INTO new_id;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_id, uid, 'owner');
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_default_workspace() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_default_workspace() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_default_workspace() TO service_role;
