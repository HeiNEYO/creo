import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Le profil se gère dans Paramètres → Mon compte. */
export default function ProfilePage() {
  redirect("/dashboard/settings?section=account");
}
