import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { pool } from "@/lib/db";

/**
 * Telegram Stars webhook handler.
 * Telegram sends successful_payment via Bot API webhook (Update object).
 * This endpoint should be registered as the bot's webhook URL
 * or called from the bot's webhook handler.
 */
export async function POST(request: NextRequest) {
  const botToken = process.env.BOT_TOKEN?.trim();
  const webhookSecret = process.env.STARS_WEBHOOK_SECRET?.trim();

  if (!botToken) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  // Verify webhook secret if configured
  if (webhookSecret) {
    const secret = request.headers.get("x-webhook-secret")?.trim();
    if (secret !== webhookSecret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const body = await request.json();

    // Telegram sends Update object with message.successful_payment
    const payment = body.message?.successful_payment;
    if (!payment) {
      // Might be a pre_checkout_query — answer it
      if (body.pre_checkout_query) {
        await fetch(`https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pre_checkout_query_id: body.pre_checkout_query.id,
            ok: true,
          }),
        });
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({ ok: true });
    }

    const payload = JSON.parse(payment.invoice_payload);
    const userId = payload.user_id;
    const tariff = payload.tariff === "business" ? "business" : payload.tariff === "plus" ? "plus" : "basic";
    const months = payload.months || 1;

    if (!userId) {
      console.error("Stars webhook: missing user_id in payload");
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

    console.log(`Stars payment: user ${userId} → ${tariff} ${months}mo subscription extended`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Stars webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
