import { NextRequest } from "next/server";
import crypto from "crypto";
import { pool } from "@/lib/db";
import { getSubBaseUrl } from "@/lib/subDomain";

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
  { ip: "89.169.55.75",   port: 4443, sni: "google.com",     fp: "chrome", type: "tcp", flow: true, sid: "a1b2c3d4", pbk: "6j_Z1QMNfGfLod_aBZdVWlt0nonNSVUt5Yg7sgpP9Co", name: "🇩🇪 Atlas Fast #1 ⚡️" },
  { ip: "45.144.55.159",  port: 4443, sni: "flowgrocery.com", fp: "chrome", type: "tcp", flow: true, sid: "a1b2c3d4", pbk: "5b38RSRtlEw-HMYj1PmvS0QL8mZco2Bj_58sw2wikjA", name: "🇩🇪 Atlas Fast #2 ⚡️" },
  { ip: "84.23.52.66", port: 443,  sni: "eh.vk.com", fp: "chrome",  type: "tcp", flow: true, sid: "a1b2c3d4", pbk: "AD3iu5zxfDZWeMEHSWTH5JuiokSv3ohQEg1Y_aUxzgA", name: "🇷🇺 LTE-5G ОБХОД | Все операторы ⚡️" },
  { ip: "84.23.52.66", port: 443,  sni: "max.ru",    fp: "firefox", type: "tcp", flow: true, sid: "1a2b3c4d", pbk: "CrQHeDnhvv7Cqdbrx19mmbmTLN02uqIrmVzyufVUz0s", name: "🇷🇺 LTE-5G ОБХОД | Все + Мегафон ⚡️" },
  { ip: "84.23.52.66", port: 8444, sni: "eh.vk.com", fp: "chrome",  type: "tcp", flow: true, sid: "a1b2c3d4", pbk: "AD3iu5zxfDZWeMEHSWTH5JuiokSv3ohQEg1Y_aUxzgA", name: "⚡️ Команда /white в боте" },
  { ip: "84.23.52.66", port: 8443, sni: "max.ru",    fp: "firefox", type: "tcp", flow: true, sid: "1a2b3c4d", pbk: "7uELniOcmygn2k9ywnZsJ0QzCsli_1e0bFGpqHcF4RY", name: "⚡️ Команда /white в боте" },
];

const PLUS_EXTRA_CONFIGS: ServerConfig[] = [];

function buildVlessOutbound(uuid: string, c: ServerConfig, tag: string) {
  return {
    tag,
    protocol: "vless" as const,
    settings: {
      vnext: [{
        address: c.ip,
        port: c.port,
        users: [{
          id: uuid,
          encryption: "none",
          ...(c.flow ? { flow: "xtls-rprx-vision" } : {}),
        }],
      }],
    },
    streamSettings: {
      network: c.type === "xhttp" ? "xhttp" : "tcp",
      security: "reality",
      realitySettings: {
        serverName: c.sni,
        fingerprint: c.fp,
        publicKey: c.pbk,
        shortId: c.sid,
      },
      ...(c.type === "xhttp" ? { xhttpSettings: { path: c.path || "/xhttp" } } : {}),
    },
  };
}

function buildConfig(vpnKey: string, subscriptionType: string): string {
  const match = vpnKey.match(/vless:\/\/([^@]+)@([^:]+):/);
  if (!match) return Buffer.from(vpnKey).toString("base64");

  const uuid = match[1];
  const configs = subscriptionType === "plus"
    ? [...BASIC_CONFIGS, ...PLUS_EXTRA_CONFIGS]
    : BASIC_CONFIGS;

  const proxyOutbounds = configs.map((c, i) => {
    const tag = i === 0 ? "proxy" : `proxy-${i}`;
    return buildVlessOutbound(uuid, c, tag);
  });

  const config = {
    dns: {
      servers: [
        { address: "77.88.8.8", port: 53, domains: ["geosite:category-ru"] },
        { address: "https://8.8.8.8/dns-query" },
      ],
      queryStrategy: "UseIPv4",
    },
    outbounds: [
      ...proxyOutbounds,
      { tag: "direct", protocol: "freedom", settings: {} },
      { tag: "block", protocol: "blackhole", settings: { response: { type: "http" } } },
      { tag: "dns-out", protocol: "dns" },
    ],
    routing: {
      domainStrategy: "IPIfNonMatch",
      rules: [
        { type: "field", port: 53, outboundTag: "dns-out" },
        { type: "field", protocol: ["bittorrent"], outboundTag: "block" },
        { type: "field", network: "udp", port: 443, outboundTag: "block" },
        { type: "field", domain: ["geosite:category-ru", "geosite:apple", "geosite:private"], outboundTag: "direct" },
        { type: "field", ip: ["geoip:ru", "geoip:private"], outboundTag: "direct" },
      ],
    },
  };

  return Buffer.from(JSON.stringify(config)).toString("base64");
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
    const configBase64 = buildConfig((row.vpn_key ?? "").trim(), row.subscription_type ?? "basic");

    const expiresAt = row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at);
    const appUrl = await getSubBaseUrl();

    const headers: Record<string, string> = {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "profile-title": "Atlas Secure",
      "subscription-userinfo": `upload=0; download=0; total=0; expire=${Math.floor(expiresAt.getTime() / 1000)}`,
      "profile-update-interval": "3",
      "content-disposition": 'attachment; filename="Atlas Secure.txt"',
    };
    if (appUrl) {
      headers["profile-web-page-url"] = `${appUrl}/api/sub/${token}?id=${telegramId}`;
    }

    return new Response(configBase64, { status: 200, headers });
  } catch (err) {
    console.error("sub API error:", err);
    return new Response("Server error", { status: 500 });
  }
}
