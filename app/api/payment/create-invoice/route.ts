import { NextRequest, NextResponse } from "next/server";
import { createXenditInvoice, xenditConfig } from "@/lib/xendit";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      contentId: string;
      contentTitle: string;
      price: number;
      userId: string;
      userEmail: string;
      contentSlug?: string;
      successRedirectUrl?: string;
      failureRedirectUrl?: string;
    };

    const { contentId, contentTitle, price, userId, userEmail, contentSlug, successRedirectUrl, failureRedirectUrl } = body;
    const urlSlug = contentSlug ?? contentId;

    if (!contentId || !price || !userId || !userEmail) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Format: konten_{contentId}_{userId}_{timestamp}
    const externalId = `konten_${contentId}_${userId}_${Date.now()}`;

    const invoice = await createXenditInvoice({
      externalId,
      amount: price,
      payerEmail: userEmail,
      description: `Akses Konten: ${contentTitle}`,
      successRedirectUrl: successRedirectUrl ?? `${xenditConfig.baseUrl}/konten/${urlSlug}?payment=success`,
      failureRedirectUrl: failureRedirectUrl ?? `${xenditConfig.baseUrl}/konten/${urlSlug}?payment=failed`,
    });

    return NextResponse.json({
      invoiceUrl: invoice.invoice_url,
      invoiceId: invoice.id,
      externalId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
