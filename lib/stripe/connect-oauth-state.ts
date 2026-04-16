import { createHmac, timingSafeEqual } from "crypto";

const TTL_MS = 15 * 60 * 1000;

function getSecret(): string {
  const s =
    process.env.STRIPE_CONNECT_OAUTH_SECRET?.trim() || process.env.STRIPE_SECRET_KEY?.trim();
  if (!s) {
    throw new Error("STRIPE_SECRET_KEY ou STRIPE_CONNECT_OAUTH_SECRET requis pour OAuth Connect.");
  }
  return s;
}

const OAUTH_RETURN_PATHS = new Set(["/dashboard/integrations", "/dashboard/settings"]);

export function signConnectOAuthState(payload: {
  workspaceId: string;
  userId: string;
  /** Où rediriger après OAuth (pathname seulement, allowlist). */
  oauthReturnPath?: string;
}): string {
  const returnPath =
    payload.oauthReturnPath?.trim() && OAUTH_RETURN_PATHS.has(payload.oauthReturnPath.trim())
      ? payload.oauthReturnPath.trim()
      : "/dashboard/integrations";
  const data = {
    workspaceId: payload.workspaceId,
    userId: payload.userId,
    oauthReturnPath: returnPath,
    exp: Date.now() + TTL_MS,
  };
  const json = JSON.stringify(data);
  const b64 = Buffer.from(json, "utf8").toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

export function verifyConnectOAuthState(
  state: string | null
): { workspaceId: string; userId: string; oauthReturnPath: string } | null {
  if (!state?.includes(".")) {
    return null;
  }
  const [b64, sig] = state.split(".", 2);
  if (!b64 || !sig) {
    return null;
  }
  let expected: string;
  try {
    expected = createHmac("sha256", getSecret()).update(b64).digest("base64url");
  } catch {
    return null;
  }
  const sigBuf = Buffer.from(sig, "utf8");
  const expBuf = Buffer.from(expected, "utf8");
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const json = Buffer.from(b64, "base64url").toString("utf8");
    const data = JSON.parse(json) as {
      workspaceId?: string;
      userId?: string;
      oauthReturnPath?: string;
      exp?: number;
    };
    if (!data.workspaceId || !data.userId || typeof data.exp !== "number") {
      return null;
    }
    if (Date.now() > data.exp) {
      return null;
    }
    const oauthReturnPath =
      data.oauthReturnPath?.trim() && OAUTH_RETURN_PATHS.has(data.oauthReturnPath.trim())
        ? data.oauthReturnPath.trim()
        : "/dashboard/integrations";
    return { workspaceId: data.workspaceId, userId: data.userId, oauthReturnPath };
  } catch {
    return null;
  }
}
