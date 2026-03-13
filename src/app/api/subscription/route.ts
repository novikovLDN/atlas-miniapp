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

/* ─── Name sanitization ─── */

const MAX_NAME_LENGTH = 64;
const MAX_NAME_BYTES = 256;

// Таблица гомоглифов: латинские/спецсимволы → кириллица/латин для обхода фильтра
const HOMOGLYPHS: Record<string, string> = {
  "а": "а", "a": "а", "ɑ": "а", "α": "а", "А": "а", "A": "а", "Α": "а",
  "е": "е", "e": "е", "ё": "е", "Е": "е", "E": "е", "Ё": "е", "ε": "е",
  "о": "о", "o": "о", "О": "о", "O": "о", "0": "о", "Ο": "о", "ο": "о",
  "р": "р", "p": "р", "Р": "р", "P": "р", "ρ": "р",
  "с": "с", "c": "с", "С": "с", "C": "с",
  "у": "у", "y": "у", "У": "у", "Y": "у",
  "х": "х", "x": "х", "Х": "х", "X": "х",
  "н": "н", "h": "н", "Н": "н", "H": "н",
  "к": "к", "k": "к", "К": "к", "K": "к",
  "м": "м", "m": "м", "М": "м", "M": "м",
  "т": "т", "t": "т", "Т": "т", "T": "т",
  "в": "в", "b": "в", "В": "в", "B": "в",
  "и": "и", "u": "и",
  "д": "д", "d": "д",
  "л": "л", "l": "л",
  "г": "г", "g": "г",
  "ш": "ш", "w": "ш",
  "з": "з", "3": "з",
  "і": "и", "i": "и", "1": "и", "|": "и",
};

/** Нормализация строки: гомоглифы → базовые, удаление невидимых символов */
function normalizeForFilter(s: string): string {
  // 1) Удаляем zero-width и невидимые Unicode-символы
  let out = s.replace(/[\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF\u00AD\u034F\u061C\u180E]/g, "");
  // 2) Удаляем combining diacritical marks (Zalgo-текст)
  out = out.replace(/[\u0300-\u036F\u0483-\u0489\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/g, "");
  // 3) Заменяем гомоглифы
  let normalized = "";
  for (const ch of out) {
    normalized += HOMOGLYPHS[ch] ?? ch.toLowerCase();
  }
  // 4) Схлопываем повторяющиеся символы (ннааррккоо → нарко)
  normalized = normalized.replace(/(.)\1{2,}/g, "$1$1");
  // 5) Удаляем спецсимволы-разделители между буквами (н.а.р.к.о → нарко)
  normalized = normalized.replace(/([а-яa-z])[.\-_*•·\/\\|,;:!?@#$%^&(){}[\]<>~`'"]+(?=[а-яa-z])/gi, "$1");
  return normalized;
}

const BANNED_PATTERNS = [
  // наркотики
  /мефедрон/i, /меф\b/i, /амфетамин/i, /кокаин/i, /кокс\b/i, /герои?н/i,
  /гашиш/i, /марихуан/i, /каннабис/i, /косяк/i,
  /экстази/i, /мдма/i, /лсд/i, /псилоцибин/i,
  /спайс/i, /снюс/i, /насвай/i, /закладк/i, /кладмен/i, /барыг/i,
  /наркот/i, /дурь\b/i, /шишк[иа]/i, /бошк/i,
  /фен\b/i, /соль\b/i, /солей\b/i, /кристалл/i, /скорост[ьи]/i,
  /метадон/i, /морфи[нй]/i, /опиат/i, /опиоид/i, /трамадол/i,
  /буторфанол/i, /кодеин/i, /барбитурат/i,
  /meth\b/i, /cocaine/i, /heroin/i, /weed\b/i, /drugs?\b/i, /mdma/i,
  /amphetamine/i, /cannabis/i, /marijuana/i, /ecstasy/i,
  /купить\s*меф/i, /продам\s*меф/i, /закладк/i,
  // порно / секс-услуги
  /порн/i, /porn/i, /xxx/i, /секс\s?услуг/i, /эскорт/i, /escort/i,
  /проститу/i, /интим\s?услуг/i, /минет/i, /blowjob/i, /onlyfans/i,
  /хентай/i, /hentai/i, /шлюх/i, /сучк/i, /nsfw/i,
  /anal\b/i, /cum\b/i, /dick\b/i, /pussy/i, /fuck/i,
  // скам / мошенничество
  /скам/i, /scam/i, /обнал/i, /дроп\b/i, /дроппер/i,
  /кардинг/i, /carding/i, /фишинг/i, /phishing/i,
  /лохотрон/i, /отмыв/i,
  // оружие / насилие
  /оружи/i, /ствол\b/i, /пистолет/i, /взрыв/i,
  /бомб[аы]/i, /убий/i, /убить/i, /террор/i,
  /jihad/i, /джихад/i,
  // экстремизм / ненависть
  /нацизм/i, /нацист/i, /фашизм/i, /фашист/i, /свастик/i,
  /зиг\s?хайл/i, /sieg\s?heil/i, /white\s?power/i,
  /heil\s?hitler/i, /хайль/i, /14\s?88/i, /1488/i,
  // казино / азартные
  /казино/i, /casino/i, /букмекер/i,
  /джекпот/i, /jackpot/i, /1xbet/i, /1хбет/i, /пинап/i, /pin-?up/i,
  // ДП / педофилия
  /педофил/i, /child\s?porn/i, /cp\b/i, /лолик/i,
  // мат (грубый, используемый в рекламе)
  /бля[дт]/i, /пизд/i, /хуй/i, /хуя/i, /хуё/i, /ебат/i, /ёбан/i, /сука\b/i,
  /пидор/i, /пидар/i, /faggot/i, /nigger/i, /nigga/i,
];

// Unicode-категории, которые не должны быть в имени
const SUSPICIOUS_UNICODE =
  /[\u0600-\u06FF].*[\u0400-\u04FF]|[\u0400-\u04FF].*[\u0600-\u06FF]|[\u4E00-\u9FFF]{10,}|[\u{10000}-\u{1F9FF}]{5,}/u;

// Контрольные символы и опасные Unicode (кроме обычных emoji)
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u2800-\u28FF]/;

// RTL/LTR override атаки
const BIDI_ATTACKS = /[\u202A-\u202E\u2066-\u2069]/;

function sanitizeName(raw: string): string {
  if (!raw || typeof raw !== "string") return "Пользователь";

  // 1) Ограничение по байтам (защита от огромных строк / DoS)
  const byteLength = Buffer.byteLength(raw, "utf8");
  if (byteLength > MAX_NAME_BYTES) return "Пользователь";

  // 2) Обрезаем по символам
  let name = [...raw].slice(0, MAX_NAME_LENGTH).join("").trim();
  if (!name) return "Пользователь";

  // 3) Блокируем контрольные символы
  if (CONTROL_CHARS.test(name)) return "Пользователь";

  // 4) Блокируем BiDi-override атаки (подмена направления текста)
  if (BIDI_ATTACKS.test(name)) return "Пользователь";

  // 5) Блокируем подозрительные Unicode-комбинации (смешение скриптов для обхода)
  if (SUSPICIOUS_UNICODE.test(name)) return "Пользователь";

  // 6) Нормализуем для проверки (гомоглифы, залго, невидимые символы)
  const normalized = normalizeForFilter(name);

  // 7) Проверяем запрещённые паттерны по нормализованной строке
  for (const re of BANNED_PATTERNS) {
    if (re.test(normalized)) return "Пользователь";
  }

  // 8) Если после удаления невидимых символов имя пустое — подозрительно
  const visible = name.replace(/[\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF\u00AD]/g, "").trim();
  if (!visible) return "Пользователь";

  // 9) Возвращаем оригинальное (обрезанное) имя — не нормализованное
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
