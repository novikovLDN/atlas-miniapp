import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { randomUUID } from "crypto";
import { pool } from "@/lib/db";

/**
 * CryptoBot webhook handler.
 * CryptoBot sends invoice_paid updates via HTTP POST.
 * Signature is verified using HMAC-SHA256 with API token.
 */
export async function POST(request: NextRequest) {
  const cryptoBotToken = process.env.CRYPTOBOT_API_TOKEN?.trim();
  if (!cryptoBotToken) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Verify CryptoBot signature
    const signature = request.headers.get("crypto-pay-api-signature");
    if (signature) {
      const secret = crypto.createHash("sha256").update(cryptoBotToken).digest();
      const checkString = rawBody;
      const hmac = crypto.createHmac("sha256", secret).update(checkString).digest("hex");
      if (hmac !== signature) {
        console.error("CryptoBot webhook: signature mismatch");
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    // Only process paid invoices
    if (body.update_type !== "invoice_paid") {
      return NextResponse.json({ ok: true });
    }

    const invoice = body.payload;
    if (!invoice || invoice.status !== "paid") {
      return NextResponse.json({ ok: true });
    }

    const invoicePayload = JSON.parse(invoice.payload || "{}");
    const userId = invoicePayload.user_id;
    const tariff = invoicePayload.tariff === "business" ? "business" : invoicePayload.tariff === "plus" ? "plus" : "basic";
    const months = invoicePayload.months || 1;

    if (!userId) {
      console.error("CryptoBot webhook: missing user_id in payload");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Extend or create subscription
    const safeMonths = Math.min(Math.max(1, Number(months) || 1), 12);
    const uuid = randomUUID();
    const defaultVpnKey = `vless://${uuid}@0.0.0.0:0?security=reality#default`;
    await pool.query(
      `INSERT INTO subscriptions (telegram_id, subscription_type, expires_at, vpn_key)
       VALUES ($1, $2, NOW() + make_interval(months => $3), $4)
       ON CONFLICT (telegram_id) DO UPDATE
       SET expires_at = GREATEST(subscriptions.expires_at, NOW()) + make_interval(months => $3),
           subscription_type = $2`,
      [userId, tariff, safeMonths, defaultVpnKey],
    );

    console.log(`CryptoBot payment: user ${userId} → ${tariff} ${safeMonths}mo subscription extended`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("CryptoBot webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
