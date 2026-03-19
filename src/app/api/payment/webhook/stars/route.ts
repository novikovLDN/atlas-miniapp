import { NextRequest, NextResponse } from "next/server";
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
    const plan = payload.plan === "plus" ? "plus" : "basic";

    if (!userId) {
      console.error("Stars webhook: missing user_id in payload");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Extend or create subscription (30 days)
    await pool.query(
      `UPDATE subscriptions
       SET expires_at = GREATEST(expires_at, NOW()) + INTERVAL '30 days',
           subscription_type = $2
       WHERE telegram_id = $1`,
      [userId, plan],
    );

    console.log(`Stars payment: user ${userId} → ${plan} subscription extended`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Stars webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
