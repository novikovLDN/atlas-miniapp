import { NextRequest } from "next/server";
import crypto from "crypto";
import { Pool } from "pg";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
  "Content-Type": "text/plain; charset=utf-8",
};

function buildKeys(vpnKey: string, subscriptionType: string): string {
  const match = vpnKey.match(/vless:\/\/([^@]+)@([^:]+):/);
  if (!match) return vpnKey;

  const uuid = match[1];
  const ip = match[2];

  // Basic configs — у ВСЕХ юзеров (basic и plus)
  const basicConfigs = [
    { port: 4443, sni: "www.microsoft.com",  fp: "chrome", type: "tcp",   flow: true,  sid: "a1b2c3d4", pbk: "gQPfOqCTdgQrJFniIU6Glq2fMHbNSw7bHwRLLl_0Hg4", name: "🇩🇪 Atlas DE #1" },
    { port: 4447, sni: "travel.yandex.ru",   fp: "chrome", type: "tcp",   flow: true,  sid: "64af3654", pbk: "2Jh2TFg134Bm860UKpgo5TDNcYOlE-I4IlW9QxHs3jc", name: "🇪🇺 White List ⚡️" },
    { port: 4451, sni: "m.vk.com",           fp: "chrome", type: "xhttp", flow: false, sid: "93086209", pbk: "b4RO9dVLFYsYbYvNzgDqcqjYq-yfLKMvIzGkLCUSxxM", path: "/api/v1/update", name: "🇪🇺 WL xHTTP ⚡️" },
  ];

  // Plus-extra configs — ТОЛЬКО для plus юзеров (в дополнение к basic)
  const plusExtraConfigs = [
    { port: 4445, sni: "api-maps.yandex.ru", fp: "chrome", type: "tcp",   flow: true,  sid: "d1e2f3a4", pbk: "8-MsUEs6AihnQzPs3gO7IJLYB9DWgksw3DbJE9YwQxo", name: "🇩🇪 Atlas Platinum 💎" },
    { port: 4457, sni: "travel.yandex.ru",   fp: "chrome", type: "tcp",   flow: true,  sid: "a34c3cf1", pbk: "6LSkEW9CJ33UgwjvnaJ8XeuvBsAphcwKGLlF6oa6A0o", name: "🇪🇺 Platinum White List ⚡️" },
    { port: 4461, sni: "m.vk.com",           fp: "chrome", type: "xhttp", flow: false, sid: "1425b7be", pbk: "cuYnX6xOaFGAR-9yJhARP4HEiqbVjKbFbs2lJ2XYkFE", path: "/api/v1/update", name: "🇪🇺 Platinum xHTTP ⚡️" },
  ];

  const configs = subscriptionType === "plus"
    ? [...basicConfigs, ...plusExtraConfigs]
    : basicConfigs;

  return configs
    .map((c) => {
      let params = `encryption=none&security=reality&sni=${c.sni}&fp=${c.fp}&pbk=${c.pbk}&sid=${c.sid}`;
      if (c.flow) params += "&flow=xtls-rprx-vision";
      if (c.type === "xhttp") {
        params += `&type=xhttp&path=${encodeURIComponent((c as { path?: string }).path || "/xhttp")}`;
      } else {
        params += "&type=tcp";
      }
      return `vless://${uuid}@${ip}:${c.port}?${params}#${encodeURIComponent(c.name)}`;
    })
    .join("\n");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const telegramIdParam = request.nextUrl.searchParams.get("id");
  const telegramId = telegramIdParam ? parseInt(telegramIdParam, 10) : null;

  console.log("SUB token:", token, "id:", telegramIdParam);

  if (!token || !telegramIdParam || !telegramId || !Number.isInteger(telegramId)) {
    return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
  }

  const botToken = process.env.BOT_TOKEN?.trim();
  const databaseUrl = process.env.DATABASE_URL;
  if (!botToken || !databaseUrl) {
    return new Response("Server error", { status: 500, headers: CORS_HEADERS });
  }

  const expected = crypto
    .createHmac("sha256", botToken)
    .update(telegramId.toString())
    .digest("base64url")
    .substring(0, 32);

  if (token !== expected) {
    return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const result = await pool.query(
      `SELECT expires_at, subscription_type, vpn_key, vpn_key_plus
       FROM subscriptions
       WHERE telegram_id = $1 AND expires_at > NOW()
       ORDER BY expires_at DESC LIMIT 1`,
      [telegramId]
    );

    const row = result.rows[0] ?? null;
    console.log("Keys found:", !!row);

    if (!row) {
      return new Response("Not found", { status: 404, headers: CORS_HEADERS });
    }

    const key1 = (row.vpn_key ?? "").trim();
    const keys = buildKeys(key1, row.subscription_type ?? "basic");

    console.log("Returning keys:", keys?.substring(0, 50));

    const expiresAt = row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at);
    const expireTimestamp = Math.floor(expiresAt.getTime() / 1000);
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
    const profileWebPageUrl = appUrl ? `${appUrl}/api/sub/${token}?id=${telegramId}` : "";

    const responseHeaders: Record<string, string> = {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "profile-title": "Atlas Secure",
      "subscription-userinfo": `upload=0; download=0; total=0; expire=${expireTimestamp}`,
      "profile-update-interval": "24",
      "content-disposition": 'attachment; filename="Atlas Secure.txt"',
    };
    if (profileWebPageUrl) {
      responseHeaders["profile-web-page-url"] = profileWebPageUrl;
    }

    return new Response(keys, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("sub API error:", err);
    return new Response("Server error", { status: 500, headers: CORS_HEADERS });
  } finally {
    await pool.end();
  }
}
