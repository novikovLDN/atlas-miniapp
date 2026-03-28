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
  const cryptoBotToken = process.env.CRYPTOBOT_API_TOKEN?.trim();
  if (!botToken || !cryptoBotToken) {
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

    if (!rubAmount || rubAmount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const tariffLabel = tariff === "business" ? "Business" : tariff === "plus" ? "Plus" : "Basic";
    const title = `Atlas Secure ${tariffLabel}`;
    const description = tariff === "business"
      ? `${title} — ${clients} clients/day`
      : `${title} — ${months} mo`;

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

    // Create invoice via CryptoBot API
    const res = await fetch("https://pay.crypt.bot/api/createInvoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Crypto-Pay-API-Token": cryptoBotToken,
      },
      body: JSON.stringify({
        currency_type: "fiat",
        fiat: "RUB",
        amount: String(rubAmount),
        description,
        payload: JSON.stringify({ user_id: userId, tariff, months, clients }),
        accepted_assets: "USDT,TON,BTC,ETH",
        allow_comments: false,
        allow_anonymous: true,
        ...(appUrl ? { return_url: appUrl } : {}),
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("CryptoBot createInvoice error:", data);
      return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
    }

    return NextResponse.json({
      pay_url: data.result.bot_invoice_url || data.result.pay_url,
      invoice_id: data.result.invoice_id,
    });
  } catch (err) {
    console.error("CryptoBot payment error:", err);
    return NextResponse.json({ error: "Payment error" }, { status: 500 });
  }
}
