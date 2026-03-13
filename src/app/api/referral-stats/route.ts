import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { pool } from "@/lib/db";

type TelegramUser = { id: number; first_name?: string; username?: string };

const DAY_MS = 24 * 60 * 60 * 1000;

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

type ReferralLevel = {
  name: string;
  minReferrals: number;
  cashbackPercent: number;
};

const LEVELS: ReferralLevel[] = [
  { name: "Silver Access", minReferrals: 0, cashbackPercent: 10 },
  { name: "Gold Access", minReferrals: 25, cashbackPercent: 25 },
  { name: "Platinum Access", minReferrals: 50, cashbackPercent: 45 },
];

function getLevel(totalInvited: number): ReferralLevel {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalInvited >= LEVELS[i].minReferrals) return LEVELS[i];
  }
  return LEVELS[0];
}

function getNextLevel(totalInvited: number): ReferralLevel | null {
  for (const level of LEVELS) {
    if (totalInvited < level.minReferrals) return level;
  }
  return null;
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { valid, userId } = validateInitData(initData, botToken);
  if (!valid || userId !== telegramId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Discover actual column names in the referrals table
    const { rows: colRows } = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'referrals'`,
    );
    const columns = colRows.map((r: { column_name: string }) => r.column_name);

    let totalInvited = 0;
    let activeReferrals = 0;
    let totalCashback = 0;

    if (columns.length > 0) {
      // Map to actual column names — support both referrer_id and inviter_id conventions
      const referrerCol = columns.includes("referrer_id")
        ? "referrer_id"
        : columns.includes("inviter_id")
          ? "inviter_id"
          : columns.includes("from_user_id")
            ? "from_user_id"
            : null;

      const paidCol = columns.includes("first_paid_at")
        ? "first_paid_at"
        : columns.includes("paid_at")
          ? "paid_at"
          : columns.includes("activated_at")
            ? "activated_at"
            : null;

      if (referrerCol) {
        // Total invited
        const { rows: totalRows } = await pool.query(
          `SELECT COUNT(*) AS count FROM referrals WHERE ${referrerCol} = $1`,
          [telegramId],
        );
        totalInvited = parseInt(totalRows[0]?.count ?? "0", 10);

        // Active referrals (those who have paid)
        if (paidCol) {
          const { rows: activeRows } = await pool.query(
            `SELECT COUNT(*) AS count FROM referrals WHERE ${referrerCol} = $1 AND ${paidCol} IS NOT NULL`,
            [telegramId],
          );
          activeReferrals = parseInt(activeRows[0]?.count ?? "0", 10);
        } else {
          activeReferrals = totalInvited;
        }
      }

      // Check referral_rewards table
      const { rows: rewardColRows } = await pool.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'referral_rewards'`,
      );
      const rewardCols = rewardColRows.map((r: { column_name: string }) => r.column_name);

      if (rewardCols.length > 0) {
        const rewardReferrerCol = rewardCols.includes("referrer_id")
          ? "referrer_id"
          : rewardCols.includes("inviter_id")
            ? "inviter_id"
            : rewardCols.includes("user_id")
              ? "user_id"
              : null;

        const amountCol = rewardCols.includes("reward_amount")
          ? "reward_amount"
          : rewardCols.includes("amount")
            ? "amount"
            : null;

        if (rewardReferrerCol && amountCol) {
          const { rows: cashbackRows } = await pool.query(
            `SELECT COALESCE(SUM(${amountCol}), 0) AS total FROM referral_rewards WHERE ${rewardReferrerCol} = $1`,
            [telegramId],
          );
          totalCashback = parseFloat(cashbackRows[0]?.total ?? "0");
        }
      }
    } else {
      // Table doesn't exist — create it
      await pool.query(`
        CREATE TABLE IF NOT EXISTS referrals (
          id SERIAL PRIMARY KEY,
          referrer_id BIGINT NOT NULL,
          referred_id BIGINT NOT NULL UNIQUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          first_paid_at TIMESTAMPTZ
        );
        CREATE TABLE IF NOT EXISTS referral_rewards (
          id SERIAL PRIMARY KEY,
          referrer_id BIGINT NOT NULL,
          referred_id BIGINT NOT NULL,
          reward_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
    }

    const currentLevel = getLevel(totalInvited);
    const nextLevel = getNextLevel(totalInvited);

    return NextResponse.json({
      total_invited: totalInvited,
      active_referrals: activeReferrals,
      total_cashback: totalCashback,
      current_level: currentLevel.name,
      cashback_percent: currentLevel.cashbackPercent,
      next_level: nextLevel
        ? {
            name: nextLevel.name,
            min_referrals: nextLevel.minReferrals,
            referrals_needed: nextLevel.minReferrals - totalInvited,
          }
        : null,
    });
  } catch (err) {
    console.error("Referral stats API error:", err);

    // If DB is unavailable or any error, return default stats
    const defaultLevel = LEVELS[0];
    const defaultNext = LEVELS[1];
    return NextResponse.json({
      total_invited: 0,
      active_referrals: 0,
      total_cashback: 0,
      current_level: defaultLevel.name,
      cashback_percent: defaultLevel.cashbackPercent,
      next_level: {
        name: defaultNext.name,
        min_referrals: defaultNext.minReferrals,
        referrals_needed: defaultNext.minReferrals,
      },
    });
  }
}
