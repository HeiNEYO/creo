import Link from "next/link";
import { redirect } from "next/navigation";

import { OrdersView } from "@/components/dashboard/orders/orders-view";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { getWorkspaceOrdersEnriched } from "@/lib/orders/get-workspace-orders";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";

export const dynamic = "force-dynamic";

export default async function DashboardOrdersPage() {
  const { supabase, user, workspaceId } = await getWorkspaceContext();

  if (!user) {
    redirect("/login");
  }

  if (!workspaceId) {
    return (
      <Card className="p-8 text-center">
        <p className="text-creo-md font-medium text-creo-black">
          Workspace introuvable
        </p>
        <p className="mt-2 text-creo-sm text-creo-gray-500">
          Déconnecte-toi puis reconnecte-toi pour initialiser ton espace.
        </p>
        <Link href="/login" className={buttonVariants({ className: "mt-6" })}>
          Connexion
        </Link>
      </Card>
    );
  }

  const orders = await getWorkspaceOrdersEnriched(supabase, workspaceId);

  return <OrdersView orders={orders} />;
}
