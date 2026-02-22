import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Pool } from "pg";

type TelegramUser = { id: number; first_name?: string; username?: string };

function validateInitData(
  initData: string,
  botToken: string
): { valid: boolean; userId?: number; error?: string } {
  try {
    const params = new URLSearchParams(initData);
    const data: Record<string, string> = {};
    params.forEach((value, key) => {
      data[key] = value;
    });
    const hash = data["hash"];
    const userStr = data["user"];
    let user: TelegramUser | null = null;
    if (userStr) {
      user = JSON.parse(userStr) as TelegramUser;
    }
    if (!user || typeof user?.id !== "number") return { valid: false };
    if (!hash) return { valid: false };

    const checkString = Object.keys(data)
      .filter((k) => k !== "hash")
      .sort()
      .map((k) => `${k}=${data[k]}`)
      .join("\n");
    const trimmedToken = botToken.trim();
    const secret = crypto
      .createHmac("sha256", "WebAppData")
      .update(trimmedToken)
      .digest();
    const hmac = crypto
      .createHmac("sha256", secret)
      .update(checkString)
      .digest("hex");
    if (hmac !== hash) return { valid: false };

    const authDate = data["auth_date"];
    if (authDate) {
      const authTs = parseInt(authDate, 10) * 1000;
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - authTs > maxAge) return { valid: false };
    }
    return { valid: true, userId: user.id };
  } catch {
    return { valid: false };
  }
}

export async function GET(request: NextRequest) {
  const rawBotToken = process.env.BOT_TOKEN;
  const botToken = rawBotToken?.trim();
  const databaseUrl = process.env.DATABASE_URL;
  const initData = request.headers.get("x-telegram-init-data")?.trim() ?? "";

  if (!botToken || !databaseUrl) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const telegramIdParam = request.nextUrl.searchParams.get("telegram_id");
  const telegramId = telegramIdParam ? parseInt(telegramIdParam, 10) : null;
  const tariff = request.nextUrl.searchParams.get("tariff") === "plus" ? "plus" : "basic";
  const keyType = request.nextUrl.searchParams.get("key") === "plus" ? "plus" : "basic";

  if (!telegramId || !Number.isInteger(telegramId)) {
    return NextResponse.json({ error: "Missing or invalid telegram_id" }, { status: 400 });
  }

  if (!initData) {
    return NextResponse.json(
      { error: "Откройте приложение из Telegram" },
      { status: 401 }
    );
  }

  const result = validateInitData(initData, botToken);
  if (!result.valid || result.userId !== telegramId) {
    return NextResponse.json(
      { error: "Откройте приложение из Telegram" },
      { status: 401 }
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const q = await pool.query(
      `SELECT s.vpn_key, s.vpn_key_plus
       FROM subscriptions s
       WHERE s.telegram_id = $1 AND s.expires_at > NOW()
       ORDER BY s.expires_at DESC LIMIT 1`,
      [telegramId]
    );

    if (!q.rows.length) {
      return NextResponse.json({ error: "No active subscription" }, { status: 404 });
    }

    const row = q.rows[0];
    const vpnKey = row.vpn_key ?? "";
    const vpnKeyPlus = row.vpn_key_plus ?? vpnKey;

    const keyToEncode =
      tariff === "basic" ? vpnKey : keyType === "plus" ? vpnKeyPlus : vpnKey;

    if (!keyToEncode) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    const encoded = Buffer.from(keyToEncode, "utf8").toString("base64");
    const url = `v2raytun://install?url=${encoded}`;

    return NextResponse.json({ url });
  } catch (err) {
    console.error("connect-link API error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  } finally {
    await pool.end();
  }
}
