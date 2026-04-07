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

const SINGBOX_UA = /sing-box|sfi|sfa|hiddify|streisand|happ|v2raytun/i;

const RULE_SETS = [
  { tag: "geosite-category-ru", type: "remote", format: "binary", url: "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-category-ru.srs", download_detour: "direct" },
  { tag: "geosite-apple",       type: "remote", format: "binary", url: "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-apple.srs",       download_detour: "direct" },
  { tag: "geosite-private",     type: "remote", format: "binary", url: "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-private.srs",     download_detour: "direct" },
  { tag: "geoip-ru",            type: "remote", format: "binary", url: "https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/geoip-ru.srs",              download_detour: "direct" },
  { tag: "geoip-private",       type: "remote", format: "binary", url: "https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/geoip-private.srs",         download_detour: "direct" },
] as const;

function buildSingboxConfig(uuid: string, configs: ServerConfig[]) {
  const proxyOutbounds = configs.map((c) => ({
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
  }));

  const proxyTags = configs.map((c) => c.name);

  return {
    log: { level: "warn" },
    dns: {
      servers: [
        { tag: "dns-proxy", address: "https://8.8.8.8/dns-query", address_resolver: "dns-direct", detour: "proxy" },
        { tag: "dns-direct", address: "77.88.8.8", detour: "direct" },
      ],
      rules: [
        { outbound: "any", server: "dns-direct" },
        { rule_set: "geosite-category-ru", server: "dns-direct" },
      ],
      final: "dns-proxy",
      independent_cache: true,
    },
    inbounds: [
      {
        type: "tun",
        tag: "tun-in",
        inet4_address: "172.19.0.1/30",
        auto_route: true,
        strict_route: true,
        stack: "mixed",
        sniff: true,
        sniff_override_destination: true,
      },
    ],
    outbounds: [
      { type: "selector", tag: "proxy", outbounds: ["auto", ...proxyTags], default: "auto" },
      { type: "urltest", tag: "auto", outbounds: proxyTags, url: "https://www.gstatic.com/generate_204", interval: "5m" },
      ...proxyOutbounds,
      { type: "direct", tag: "direct" },
      { type: "block", tag: "block" },
      { type: "dns", tag: "dns-out" },
    ],
    route: {
      rules: [
        { protocol: "dns", outbound: "dns-out" },
        { protocol: "bittorrent", outbound: "block" },
        { network: "udp", port: 443, outbound: "block" },
        { rule_set: ["geosite-category-ru", "geosite-apple", "geosite-private"], outbound: "direct" },
        { rule_set: ["geoip-ru", "geoip-private"], outbound: "direct" },
      ],
      rule_set: [...RULE_SETS],
      final: "proxy",
      auto_detect_interface: true,
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
    const expiresAt = row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at);
    const appUrl = await getSubBaseUrl();

    const headers: Record<string, string> = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "profile-title": "Atlas Secure",
      "subscription-userinfo": `upload=0; download=0; total=0; expire=${Math.floor(expiresAt.getTime() / 1000)}`,
      "profile-update-interval": "3",
    };
    if (appUrl) {
      headers["profile-web-page-url"] = `${appUrl}/api/sub/${token}?id=${telegramId}`;
    }

    const ua = request.headers.get("user-agent") ?? "";
    const uuidMatch = vpnKey.match(/vless:\/\/([^@]+)@/);

    if (SINGBOX_UA.test(ua) && uuidMatch) {
      const configs = subType === "plus"
        ? [...BASIC_CONFIGS, ...PLUS_EXTRA_CONFIGS]
        : BASIC_CONFIGS;
      const singboxConfig = buildSingboxConfig(uuidMatch[1], configs);
      headers["Content-Type"] = "application/json; charset=utf-8";
      return new Response(JSON.stringify(singboxConfig), { status: 200, headers });
    }

    const keys = buildKeys(vpnKey, subType);
    headers["Content-Type"] = "text/plain; charset=utf-8";
    headers["content-disposition"] = 'attachment; filename="Atlas Secure.txt"';
    return new Response(keys, { status: 200, headers });
  } catch (err) {
    console.error("sub API error:", err);
    return new Response("Server error", { status: 500 });
  }
}
