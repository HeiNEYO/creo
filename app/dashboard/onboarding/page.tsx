import { redirect } from "next/navigation";

/** Ancien chemin : redirige vers le questionnaire (optionnel). */
export default function LegacyOnboardingRedirect() {
  redirect("/dashboard/questionnaire");
}
