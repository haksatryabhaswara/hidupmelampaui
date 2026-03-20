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
    };

    const { contentId, contentTitle, price, userId, userEmail } = body;

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
      successRedirectUrl: `${xenditConfig.baseUrl}/konten/${contentId}?payment=success`,
      failureRedirectUrl: `${xenditConfig.baseUrl}/konten/${contentId}?payment=failed`,
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
