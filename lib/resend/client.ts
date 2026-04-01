import { Resend } from "resend";

/** Client Resend côté serveur uniquement. */
export function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY doit être défini.");
  }
  return new Resend(apiKey);
}
