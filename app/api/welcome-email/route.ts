import { NextResponse } from "next/server";

import { sendWelcomePlatformEmailOnce } from "@/lib/emails/welcome-platform";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Appelé depuis le navigateur après inscription (session cookie établie). */
export async function POST() {
  try {
    const supabase = createRouteHandlerClient();
    const user = await readAuthUser(supabase);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
    }

    const result = await sendWelcomePlatformEmailOnce(supabase, {
      id: user.id,
      email: user.email,
    });

    return NextResponse.json({
      ok: true,
      sent: result.sent,
      reason: result.reason,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur serveur.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
