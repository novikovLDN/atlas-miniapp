import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { pool } from "@/lib/db";

type TelegramUser = { id: number; first_name?: string; username?: string };

const DAY_MS = 24 * 60 * 60 * 1000;

function validateInitData(
  initData: string,
  botToken: string,
): { valid: boolean; userId?: number } {
  try {
    const params = new URLSearchParams(initData);
    const data: Record<string, string> = {};
    params.forEach((v, k) => { data[k] = v; });

    const hash = data["hash"];
    const userStr = data["user"];

    let user: TelegramUser | null = null;
    if (userStr) {
      try { user = JSON.parse(userStr) as TelegramUser; }
      catch { return { valid: false }; }
    }
    if (!user || typeof user.id !== "number" || !hash) return { valid: false };

    const checkString = Object.keys(data)
      .filter((k) => k !== "hash")
      .sort()
      .map((k) => `${k}=${data[k]}`)
      .join("\n");

    const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
    const hmac = crypto.createHmac("sha256", secret).update(checkString).digest("hex");
    if (hmac !== hash) return { valid: false };

    const authDate = data["auth_date"];
    if (authDate) {
      const authTs = parseInt(authDate, 10) * 1000;
      if (Date.now() - authTs > DAY_MS) return { valid: false };
    }

    return { valid: true, userId: user.id };
  } catch {
    return { valid: false };
  }
}

export async function GET(request: NextRequest) {
  const botToken = process.env.BOT_TOKEN?.trim();
  if (!botToken || !process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const telegramId = parseInt(request.nextUrl.searchParams.get("telegram_id") ?? "", 10);
  const tariff = request.nextUrl.searchParams.get("tariff") === "plus" ? "plus" : "basic";
  const keyType = request.nextUrl.searchParams.get("key") === "plus" ? "plus" : "basic";

  if (!telegramId || !Number.isInteger(telegramId)) {
    return NextResponse.json({ error: "Missing or invalid telegram_id" }, { status: 400 });
  }

  const initData = request.headers.get("x-telegram-init-data")?.trim() ?? "";
  if (!initData) {
    return NextResponse.json({ error: "Откройте приложение из Telegram" }, { status: 401 });
  }

  const result = validateInitData(initData, botToken);
  if (!result.valid || result.userId !== telegramId) {
    return NextResponse.json({ error: "Откройте приложение из Telegram" }, { status: 401 });
  }

  try {
    const { rows } = await pool.query(
      `SELECT vpn_key, vpn_key_plus
       FROM subscriptions
       WHERE telegram_id = $1 AND expires_at > NOW()
       ORDER BY expires_at DESC LIMIT 1`,
      [telegramId],
    );

    if (!rows.length) {
      return NextResponse.json({ error: "No active subscription" }, { status: 404 });
    }

    const row = rows[0];
    const vpnKey = row.vpn_key ?? "";
    const vpnKeyPlus = row.vpn_key_plus ?? vpnKey;
    const keyToEncode = tariff === "basic" ? vpnKey : keyType === "plus" ? vpnKeyPlus : vpnKey;

    if (!keyToEncode) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    const encoded = Buffer.from(keyToEncode, "utf8").toString("base64");
    return NextResponse.json({ url: `v2raytun://install?url=${encoded}` });
  } catch (err) {
    console.error("connect-link API error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
