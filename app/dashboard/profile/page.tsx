import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/dashboard/profile/profile-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { supabase, user } = await getWorkspaceContext();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <PageHeader
        title="Mon profil"
        description="Photo, nom affiché et email (lecture seule)"
      />
      <ProfileForm
        userId={user.id}
        initialFullName={profile?.full_name ?? ""}
        initialAvatarUrl={profile?.avatar_url ?? ""}
        userEmail={user.email ?? ""}
      />
    </>
  );
}
