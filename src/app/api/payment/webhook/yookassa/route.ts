import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

/**
 * YooKassa webhook handler.
 * Receives payment.succeeded notifications.
 * Configure webhook URL in YooKassa dashboard:
 * https://<domain>/api/payment/webhook/yookassa
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Only process succeeded payments
    if (body.event !== "payment.succeeded") {
      return NextResponse.json({ ok: true });
    }

    const payment = body.object;
    if (!payment || payment.status !== "succeeded") {
      return NextResponse.json({ ok: true });
    }

    const metadata = payment.metadata;
    if (!metadata?.user_id) {
      console.error("YooKassa webhook: missing user_id in metadata");
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }

    const userId = metadata.user_id;
    const tariff = metadata.tariff === "business" ? "business" : metadata.tariff === "plus" ? "plus" : "basic";
    const months = metadata.months || 1;

    const safeMonths = Math.min(Math.max(1, Number(months) || 1), 12);

    await pool.query(
      `UPDATE subscriptions
       SET expires_at = GREATEST(expires_at, NOW()) + make_interval(months => $3),
           subscription_type = $2
       WHERE telegram_id = $1`,
      [userId, tariff, safeMonths],
    );

    console.log(`YooKassa payment: user ${userId} → ${tariff} ${safeMonths}mo (${payment.payment_method?.type || "unknown"})`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("YooKassa webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
