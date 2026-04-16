import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { resolveSettingsSectionId } from "@/components/dashboard/settings/settings-sections-config";
import { PaymentGatewaysSection } from "@/components/dashboard/settings/payment-gateways-section";
import { PlatformSubscriptionSection } from "@/components/dashboard/settings/platform-subscription-section";
import { WorkspaceDeleteDangerZone } from "@/components/dashboard/settings/workspace-delete-danger-zone";
import { WorkspaceDomainPrefsForm } from "@/components/dashboard/settings/workspace-domain-prefs-form";
import { WorkspaceGeneralForm } from "@/components/dashboard/settings/workspace-general-form";
import {
  WorkspaceTeamInvitesPanel,
  type PendingInviteRow,
} from "@/components/dashboard/settings/workspace-team-invites-panel";
import { WorkspaceTeamList, type WorkspaceMemberRow } from "@/components/dashboard/settings/workspace-team-list";
import { WorkspaceSiteBrandForm } from "@/components/dashboard/settings/workspace-site-brand-form";
import { AccountSignOutSection } from "@/components/dashboard/profile/account-sign-out-section";
import { ProfileForm } from "@/components/dashboard/profile/profile-form";
import { ThemeAppearanceSettings } from "@/components/settings/theme-appearance-settings";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  isPlatformSubscriptionStripeConfigured,
  missingPlatformStripePriceEnvKeys,
} from "@/lib/stripe/platform-subscription-prices";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";

export const dynamic = "force-dynamic";

const planLabels: Record<string, string> = {
  starter: "Starter",
  creator: "Creator",
  pro: "Pro",
  agency: "Agency",
};

function readExtras(settings: unknown): {
  favicon_url: string;
  public_site_title: string;
  custom_domain_desired: string;
  paypal_email: string;
} {
  const o =
    settings && typeof settings === "object" && !Array.isArray(settings)
      ? (settings as Record<string, unknown>)
      : {};
  const s = (k: string) => (typeof o[k] === "string" ? (o[k] as string) : "");
  return {
    favicon_url: s("favicon_url"),
    public_site_title: s("public_site_title"),
    custom_domain_desired: s("custom_domain_desired"),
    paypal_email: s("paypal_email"),
  };
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { supabase, user, workspaceId } = await getWorkspaceContext();
  if (!user) {
    redirect("/login");
  }

  const rawSection =
    typeof searchParams.section === "string"
      ? searchParams.section
      : undefined;
  const section = resolveSettingsSectionId(rawSection);

  const { data: workspace } = workspaceId
    ? await supabase
        .from("workspaces")
        .select(
          "name, slug, plan, owner_id, settings, stripe_connect_account_id, stripe_connect_charges_enabled, stripe_customer_id"
        )
        .eq("id", workspaceId)
        .maybeSingle()
    : { data: null };

  const extras = readExtras(workspace?.settings);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() ?? "";
  const publicPathBase = workspace?.slug
    ? `${appUrl || "https://…"}/p/${workspace.slug}`
    : "";
  const subdomainPreview =
    rootDomain && workspace?.slug
      ? `https://${workspace.slug}.${rootDomain}`
      : null;

  const connectOAuthClientIdConfigured = !!process.env.NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID?.trim();
  const stripeSecretConfigured = !!process.env.STRIPE_SECRET_KEY?.trim();
  const appUrlConfigured = !!process.env.NEXT_PUBLIC_APP_URL?.trim();
  const platformStripePricesConfigured = isPlatformSubscriptionStripeConfigured();
  const missingPlatformStripeEnvKeys = missingPlatformStripePriceEnvKeys();
  const platformPlan = typeof workspace?.plan === "string" ? workspace.plan : "starter";
  const stripeCustomerId =
    (workspace?.stripe_customer_id as string | null | undefined)?.trim() || null;

  let profileForAccount: { full_name: string | null; avatar_url: string | null } | null = null;
  if (section === "account") {
    const { data: prof } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    profileForAccount = prof;
  }

  let teamMembers: WorkspaceMemberRow[] = [];
  let teamListError: string | null = null;
  let canInviteTeam = false;
  let viewerTeamRole: "owner" | "admin" | "member" = "member";
  let pendingInvites: PendingInviteRow[] = [];
  if (section === "team" && workspaceId) {
    const { data: mem } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .maybeSingle();
    canInviteTeam = mem?.role === "owner" || mem?.role === "admin";
    if (mem?.role === "owner" || mem?.role === "admin" || mem?.role === "member") {
      viewerTeamRole = mem.role;
    }

    const { data: invData } = await supabase
      .from("workspace_invites")
      .select("id, email, role, created_at, expires_at")
      .eq("workspace_id", workspaceId)
      .is("accepted_at", null)
      .order("created_at", { ascending: false });

    if (Array.isArray(invData)) {
      pendingInvites = invData as PendingInviteRow[];
    }

    const { data, error } = await supabase.rpc("list_workspace_members", {
      p_workspace_id: workspaceId,
    });
    if (error) {
      teamListError = error.message;
    } else if (Array.isArray(data)) {
      teamMembers = data as WorkspaceMemberRow[];
    }
  }

  return (
    <>
      <div className="flex min-w-0 flex-col gap-8">
        <div className="min-w-0 w-full space-y-6">
          {section === "general" && (
            <div className="max-w-3xl space-y-4">
              <h2 className="text-creo-md font-semibold">Général</h2>
              <p className="text-creo-sm text-creo-gray-500">
                Identité interne du workspace (nom + slug utilisés dans les URLs publiques{" "}
                <code className="text-creo-xs">/p/…</code>).
              </p>
              {!workspaceId || !workspace ? (
                <p className="text-creo-sm text-creo-gray-500">
                  Aucun workspace associé à ce compte (ou migration Supabase incomplète : fonction{" "}
                  <code className="text-creo-xs">ensure_default_workspace</code>).{" "}
                  <Link href="/login" className="text-creo-purple underline">
                    Reconnecte-toi
                  </Link>{" "}
                  pour relancer la création automatique, ou applique les migrations dans le SQL Editor
                  Supabase.
                </p>
              ) : (
                <WorkspaceGeneralForm
                  initialName={workspace.name}
                  initialSlug={workspace.slug}
                />
              )}
            </div>
          )}

          {section === "site-brand" && (
            <div className="max-w-3xl space-y-4">
              <h2 className="text-creo-md font-semibold">Site & marque</h2>
              <p className="text-creo-sm text-creo-gray-500">
                Éléments visibles côté visiteurs (favicon, titre). Distinct du{" "}
                <Link href="/dashboard/settings?section=domain-dns" className="text-creo-purple underline">
                  domaine & DNS
                </Link>
                .
              </p>
              {!workspaceId || !workspace ? (
                <p className="text-creo-sm text-creo-gray-500">Workspace introuvable.</p>
              ) : (
                <WorkspaceSiteBrandForm
                  initialFaviconUrl={extras.favicon_url}
                  initialPublicSiteTitle={extras.public_site_title}
                />
              )}
            </div>
          )}

          {section === "domain-dns" && (
            <div className="space-y-6">
              <div className="max-w-3xl space-y-4">
                <h2 className="text-creo-md font-semibold">URLs publiques actuelles</h2>
                <p className="text-creo-sm text-creo-gray-500">
                  Tant qu’un domaine personnalisé n’est pas vérifié, les pages utilisent l’URL de la plateforme.
                </p>
                <ul className="space-y-3 text-creo-sm">
                  <li>
                    <span className="font-medium text-creo-gray-800 dark:text-foreground">
                      Chemin sur CRÉO
                    </span>
                    <div className="mt-1 break-all rounded-md bg-creo-gray-50 px-3 py-2 font-mono text-creo-xs text-creo-gray-700 dark:bg-white/5 dark:text-creo-gray-300">
                      {publicPathBase || "—"}/{"{slug-page}"}
                    </div>
                  </li>
                  {subdomainPreview ? (
                    <li>
                      <span className="font-medium text-creo-gray-800 dark:text-foreground">
                        Sous-domaine (si <code className="text-creo-xs">NEXT_PUBLIC_ROOT_DOMAIN</code> est
                        configuré)
                      </span>
                      <div className="mt-1 break-all rounded-md bg-creo-gray-50 px-3 py-2 font-mono text-creo-xs text-creo-gray-700 dark:bg-white/5 dark:text-creo-gray-300">
                        {subdomainPreview}/ → page <code className="text-creo-xs">accueil</code>
                      </div>
                    </li>
                  ) : (
                    <li className="text-creo-xs text-creo-gray-500">
                      Sous-domaines non actifs : définis <code>NEXT_PUBLIC_ROOT_DOMAIN</code> sur l’hébergeur
                      (ex. Vercel) + DNS wildcard <code>*.tondomaine.com</code> vers l’app.
                    </li>
                  )}
                </ul>
              </div>

              <div className="max-w-3xl space-y-4">
                <h2 className="text-creo-md font-semibold">Domaine personnalisé & DNS</h2>
                <p className="text-creo-sm text-creo-gray-500">
                  Objectif : pointer ton propre nom de domaine vers ton site CRÉO. Étapes typiques (à automatiser
                  ensuite) :
                </p>
                <ol className="list-decimal space-y-2 pl-5 text-creo-sm text-creo-gray-600 dark:text-creo-gray-400">
                  <li>
                    Choisis un nom (souvent un sous-domaine, ex.{" "}
                    <code className="text-creo-xs">boutique.tondomaine.com</code>).
                  </li>
                  <li>
                    Chez ton registrar, crée un enregistrement <strong>CNAME</strong> vers la cible indiquée par
                    ton hébergeur (ex. Vercel : <code className="text-creo-xs">cname.vercel-dns.com</code> ou la
                    valeur du projet).
                  </li>
                  <li>
                    Pour la racine du domaine (<code className="text-creo-xs">@</code>), utilise les enregistrements
                    A / ALIAS selon la doc Vercel ou un redirect vers le www.
                  </li>
                  <li>Une fois le DNS propagé, la plateforme pourra vérifier le domaine (fonction à venir).</li>
                </ol>
                {!workspaceId || !workspace ? (
                  <p className="text-creo-sm text-creo-gray-500">Workspace introuvable.</p>
                ) : (
                  <div className="border-t border-creo-gray-100 pt-6 dark:border-border">
                    <h3 className="mb-3 text-creo-sm font-semibold">Enregistrer ton objectif de domaine</h3>
                    <WorkspaceDomainPrefsForm
                      initialCustomDomainDesired={extras.custom_domain_desired}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {section === "payment-gateways" && (
            <Suspense
              fallback={
                <p className="text-center text-creo-sm text-creo-gray-500">Chargement…</p>
              }
            >
              <PaymentGatewaysSection
                platformPlan={platformPlan}
                connectOAuthClientIdConfigured={connectOAuthClientIdConfigured}
                stripeSecretConfigured={stripeSecretConfigured}
                appUrlConfigured={appUrlConfigured}
                platformStripePricesConfigured={platformStripePricesConfigured}
                initialStripeConnectAccountId={
                  (workspace?.stripe_connect_account_id as string | null | undefined) ?? null
                }
                initialStripeConnectChargesEnabled={
                  (workspace?.stripe_connect_charges_enabled as boolean | undefined) ?? false
                }
                paypalEmail={extras.paypal_email}
                workspaceReady={!!workspaceId && !!workspace}
              />
            </Suspense>
          )}

          {section === "subscription-creo" && (
            <Suspense
              fallback={
                <p className="text-center text-creo-sm text-creo-gray-500">Chargement…</p>
              }
            >
              <PlatformSubscriptionSection
                initialStripeCustomerId={stripeCustomerId}
                platformStripePricesConfigured={platformStripePricesConfigured}
                missingPlatformStripeEnvKeys={missingPlatformStripeEnvKeys}
                planLabel={
                  workspace?.plan ? (planLabels[workspace.plan] ?? workspace.plan) : "—"
                }
              />
            </Suspense>
          )}

          {section === "appearance" && (
            <div className="max-w-3xl space-y-4">
              <h2 className="text-creo-md font-semibold">Apparence</h2>
              <ThemeAppearanceSettings />
            </div>
          )}
          {section === "account" && (
            <div className="max-w-3xl space-y-8">
              <ProfileForm
                userId={user.id}
                initialFullName={profileForAccount?.full_name ?? ""}
                initialAvatarUrl={profileForAccount?.avatar_url ?? ""}
                userEmail={user.email ?? ""}
              />
              <div className="space-y-3 border-t border-border pt-8">
                <h3 className="text-creo-md font-semibold">Mot de passe</h3>
                <p className="text-creo-sm text-muted-foreground">
                  Réinitialisation sécurisée par e-mail.
                </p>
                <Link
                  href="/forgot-password"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Changer le mot de passe
                </Link>
              </div>
              <AccountSignOutSection />
            </div>
          )}
          {section === "team" && (
            <div className="max-w-3xl space-y-4">
              <h2 className="text-creo-md font-semibold">Équipe</h2>
              <p className="text-creo-sm text-creo-gray-500">
                Invite des collègues par e-mail, consulte les invitations en attente et la liste des
                membres.
              </p>
              {!workspaceId || !workspace ? (
                <p className="text-creo-sm text-creo-gray-500">Workspace introuvable.</p>
              ) : (
                <>
                  <WorkspaceTeamInvitesPanel
                    canInvite={canInviteTeam}
                    initialInvites={pendingInvites}
                  />
                  <div>
                    <h3 className="text-creo-sm font-semibold text-foreground">Membres actuels</h3>
                    {teamListError ? (
                      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-creo-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                        <p className="font-medium">Liste des membres indisponible</p>
                        <p className="mt-1 text-creo-xs opacity-90">
                          {teamListError.includes("list_workspace_members")
                            ? "Applique la migration Supabase « list_workspace_members » (fichier supabase/migrations/20260407120000_list_workspace_members_rpc.sql) puis réessaie."
                            : teamListError}
                        </p>
                      </div>
                    ) : teamMembers.length === 0 ? (
                      <p className="mt-3 text-creo-sm text-creo-gray-500">Aucun membre listé.</p>
                    ) : (
                      <div className="mt-3">
                        <WorkspaceTeamList
                          members={teamMembers}
                          currentUserId={user.id}
                          workspaceOwnerId={workspace.owner_id}
                          viewerRole={viewerTeamRole}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          {section === "danger" && (
            <div className="max-w-3xl space-y-4 rounded-xl border border-creo-danger/30 p-6">
              <h2 className="text-creo-md font-semibold text-creo-danger">
                Zone de danger
              </h2>
              <p className="text-creo-sm text-creo-gray-500">
                La suppression est définitive. Une fenêtre de confirmation t’explique les conséquences
                et demande de retaper le nom du workspace.
              </p>
              {!workspaceId || !workspace ? (
                <p className="text-creo-sm text-creo-gray-500">Workspace introuvable.</p>
              ) : (
                <WorkspaceDeleteDangerZone
                  workspaceName={workspace.name}
                  isOwner={workspace.owner_id === user.id}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
