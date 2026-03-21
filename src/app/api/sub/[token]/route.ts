import { NextRequest } from "next/server";
import crypto from "crypto";
import { pool } from "@/lib/db";

type ServerConfig = {
  ip: string;
  port: number;
  sni: string;
  fp: string;
  pbk: string;
  sid: string;
  flow: boolean;
  type: "tcp" | "xhttp";
  name: string;
  path?: string;
};

const BASIC_CONFIGS: ServerConfig[] = [
  { ip: "159.195.20.201", port: 4443, sni: "flowgrocery.com", fp: "chrome", type: "tcp", flow: true, sid: "a1b2c3d4", pbk: "4km41B5xZ3iJ4Z_VJ9WazIg3s_Pf2qSDmm55Yf28akg", name: "🇳🇱 Atlas Fast #1" },
  { ip: "185.241.193.94", port: 443,  sni: "eh.vk.com", fp: "chrome",  type: "tcp", flow: true, sid: "a1b2c3d4", pbk: "AD3iu5zxfDZWeMEHSWTH5JuiokSv3ohQEg1Y_aUxzgA", name: "🇷🇺 LTE-5G ОБХОД | Все операторы ⚡️" },
  { ip: "185.241.193.94", port: 443,  sni: "max.ru",    fp: "firefox", type: "tcp", flow: true, sid: "1a2b3c4d", pbk: "CrQHeDnhvv7Cqdbrx19mmbmTLN02uqIrmVzyufVUz0s", name: "🇷🇺 LTE-5G ОБХОД | Все + Мегафон ⚡️" },
  { ip: "185.241.193.94", port: 8444, sni: "eh.vk.com", fp: "chrome",  type: "tcp", flow: true, sid: "a1b2c3d4", pbk: "AD3iu5zxfDZWeMEHSWTH5JuiokSv3ohQEg1Y_aUxzgA", name: "🇪🇺 LTE-5G ОБХОД + ВПН ⚡️" },
  { ip: "62.84.123.132",  port: 443,  sni: "ads.x5.ru",      fp: "chrome", type: "tcp", flow: true, sid: "a1b2c3d4", pbk: "4km41B5xZ3iJ4Z_VJ9WazIg3s_Pf2qSDmm55Yf28akg", name: "⚪️ Резерв LTE" },
  { ip: "62.84.123.132",  port: 8443, sni: "yandex.ru",      fp: "chrome", type: "tcp", flow: true, sid: "b2c3d4e5", pbk: "WHlvowEffIH0xWQC7hTbYAn1PqcLCHSHGkkW2fWI2Rk", name: "⚪️ Резерв 5G" },
];

const PLUS_EXTRA_CONFIGS: ServerConfig[] = [];

function buildKeys(vpnKey: string, subscriptionType: string): string {
  const match = vpnKey.match(/vless:\/\/([^@]+)@([^:]+):/);
  if (!match) return vpnKey;

  const uuid = match[1];
  const configs = subscriptionType === "plus"
    ? [...BASIC_CONFIGS, ...PLUS_EXTRA_CONFIGS]
    : BASIC_CONFIGS;

  return configs
    .map((c) => {
      let params = `encryption=none&security=reality&sni=${c.sni}&fp=${c.fp}&pbk=${c.pbk}&sid=${c.sid}`;
      if (c.flow) params += "&flow=xtls-rprx-vision";
      params += c.type === "xhttp"
        ? `&type=xhttp&path=${encodeURIComponent(c.path || "/xhttp")}`
        : "&type=tcp";
      return `vless://${uuid}@${c.ip}:${c.port}?${params}#${encodeURIComponent(c.name)}`;
    })
    .join("\n");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const telegramId = parseInt(request.nextUrl.searchParams.get("id") ?? "", 10);

  if (!token || !telegramId || !Number.isInteger(telegramId)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const botToken = process.env.BOT_TOKEN?.trim();
  if (!botToken || !process.env.DATABASE_URL) {
    return new Response("Server error", { status: 500 });
  }

  const expected = crypto
    .createHmac("sha256", botToken)
    .update(telegramId.toString())
    .digest("base64url")
    .substring(0, 32);

  if (token !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { rows } = await pool.query(
      `SELECT expires_at, subscription_type, vpn_key
       FROM subscriptions
       WHERE telegram_id = $1 AND expires_at > NOW()
       ORDER BY expires_at DESC LIMIT 1`,
      [telegramId],
    );

    if (!rows.length) {
      return new Response("Not found", { status: 404 });
    }

    const row = rows[0];
    const keys = buildKeys((row.vpn_key ?? "").trim(), row.subscription_type ?? "basic");

    const expiresAt = row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at);
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

    const headers: Record<string, string> = {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "profile-title": "Atlas Secure",
      "subscription-userinfo": `upload=0; download=0; total=0; expire=${Math.floor(expiresAt.getTime() / 1000)}`,
      "profile-update-interval": "8",
      "content-disposition": 'attachment; filename="Atlas Secure.txt"',
    };
    if (appUrl) {
      headers["profile-web-page-url"] = `${appUrl}/api/sub/${token}?id=${telegramId}`;
    }

    return new Response(keys, { status: 200, headers });
  } catch (err) {
    console.error("sub API error:", err);
    return new Response("Server error", { status: 500 });
  }
}
