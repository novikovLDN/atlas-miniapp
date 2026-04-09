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
  { ip: "77.221.156.97",   port: 4443, sni: "api-maps.yandex.ru",     fp: "chrome", type: "tcp", flow: true, sid: "a1b2c3d4", pbk: "6j_Z1QMNfGfLod_aBZdVWlt0nonNSVUt5Yg7sgpP9Co", name: "🇩🇪 Atlas Fast #1 ⚡️" },
  { ip: "45.144.55.159",  port: 4443, sni: "flowgrocery.com", fp: "chrome", type: "tcp", flow: true, sid: "a1b2c3d4", pbk: "5b38RSRtlEw-HMYj1PmvS0QL8mZco2Bj_58sw2wikjA", name: "🇩🇪 Atlas Fast #2 ⚡️" },
  { ip: "84.23.52.66", port: 8444, sni: "eh.vk.com", fp: "chrome",  type: "tcp", flow: true, sid: "a1b2c3d4", pbk: "AD3iu5zxfDZWeMEHSWTH5JuiokSv3ohQEg1Y_aUxzgA", name: "Для Обхода: в боте /white команда" },
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

function buildSingboxConfig(vpnKey: string, subscriptionType: string): object | null {
  const match = vpnKey.match(/vless:\/\/([^@]+)@([^:]+):/);
  if (!match) return null;
  const uuid = match[1];

  const configs = subscriptionType === "plus"
    ? [...BASIC_CONFIGS, ...PLUS_EXTRA_CONFIGS]
    : BASIC_CONFIGS;

  const outbounds = configs.map((c) => ({
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
    ...(c.type === "xhttp" ? { transport: { type: "http", path: c.path || "/xhttp" } } : {}),
    packet_encoding: "xudp",
  }));

  const outboundTags = outbounds.map((o) => o.tag);

  return {
    log: { level: "info" },
    dns: {
      servers: [
        { tag: "dns-remote", address: "https://1.1.1.1/dns-query", detour: outboundTags[0] },
        { tag: "dns-direct", address: "https://77.88.8.8/dns-query", detour: "direct" },
        { tag: "dns-block", address: "rcode://refused" },
      ],
      rules: [
        { rule_set: "geosite-category-ads-all", server: "dns-block", disable_cache: true },
        { rule_set: ["geosite-ru", "geosite-yandex", "geosite-vk", "geosite-mailru"], server: "dns-direct" },
      ],
    },
    inbounds: [
      { type: "tun", tag: "tun-in", inet4_address: "172.19.0.1/30", inet6_address: "fdfe:dcba:9876::1/126", auto_route: true, strict_route: true, sniff: true, sniff_override_destination: false },
    ],
    outbounds: [
      ...outbounds,
      { type: "urltest", tag: "auto", outbounds: outboundTags, url: "https://www.gstatic.com/generate_204", interval: "5m" },
      { type: "direct", tag: "direct" },
      { type: "block", tag: "block" },
      { type: "dns", tag: "dns-out" },
    ],
    route: {
      rules: [
        { protocol: "dns", outbound: "dns-out" },
        { rule_set: "geosite-category-ads-all", outbound: "block" },
        { rule_set: ["geosite-ru", "geosite-yandex", "geosite-vk", "geosite-mailru"], outbound: "direct" },
        { rule_set: ["geoip-ru"], outbound: "direct" },
        { ip_cidr: ["77.88.0.0/18", "87.250.224.0/19", "93.158.134.0/23", "213.180.192.0/19", "5.45.192.0/18", "5.255.192.0/18", "77.75.152.0/21", "87.240.128.0/18", "93.186.224.0/20", "95.142.192.0/20", "95.213.0.0/18", "185.32.185.0/24", "185.16.148.0/22"], outbound: "direct" },
      ],
      rule_set: [
        { type: "remote", tag: "geosite-ru", format: "binary", url: "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-category-ru.srs" },
        { type: "remote", tag: "geosite-yandex", format: "binary", url: "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-yandex.srs" },
        { type: "remote", tag: "geosite-vk", format: "binary", url: "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-vk.srs" },
        { type: "remote", tag: "geosite-mailru", format: "binary", url: "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-mailru.srs" },
        { type: "remote", tag: "geoip-ru", format: "binary", url: "https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/geoip-ru.srs" },
        { type: "remote", tag: "geosite-category-ads-all", format: "binary", url: "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-category-ads-all.srs" },
      ],
      auto_detect_interface: true,
      final: "auto",
    },
    experimental: { cache_file: { enabled: true } },
  };
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
    const userInfo = `upload=0; download=0; total=0; expire=${Math.floor(expiresAt.getTime() / 1000)}`;

    const ua = request.headers.get("user-agent") ?? "";
    const format = request.nextUrl.searchParams.get("format");
    const wantSingbox = format === "singbox" || /sing-?box|happ/i.test(ua);

    if (wantSingbox) {
      const config = buildSingboxConfig(vpnKey, subType);
      if (config) {
        return new Response(JSON.stringify(config, null, 2), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "profile-title": "Atlas Secure",
            "subscription-userinfo": userInfo,
            "profile-update-interval": "3",
          },
        });
      }
    }

    const keys = buildKeys(vpnKey, subType);
    const appUrl = await getSubBaseUrl();

    const headers: Record<string, string> = {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "profile-title": "Atlas Secure",
      "subscription-userinfo": userInfo,
      "profile-update-interval": "3",
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
