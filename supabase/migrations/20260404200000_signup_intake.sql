-- Données du questionnaire post-inscription (style Typeform) pour l’équipe CRÉO / admin.
-- Pas d’obligation : champs optionnels jusqu’à complétion.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signup_intake jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS signup_intake_completed_at timestamptz;

COMMENT ON COLUMN public.profiles.signup_intake IS 'Réponses structurées du questionnaire (clé/valeur JSON).';
COMMENT ON COLUMN public.profiles.signup_intake_completed_at IS 'Horodatage quand l’utilisateur a terminé le questionnaire.';
