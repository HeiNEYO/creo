import { NextResponse } from "next/server";

/** Réponse JSON typée (route handlers Next.js). */
export function jsonData<T>(body: T, status = 200, init?: ResponseInit) {
  return NextResponse.json(body, { status, ...init });
}

/** Erreur JSON standard `{ error: string, ...extras }`. */
export function jsonError(
  message: string,
  status = 400,
  extras?: Record<string, unknown>
) {
  return NextResponse.json({ error: message, ...extras }, { status });
}
