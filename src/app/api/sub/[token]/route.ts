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

const RU_DOMAINS = [
  "domain:ru", "domain:su", "domain:xn--p1ai",
  "domain:yandex.com", "domain:yandex.net", "domain:ya.ru", "domain:yastatic.net",
  "domain:vk.com", "domain:vk.me", "domain:vkontakte.ru", "domain:vkuserid.com", "domain:vkuser.net", "domain:userapi.com",
  "domain:mail.ru", "domain:mycdn.me", "domain:imgsmail.ru",
  "domain:sberbank.ru", "domain:gosuslugi.ru", "domain:mos.ru",
  "domain:wildberries.ru", "domain:wb.ru", "domain:ozon.ru", "domain:ozon.st",
  "domain:avito.ru", "domain:kinopoisk.ru", "domain:ivi.ru", "domain:okko.tv",
];

const RU_IPS = [
  "77.88.0.0/18", "87.250.224.0/19", "93.158.134.0/23", "213.180.192.0/19",
  "5.45.192.0/18", "5.255.192.0/18",
  "77.75.152.0/21", "87.240.128.0/18", "93.186.224.0/20",
  "95.142.192.0/20", "95.213.0.0/18",
  "185.32.185.0/24", "185.16.148.0/22",
];

function buildXrayConfig(vpnKey: string, subscriptionType: string): object | null {
  const match = vpnKey.match(/vless:\/\/([^@]+)@([^:]+):/);
  if (!match) return null;
  const uuid = match[1];

  const configs = subscriptionType === "plus"
    ? [...BASIC_CONFIGS, ...PLUS_EXTRA_CONFIGS]
    : BASIC_CONFIGS;

  const sniffing = {
    enabled: true,
    destOverride: ["http", "tls", "fakedns"],
    routeOnly: true,
  };

  return {
    remarks: "Atlas Secure",
    dns: {
      queryStrategy: "UseIPv4",
      servers: [
        { address: "77.88.8.8", detour: "direct", domains: ["geosite:category-ru"] },
        { address: "https://8.8.8.8/dns-query", detour: "proxy" },
      ],
      tag: "dns-inbound",
    },
    inbounds: [
      { tag: "socks", listen: "127.0.0.1", port: 10808, protocol: "socks", settings: { auth: "noauth", udp: true }, sniffing },
      { tag: "http", listen: "127.0.0.1", port: 10809, protocol: "http", settings: { allowTransparent: false }, sniffing },
    ],
    outbounds: [
      ...configs.map((c, i) => ({
        tag: i === 0 ? "proxy" : `proxy-${i}`,
        protocol: "vless",
        settings: {
          vnext: [{
            address: c.ip,
            port: c.port,
            users: [{ id: uuid, encryption: "none", ...(c.flow ? { flow: "xtls-rprx-vision" } : {}) }],
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
            show: false,
          },
          ...(c.type === "tcp" ? { tcpSettings: {} } : {}),
          ...(c.type === "xhttp" ? { xhttpSettings: { path: c.path || "/xhttp" } } : {}),
        },
      })),
      { protocol: "freedom", tag: "direct" },
      { protocol: "blackhole", tag: "block" },
      { protocol: "dns", tag: "dns-out" },
    ],
    routing: {
      domainStrategy: "IPIfNonMatch",
      rules: [
        { type: "field", inboundTag: ["dns-inbound"], outboundTag: "proxy", ruleTag: "dns-to-proxy" },
        { type: "field", port: "53", outboundTag: "dns-out", ruleTag: "dns-hijack" },
        { type: "field", protocol: ["bittorrent"], outboundTag: "block" },
        { type: "field", network: "udp", port: "443", outboundTag: "block" },
        { type: "field", ip: ["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"], outboundTag: "proxy" },
        { type: "field", domain: ["geosite:private", "geosite:apple", "geosite:category-ru"], outboundTag: "direct" },
        { type: "field", ip: ["geoip:ru", "geoip:private"], outboundTag: "direct" },
        { type: "field", port: "0-65535", outboundTag: "proxy" },
      ],
    },
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
    const format = request.nextUrl.searchParams.get("format");

    if (format === "json") {
      const config = buildXrayConfig(vpnKey, subType);
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
