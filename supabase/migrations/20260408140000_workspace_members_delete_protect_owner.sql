-- Empêche de supprimer la ligne membre du propriétaire du workspace (même par un admin).
-- Permet encore à un non-propriétaire de quitter le workspace (suppression de sa propre ligne).

DROP POLICY IF EXISTS "workspace_members_delete" ON public.workspace_members;

CREATE POLICY "workspace_members_delete"
  ON public.workspace_members FOR DELETE
  TO authenticated
  USING (
    (
      user_id = auth.uid()
      AND NOT EXISTS (
        SELECT 1
        FROM public.workspaces w
        WHERE w.id = workspace_members.workspace_id
          AND w.owner_id = auth.uid()
      )
    )
    OR (
      public.can_manage_workspace(workspace_id)
      AND NOT EXISTS (
        SELECT 1
        FROM public.workspaces w
        WHERE w.id = workspace_members.workspace_id
          AND w.owner_id = workspace_members.user_id
      )
    )
  );
