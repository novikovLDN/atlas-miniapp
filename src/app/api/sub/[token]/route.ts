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

  const basicConfigs = [
    { port: 4443, sni: "www.microsoft.com", fp: "chrome", type: "tcp", flow: true, sid: "b1a2c3d4", pbk: "ksv47qlBSKVAAQ98x_wkDDl7owwmszqEYY93kSf0OU0", name: "🇩🇪 Atlas DE #1" },
    { port: 4446, sni: "www.microsoft.com", fp: "ios", type: "grpc", flow: false, sid: "aa111111", pbk: "dR2MBi1bbIkgYrilOJQEl18TywoTt1rWPTiLcExzfhE", name: "🇩🇪 Atlas DE #2" },
    { port: 4448, sni: "ads.x5.ru", fp: "qq", type: "tcp", flow: true, sid: "cc333333", pbk: "_R-zHevgkVd_AECSVeoS3t1l3OZsurXA-FbFbaStkA0", name: "🇪🇺 White List ⚡️" },
    { port: 4449, sni: "api-maps.yandex.ru", fp: "qq", type: "tcp", flow: true, sid: "dd444444", pbk: "g3Kqz_IBfXzKtayjIg8dFG2AsgFJhy_2RhcgDqvcCSM", name: "🇪🇺 White List #2 ⚡️" },
    { port: 4453, sni: "ads.x5.ru", fp: "qq", type: "xhttp", flow: false, sid: "bb22cc33", pbk: "z8EwZFpj21UuWHE7fl6aVoqx-obD-Sh4vmhe-q2Caj4", name: "🇪🇺 White List #3⚡️" },
    { port: 4454, sni: "api-maps.yandex.ru", fp: "qq", type: "grpc", flow: false, sid: "cc33dd44", pbk: "RSKePiWjjJyLt1-8qZdeQXO802GmtQ1e2ZfxQv6yMxE", name: "🇪🇺 White List #4⚡️" },
  ];

  const plusConfigs = [
    { port: 4445, sni: "api-maps.yandex.ru", fp: "chrome", type: "tcp", flow: true, sid: "d1e2f3a4", pbk: "ksv47qlBSKVAAQ98x_wkDDl7owwmszqEYY93kSf0OU0", name: "🇪🇺 White List⚡️" },
    { port: 4456, sni: "www.microsoft.com", fp: "ios", type: "grpc", flow: false, sid: "aa111111", pbk: "dR2MBi1bbIkgYrilOJQEl18TywoTt1rWPTiLcExzfhE", name: "🇩🇪 Atlas Plus 💎" },
    { port: 4458, sni: "ads.x5.ru", fp: "qq", type: "tcp", flow: true, sid: "cc333333", pbk: "_R-zHevgkVd_AECSVeoS3t1l3OZsurXA-FbFbaStkA0", name: "🇪🇺 White List #2⚡️" },
    { port: 4459, sni: "api-maps.yandex.ru", fp: "qq", type: "tcp", flow: true, sid: "dd444444", pbk: "g3Kqz_IBfXzKtayjIg8dFG2AsgFJhy_2RhcgDqvcCSM", name: "🇪🇺 White List #3⚡️" },
    { port: 4463, sni: "ads.x5.ru", fp: "qq", type: "xhttp", flow: false, sid: "ee55ff66", pbk: "z8EwZFpj21UuWHE7fl6aVoqx-obD-Sh4vmhe-q2Caj4", name: "🇪🇺 White List #4⚡️" },
    { port: 4464, sni: "api-maps.yandex.ru", fp: "qq", type: "grpc", flow: false, sid: "ff66aa77", pbk: "RSKePiWjjJyLt1-8qZdeQXO802GmtQ1e2ZfxQv6yMxE", name: "⚪️ Atlas GC 🛡️" },
  ];

  const configs = subscriptionType === "plus" ? plusConfigs : basicConfigs;

  return configs
    .map((c) => {
      let params = `encryption=none&security=reality&sni=${c.sni}&fp=${c.fp}&pbk=${c.pbk}&sid=${c.sid}`;
      if (c.flow) params += "&flow=xtls-rprx-vision";
      if (c.type === "grpc") params += "&type=grpc&serviceName=grpc";
      else if (c.type === "xhttp") params += "&type=xhttp&path=/xhttp";
      else params += "&type=tcp";
      return `vless://${uuid}@${ip}:${c.port}?${params}#${c.name}`;
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
