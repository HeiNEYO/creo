function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPagePurchaseReceiptEmail(input: {
  to: string;
  productName: string;
  amountLabel: string;
  workspaceName: string;
  publicPageUrl: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false, error: "no_resend" };
  }

  const from = process.env.RESEND_FROM?.trim() || "onboarding@resend.dev";
  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const { error: sendErr } = await resend.emails.send({
    from,
    to: input.to.trim(),
    subject: `Confirmation de commande — ${input.productName}`,
    html: `
      <p>Bonjour,</p>
      <p>Ta commande a bien été enregistrée.</p>
      <p><strong>${escapeHtml(input.productName)}</strong> — ${escapeHtml(input.amountLabel)}</p>
      <p>Vendeur : <strong>${escapeHtml(input.workspaceName)}</strong></p>
      <p><a href="${escapeHtml(input.publicPageUrl)}">Retour à la page</a></p>
      <p style="color:#666;font-size:13px;">Conserve cet e-mail comme preuve de paiement. Pour toute question, contacte directement le vendeur.</p>
    `,
  });

  if (sendErr) {
    return { sent: false, error: sendErr.message };
  }
  return { sent: true };
}
