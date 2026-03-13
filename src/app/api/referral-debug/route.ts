import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    // Get referrals table schema
    const { rows: refCols } = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'referrals' ORDER BY ordinal_position`,
    );

    // Get referral_rewards table schema
    const { rows: rewardCols } = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'referral_rewards' ORDER BY ordinal_position`,
    );

    // Sample data from referrals (last 5 rows)
    let refSample: unknown[] = [];
    if (refCols.length > 0) {
      const { rows } = await pool.query(`SELECT * FROM referrals ORDER BY id DESC LIMIT 5`);
      refSample = rows;
    }

    // Sample data from referral_rewards (last 5 rows)
    let rewardSample: unknown[] = [];
    if (rewardCols.length > 0) {
      const { rows } = await pool.query(`SELECT * FROM referral_rewards ORDER BY id DESC LIMIT 5`);
      rewardSample = rows;
    }

    return NextResponse.json({
      referrals_schema: refCols,
      referral_rewards_schema: rewardCols,
      referrals_sample: refSample,
      referral_rewards_sample: rewardSample,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
