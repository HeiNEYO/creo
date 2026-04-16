-- Transfert de propriété : ancien owner → admin, nouveau owner → role owner + workspaces.owner_id

CREATE OR REPLACE FUNCTION public.transfer_workspace_ownership(
  p_workspace_id uuid,
  p_new_owner_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  cur_owner uuid;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Non connecté.');
  END IF;

  IF p_new_owner_id IS NULL OR p_new_owner_id = uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Choisis un autre membre comme nouveau propriétaire.');
  END IF;

  SELECT w.owner_id INTO cur_owner
  FROM public.workspaces w
  WHERE w.id = p_workspace_id
  LIMIT 1;

  IF cur_owner IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Workspace introuvable.');
  END IF;

  IF cur_owner <> uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Seul le propriétaire actuel peut transférer.');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = p_workspace_id
      AND wm.user_id = p_new_owner_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Ce membre ne fait pas partie du workspace.');
  END IF;

  UPDATE public.workspaces
  SET owner_id = p_new_owner_id
  WHERE id = p_workspace_id;

  UPDATE public.workspace_members
  SET role = 'admin'
  WHERE workspace_id = p_workspace_id
    AND user_id = uid;

  UPDATE public.workspace_members
  SET role = 'owner'
  WHERE workspace_id = p_workspace_id
    AND user_id = p_new_owner_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_workspace_ownership(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transfer_workspace_ownership(uuid, uuid) TO authenticated;
