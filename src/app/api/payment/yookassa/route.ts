import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

type TelegramUser = { id: number; first_name?: string; username?: string };

function validateInitData(
  initData: string,
  botToken: string,
): { valid: boolean; userId?: number; user?: TelegramUser } {
  try {
    const params = new URLSearchParams(initData);
    const data: Record<string, string> = {};
    params.forEach((v, k) => { data[k] = v; });

    const hash = data["hash"];
    const userStr = data["user"];
    if (!hash || !userStr) return { valid: false };

    let user: TelegramUser;
    try { user = JSON.parse(userStr) as TelegramUser; }
    catch { return { valid: false }; }
    if (!user || typeof user.id !== "number") return { valid: false };

    const checkString = Object.keys(data)
      .filter((k) => k !== "hash")
      .sort()
      .map((k) => `${k}=${data[k]}`)
      .join("\n");

    const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
    const hmac = crypto.createHmac("sha256", secret).update(checkString).digest("hex");

    if (hmac !== hash) return { valid: false };
    return { valid: true, userId: user.id, user };
  } catch {
    return { valid: false };
  }
}

export async function POST(request: NextRequest) {
  const botToken = process.env.BOT_TOKEN?.trim();
  const shopId = process.env.YOOKASSA_SHOP_ID?.trim();
  const secretKey = process.env.YOOKASSA_SECRET_KEY?.trim();

  if (!botToken || !shopId || !secretKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const initData = request.headers.get("x-telegram-init-data")?.trim() ?? "";
  if (!initData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { valid, userId } = validateInitData(initData, botToken);
  if (!valid || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const tariff = body.tariff || "basic";
    const months = body.months || 1;
    const clients = body.clients || 0;
    const rubAmount = body.amount_rub;
    const paymentType = body.payment_type; // "sbp" or "bank_card"

    if (!rubAmount || rubAmount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const tariffLabel = tariff === "business" ? "Business" : tariff === "plus" ? "Plus" : "Basic";
    const description = tariff === "business"
      ? `Atlas VPN ${tariffLabel} — ${clients} кл/день`
      : `Atlas VPN ${tariffLabel} — ${months} мес`;

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
    const idempotenceKey = crypto.randomUUID();

    const paymentBody: Record<string, unknown> = {
      amount: {
        value: `${rubAmount}.00`,
        currency: "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: appUrl || "https://t.me",
      },
      capture: true,
      description,
      metadata: {
        user_id: userId,
        tariff,
        months,
        clients,
      },
    };

    // Set payment method if specified
    if (paymentType === "sbp") {
      paymentBody.payment_method_data = { type: "sbp" };
    } else if (paymentType === "bank_card") {
      paymentBody.payment_method_data = { type: "bank_card" };
    }

    const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");

    const res = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`,
        "Idempotence-Key": idempotenceKey,
      },
      body: JSON.stringify(paymentBody),
    });

    const data = await res.json();

    if (!res.ok || !data.confirmation?.confirmation_url) {
      console.error("YooKassa createPayment error:", data);
      return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
    }

    return NextResponse.json({
      confirmation_url: data.confirmation.confirmation_url,
      payment_id: data.id,
    });
  } catch (err) {
    console.error("YooKassa payment error:", err);
    return NextResponse.json({ error: "Payment error" }, { status: 500 });
  }
}
