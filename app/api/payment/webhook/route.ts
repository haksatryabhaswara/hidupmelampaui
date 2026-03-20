import { NextRequest, NextResponse } from "next/server";
import { xenditConfig } from "@/lib/xendit";
import { getAdminApp } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  // Verify Xendit callback token
  const token = request.headers.get("x-callback-token");
  if (token !== xenditConfig.webhookToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      external_id: string;
      status: string;
      amount: number;
    };

    const { external_id, status, amount } = body;

    // Only process PAID invoices
    if (status !== "PAID") {
      return NextResponse.json({ received: true });
    }

    // external_id format: konten_{contentId}_{userId}_{timestamp}
    const parts = external_id.split("_");
    if (parts[0] === "konten" && parts.length >= 4) {
      const contentId = parts[1];
      const userId = parts[2];

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getFirestore } = require("firebase-admin/firestore");
      const db = getFirestore(getAdminApp());

      await db.doc(`purchases/${userId}_${contentId}`).set({
        userId,
        contentId,
        status: "paid",
        amount,
        paidAt: new Date().toISOString(),
        externalId: external_id,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Xendit webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
