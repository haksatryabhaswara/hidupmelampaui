// ─── Xendit Payment Gateway Configuration ───────────────────────────────────
// Dashboard: https://dashboard.xendit.co/settings/developers
// Docs: https://developers.xendit.co/api-reference/
//
// Add these to your .env.local file:
//   XENDIT_SECRET_KEY=xnd_production_...
//   XENDIT_WEBHOOK_TOKEN=...
//   NEXT_PUBLIC_BASE_URL=https://yourdomain.com

export const xenditConfig = {
  /** Server-side secret key — never expose to the browser */
  secretKey: process.env.XENDIT_SECRET_KEY ?? "xnd_development_YOUR_SECRET_KEY",
  /** Callback verification token — set in Xendit dashboard → Webhooks */
  webhookToken: process.env.XENDIT_WEBHOOK_TOKEN ?? "YOUR_XENDIT_WEBHOOK_TOKEN",
  /** Public base URL used to build redirect URLs */
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
};

export interface XenditInvoice {
  id: string;
  external_id: string;
  invoice_url: string;
  status: string;
  amount: number;
}

export async function createXenditInvoice(params: {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
}): Promise<XenditInvoice> {
  const response = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${xenditConfig.secretKey}:`).toString("base64")}`,
    },
    body: JSON.stringify({
      external_id: params.externalId,
      amount: params.amount,
      payer_email: params.payerEmail,
      description: params.description,
      success_redirect_url: params.successRedirectUrl,
      failure_redirect_url: params.failureRedirectUrl,
      currency: "IDR",
    }),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "Gagal membuat invoice Xendit");
  }

  return response.json() as Promise<XenditInvoice>;
}
