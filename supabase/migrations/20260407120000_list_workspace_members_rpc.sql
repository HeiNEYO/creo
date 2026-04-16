-- Membres du workspace avec email (auth.users) — visible uniquement si l’appelant est membre.

CREATE OR REPLACE FUNCTION public.list_workspace_members(p_workspace_id uuid)
RETURNS TABLE (
  user_id uuid,
  role text,
  email text,
  full_name text,
  avatar_url text,
  member_since timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    wm.user_id,
    wm.role::text,
    COALESCE(au.email::text, '') AS email,
    p.full_name,
    p.avatar_url,
    wm.created_at AS member_since
  FROM public.workspace_members wm
  LEFT JOIN auth.users au ON au.id = wm.user_id
  LEFT JOIN public.profiles p ON p.id = wm.user_id
  WHERE wm.workspace_id = p_workspace_id
    AND public.is_workspace_member(p_workspace_id)
  ORDER BY
    CASE wm.role
      WHEN 'owner' THEN 0
      WHEN 'admin' THEN 1
      ELSE 2
    END,
    wm.created_at ASC;
$$;

REVOKE ALL ON FUNCTION public.list_workspace_members(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_workspace_members(uuid) TO authenticated;
