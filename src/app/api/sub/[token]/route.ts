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
  { ip: "77.221.156.97",   port: 4443, sni: "api-maps.yandex.ru",     fp: "chrome", type: "tcp", flow: true, sid: "a1b2c3d4", pbk: "6j_Z1QMNfGfLod_aBZdVWlt0nonNSVUt5Yg7sgpP9Co", name: "🇩🇪 Atlas Fast #1 Тех. Обслуживание🚧" },
  { ip: "45.144.55.159",  port: 4443, sni: "flowgrocery.com", fp: "chrome", type: "tcp", flow: true, sid: "a1b2c3d4", pbk: "5b38RSRtlEw-HMYj1PmvS0QL8mZco2Bj_58sw2wikjA", name: "🇩🇪 Atlas Fast #2 ⚡️" },
  { ip: "84.23.52.66", port: 8444, sni: "eh.vk.com", fp: "chrome",  type: "tcp", flow: true, sid: "a1b2c3d4", pbk: "AD3iu5zxfDZWeMEHSWTH5JuiokSv3ohQEg1Y_aUxzgA", name: "Для Обхода: в боте /white команда" },
];

const PLUS_EXTRA_CONFIGS: ServerConfig[] = [];

function buildSingboxOutbound(uuid: string, c: ServerConfig) {
  return {
    type: "vless" as const,
    tag: c.name,
    server: c.ip,
    server_port: c.port,
    uuid,
    ...(c.flow ? { flow: "xtls-rprx-vision" } : {}),
    tls: {
      enabled: true,
      server_name: c.sni,
      utls: { enabled: true, fingerprint: c.fp },
      reality: { enabled: true, public_key: c.pbk, short_id: c.sid },
    },
  };
}

function buildSingboxConfig(uuid: string, configs: ServerConfig[]) {
  const outbounds = configs.map((c) => buildSingboxOutbound(uuid, c));
  const proxyTags = configs.map((c) => c.name);

  return {
    log: { level: "warn" },
    dns: {
      servers: [
        { tag: "dns-proxy", address: "https://8.8.8.8/dns-query", address_resolver: "dns-direct", detour: proxyTags[0] },
        { tag: "dns-direct", address: "77.88.8.8", detour: "direct" },
      ],
      rules: [
        { outbound: "any", server: "dns-direct" },
        { geosite: "category-ru", server: "dns-direct" },
      ],
      final: "dns-proxy",
      strategy: "prefer_ipv4",
    },
    outbounds: [
      ...outbounds,
      { type: "direct", tag: "direct" },
      { type: "block", tag: "block" },
      { type: "dns", tag: "dns-out" },
    ],
    route: {
      rules: [
        { protocol: "dns", outbound: "dns-out" },
        { geoip: "private", outbound: "direct" },
        { geosite: "category-ru", outbound: "direct" },
        { geoip: "ru", outbound: "direct" },
        { geosite: "apple", outbound: "direct" },
        { protocol: "bittorrent", outbound: "block" },
      ],
      auto_detect_interface: true,
      final: proxyTags[0],
    },
  };
}

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
    const vpnKey = (row.vpn_key ?? "").trim();
    const subType = row.subscription_type ?? "basic";
    const format = request.nextUrl.searchParams.get("format");

    const expiresAt = row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at);
    const appUrl = await getSubBaseUrl();

    const baseHeaders: Record<string, string> = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "profile-title": "Atlas Secure",
      "subscription-userinfo": `upload=0; download=0; total=0; expire=${Math.floor(expiresAt.getTime() / 1000)}`,
      "profile-update-interval": "3",
    };
    if (appUrl) {
      baseHeaders["profile-web-page-url"] = `${appUrl}/api/sub/${token}?id=${telegramId}`;
    }

    if (format === "singbox") {
      const uuidMatch = vpnKey.match(/vless:\/\/([^@]+)@/);
      if (!uuidMatch) {
        return new Response("Invalid key", { status: 500 });
      }
      const configs = subType === "plus"
        ? [...BASIC_CONFIGS, ...PLUS_EXTRA_CONFIGS]
        : BASIC_CONFIGS;
      const singbox = buildSingboxConfig(uuidMatch[1], configs);
      return new Response(JSON.stringify(singbox, null, 2), {
        status: 200,
        headers: { ...baseHeaders, "Content-Type": "application/json; charset=utf-8" },
      });
    }

    const keys = buildKeys(vpnKey, subType);
    return new Response(keys, {
      status: 200,
      headers: {
        ...baseHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "content-disposition": 'attachment; filename="Atlas Secure.txt"',
      },
    });
  } catch (err) {
    console.error("sub API error:", err);
    return new Response("Server error", { status: 500 });
  }
}
