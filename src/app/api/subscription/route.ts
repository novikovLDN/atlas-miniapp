import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { pool } from "@/lib/db";
import { sanitizeName } from "@/lib/sanitizeName";
import { getSubBaseUrl } from "@/lib/subDomain";

type TelegramUser = { id: number; first_name?: string; username?: string };

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

function validateInitData(
  initData: string,
  botToken: string,
): { valid: boolean; userId?: number; user?: TelegramUser; error?: string } {
  try {
    const params = new URLSearchParams(initData);
    const data: Record<string, string> = {};
    params.forEach((v, k) => { data[k] = v; });

    const hash = data["hash"];
    const userStr = data["user"];

    let user: TelegramUser | null = null;
    if (userStr) {
      try { user = JSON.parse(userStr) as TelegramUser; }
      catch { return { valid: false, error: "Invalid user in initData" }; }
    }
    if (!user || typeof user.id !== "number") {
      return { valid: false, error: "Missing user or user.id" };
    }
    if (!hash) {
      return { valid: false, error: "Missing hash", userId: user.id };
    }

    const checkString = Object.keys(data)
      .filter((k) => k !== "hash")
      .sort()
      .map((k) => `${k}=${data[k]}`)
      .join("\n");

    const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
    const hmac = crypto.createHmac("sha256", secret).update(checkString).digest("hex");

    if (hmac !== hash) {
      return { valid: false, error: "Hash mismatch", userId: user.id };
    }

    const authDate = data["auth_date"];
    if (authDate) {
      const authTs = parseInt(authDate, 10) * 1000;
      if (Date.now() - authTs > DAY_MS) {
        return { valid: false, error: "Init data expired", userId: user.id };
      }
    }

    return { valid: true, userId: user.id, user };
  } catch (err) {
    return { valid: false, error: String(err) };
  }
}

function formatExpires(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function daysLeft(expiresAt: string): number {
  const endDay = new Date(new Date(expiresAt).setHours(0, 0, 0, 0)).getTime();
  const today = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  return Math.max(0, Math.ceil((endDay - today) / DAY_MS));
}

export async function GET(request: NextRequest) {
  const botToken = process.env.BOT_TOKEN?.trim();
  if (!botToken || !process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const telegramId = parseInt(request.nextUrl.searchParams.get("telegram_id") ?? "", 10);
  if (!telegramId || !Number.isInteger(telegramId)) {
    return NextResponse.json({ error: "Missing or invalid telegram_id" }, { status: 400 });
  }

  const initData = request.headers.get("x-telegram-init-data")?.trim() ?? "";
  if (!initData) {
    return NextResponse.json({ error: "Откройте приложение из Telegram" }, { status: 401 });
  }

  const { valid, userId, user: telegramUser } = validateInitData(initData, botToken);
  if (!valid || userId !== telegramId) {
    return NextResponse.json({ error: "Откройте приложение из Telegram" }, { status: 401 });
  }

  const name = sanitizeName(telegramUser?.first_name || telegramUser?.username);

  try {
    const { rows } = await pool.query(
      `SELECT expires_at, subscription_type
       FROM subscriptions
       WHERE telegram_id = $1 AND expires_at > NOW()
       ORDER BY expires_at DESC LIMIT 1`,
      [telegramId],
    );

    if (!rows.length) {
      return NextResponse.json({ is_active: false, name });
    }

    const row = rows[0];
    const expiresAt = row.expires_at instanceof Date
      ? row.expires_at.toISOString()
      : String(row.expires_at);
    const tariff = row.subscription_type === "business" ? "business" : row.subscription_type === "plus" ? "plus" : "basic";

    const subToken = crypto
      .createHmac("sha256", botToken)
      .update(telegramId.toString())
      .digest("base64url")
      .substring(0, 32);

    const appUrl = await getSubBaseUrl();
    const subUrl = appUrl ? `${appUrl}/api/sub/${subToken}?id=${telegramId}` : undefined;

    return NextResponse.json({
      is_active: true,
      name,
      tariff,
      expires_at: expiresAt,
      expires_formatted: formatExpires(expiresAt),
      days_left: daysLeft(expiresAt),
      sub_url: subUrl,
    });
  } catch (err) {
    console.error("Subscription API error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
