import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Pool } from "pg";

type TelegramUser = { id: number; first_name?: string; username?: string };

function validateInitData(
  initData: string,
  botToken: string
): { valid: boolean; userId?: number; user?: TelegramUser; error?: string } {
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
      try {
        user = JSON.parse(userStr) as TelegramUser;
        console.log("initData parsed user:", JSON.stringify(user));
      } catch (e) {
        console.error("initData validation failed: parse user", e);
        return { valid: false, error: "Invalid user in initData" };
      }
    }
    if (!user || typeof user?.id !== "number") {
      console.error("initData validation failed: no user or user.id");
      return { valid: false, error: "Missing user or user.id" };
    }

    if (!hash) {
      console.error("initData validation failed: no hash");
      return { valid: false, error: "Missing hash", userId: user.id };
    }

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

    console.log("checkString:", checkString.substring(0, 100));
    console.log("computed hmac:", hmac.substring(0, 20));
    console.log("expected hash:", hash?.substring(0, 20));

    if (hmac !== hash) {
      console.error("initData validation failed: hash mismatch");
      return { valid: false, error: "Hash mismatch", userId: user.id };
    }

    const authDate = data["auth_date"];
    if (authDate) {
      const authTs = parseInt(authDate, 10) * 1000;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - authTs > maxAge) {
        console.error("initData validation failed: auth_date expired");
        return { valid: false, error: "Init data expired", userId: user.id };
      }
    }

    return { valid: true, userId: user.id, user };
  } catch (err) {
    console.error("initData validation failed:", err);
    return { valid: false, error: String(err) };
  }
}

const BANNED_PATTERNS = [
  // наркотики
  /мефедрон/i, /меф/i, /амфетамин/i, /кокаин/i, /кокс/i, /герои?н/i,
  /гашиш/i, /марихуан/i, /каннабис/i, /трав[ак]/i, /косяк/i,
  /экстази/i, /мдма/i, /лсд/i, /кислот[аы]/i, /грибы/i, /псилоцибин/i,
  /спайс/i, /снюс/i, /насвай/i, /закладк/i, /кладмен/i, /барыг/i,
  /наркот/i, /дурь/i, /шишк[иа]/i, /бошк/i, /план/i,
  /фен/i, /соль\b/i, /солей/i, /кристалл/i, /скорост[ьи]/i,
  /метадон/i, /морфи[нй]/i, /опиат/i, /опиоид/i, /трамадол/i,
  /буторфанол/i, /кодеин/i, /барбитурат/i,
  /meth\b/i, /cocaine/i, /heroin/i, /weed/i, /drug/i, /mdma/i,
  /amphetamine/i, /cannabis/i, /marijuana/i, /ecstasy/i,
  // порно / секс-услуги
  /порн/i, /porn/i, /xxx/i, /секс\s?услуг/i, /эскорт/i, /escort/i,
  /проститу/i, /интим/i, /минет/i, /blowjob/i, /onlyfans/i,
  /хентай/i, /hentai/i, /шлюх/i, /сучк/i,
  // скам / мошенничество
  /скам/i, /scam/i, /обнал/i, /дроп/i, /кардинг/i, /carding/i,
  /фишинг/i, /phishing/i, /развод/i, /лохотрон/i,
  /отмыв/i, /обман/i,
  // оружие / насилие
  /оружи/i, /ствол/i, /пистолет/i, /автомат/i, /взрыв/i,
  /бомб[аы]/i, /убий/i, /убить/i, /террор/i,
  // экстремизм
  /нацизм/i, /нацист/i, /фашизм/i, /фашист/i, /свастик/i,
  /зиг\s?хайл/i, /sieg\s?heil/i, /white\s?power/i,
  // казино / азартные
  /казино/i, /casino/i, /ставк[иа]/i, /букмекер/i, /слот[ыа]/i,
  /джекпот/i, /jackpot/i, /1xbet/i, /1хбет/i, /пинап/i, /pin-?up/i,
  // спам / реклама
  /купи/i, /продаж/i, /оптом/i, /дёшево/i, /дешево/i, /халяв/i,
  /бесплатн/i, /розыгрыш/i, /giveaway/i,
];

function sanitizeName(raw: string): string {
  const name = raw.trim();
  if (!name) return "Пользователь";
  for (const re of BANNED_PATTERNS) {
    if (re.test(name)) return "Пользователь";
  }
  return name;
}

function formatExpires(dateStr: string): string {
  const d = new Date(dateStr);
  const months = "янв фев мар апр май июн июл авг сен окт ноя дек".split(" ");
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function daysLeft(expiresAt: string): number {
  const end = new Date(expiresAt).getTime();
  const now = new Date().setHours(0, 0, 0, 0);
  const endDay = new Date(end).setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((endDay - now) / (24 * 60 * 60 * 1000)));
}

export async function GET(request: NextRequest) {
  const rawBotToken = process.env.BOT_TOKEN;
  const botToken = rawBotToken?.trim();
  const databaseUrl = process.env.DATABASE_URL;
  const initData = request.headers.get("x-telegram-init-data")?.trim() ?? "";

  console.log("BOT_TOKEN exists:", !!rawBotToken);
  console.log("BOT_TOKEN length:", rawBotToken?.length ?? 0);
  console.log(
    "initData received:",
    initData ? (initData.length > 50 ? initData.substring(0, 50) + "..." : initData) : "(empty)"
  );

  if (!botToken || !databaseUrl) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const telegramIdParam = request.nextUrl.searchParams.get("telegram_id");
  const telegramId = telegramIdParam ? parseInt(telegramIdParam, 10) : null;

  if (!telegramId || !Number.isInteger(telegramId)) {
    return NextResponse.json({ error: "Missing or invalid telegram_id" }, { status: 400 });
  }

  if (!initData) {
    return NextResponse.json(
      { error: "Откройте приложение из Telegram" },
      { status: 401 }
    );
  }

  const validationResult = validateInitData(initData, botToken);
  const { valid, userId, user: telegramUser, error: validationError } = validationResult;
  if (!valid || userId !== telegramId) {
    if (validationError) {
      console.error("initData validation failed:", validationError);
    }
    return NextResponse.json(
      { error: "Откройте приложение из Telegram" },
      { status: 401 }
    );
  }

  const rawName =
    telegramUser?.first_name || telegramUser?.username || "Пользователь";
  const name = sanitizeName(rawName);

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const result = await pool.query(
      `SELECT s.expires_at, s.subscription_type, s.vpn_key, s.vpn_key_plus
       FROM subscriptions s
       WHERE s.telegram_id = $1
         AND s.expires_at > NOW()
       ORDER BY s.expires_at DESC LIMIT 1`,
      [telegramId]
    );

    if (!result.rows.length) {
      return NextResponse.json({
        is_active: false,
        name,
      });
    }

    const row = result.rows[0];
    const expiresAt = row.expires_at instanceof Date ? row.expires_at.toISOString() : String(row.expires_at);
    const is_active = new Date(row.expires_at) > new Date();
    const tariff = (row.subscription_type === "plus" ? "plus" : "basic") as "basic" | "plus";

    const sub_token = crypto
      .createHmac("sha256", botToken)
      .update(telegramId.toString())
      .digest("base64url")
      .substring(0, 32);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const sub_url = appUrl ? `${appUrl.replace(/\/$/, "")}/api/sub/${sub_token}?id=${telegramId}` : "";

    return NextResponse.json({
      name,
      tariff,
      expires_at: expiresAt,
      expires_formatted: formatExpires(expiresAt),
      is_active,
      vpn_key: row.vpn_key ?? "",
      vpn_key_plus: row.vpn_key_plus ?? null,
      days_left: daysLeft(expiresAt),
      sub_token,
      sub_url: sub_url || undefined,
    });
  } catch (err) {
    console.error("Subscription API error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  } finally {
    await pool.end();
  }
}
