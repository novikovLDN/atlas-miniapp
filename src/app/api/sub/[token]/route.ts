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

function buildXrayConfigs(vpnKey: string, subscriptionType: string): object[] | null {
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

  const dns = {
    queryStrategy: "UseIPv4",
    servers: [
      { address: "77.88.8.8", detour: "direct", domains: ["geosite:category-ru"] },
      { address: "https://8.8.8.8/dns-query", detour: "proxy" },
    ],
    tag: "dns-inbound",
  };

  const inbounds = [
    { tag: "socks", listen: "127.0.0.1", port: 10808, protocol: "socks", settings: { auth: "noauth", udp: true }, sniffing },
    { tag: "http", listen: "127.0.0.1", port: 10809, protocol: "http", settings: { allowTransparent: false }, sniffing },
  ];

  const routing = {
    domainStrategy: "IPIfNonMatch",
    rules: [
      { type: "field", inboundTag: ["dns-inbound"], outboundTag: "proxy", ruleTag: "dns-to-proxy" },
      { type: "field", port: "53", outboundTag: "dns-out", ruleTag: "dns-hijack" },
      { type: "field", protocol: ["bittorrent"], outboundTag: "block" },
      { type: "field", network: "udp", port: "443", outboundTag: "block" },
      { type: "field", ip: ["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"], outboundTag: "proxy" },
      { type: "field", domain: ["domain:atlassecure.ru", "domain:api.atlassecure.ru", "domain:sub.atlassecure.ru", "domain:rmnw.atlassecure.ru", "domain:yookassa.ru", "domain:yoomoney.ru"], outboundTag: "proxy" },
      {
        type: "field",
        domain: [
          "geosite:category-ru",
          "geosite:apple",
          // Сбер (все сервисы)
          "domain:sber.ru", "domain:sberbank.ru", "domain:sberbank.com", "domain:sbermarket.ru",
          "domain:online.sberbank.ru", "domain:api.sberbank.ru", "domain:api.developer.sber.ru",
          "domain:developers.sber.ru", "domain:fintech.sberbank.ru",
          "domain:sberdevices.ru", "domain:sberavto.com", "domain:sberhealth.ru",
          "domain:sberzvuk.ru", "domain:sberlogistics.ru", "domain:sbermegamarket.ru",
          "domain:sberfood.ru", "domain:sberclass.ru", "domain:sberinsur.ru",
          "domain:sbolbank.ru", "domain:salute.sber.ru", "domain:smartmarket.sber.ru",
          // Банки (приложения и API)
          "domain:tbank.ru", "domain:tinkoff.com", "domain:tinkoff.ru", "domain:tinkoff.business", "domain:tcsbank.ru",
          "domain:tinkoff.id", "domain:cdn-tinkoff.ru",
          "domain:alfabank.ru", "domain:alfaclick.ru", "domain:alfabank.com", "domain:alfadirect.ru",
          "domain:alfa.me", "domain:alfaid.ru",
          "domain:vtb.ru", "domain:vtb24.ru", "domain:vtbbo.ru", "domain:vtb-id.ru",
          "domain:gazprombank.ru", "domain:psbank.ru", "domain:raiffeisen.ru", "domain:rshb.ru",
          "domain:open.ru", "domain:openbroker.ru", "domain:sovcombank.ru", "domain:halvacard.ru",
          "domain:uralsib.ru", "domain:mkb.ru", "domain:rosbank.ru", "domain:unicreditbank.ru",
          "domain:homecredit.ru", "domain:otpbank.ru", "domain:pochtabank.ru", "domain:rencredit.ru",
          "domain:tochka.com", "domain:modulbank.ru", "domain:delo.ru",
          "domain:bspb.ru", "domain:nskbl.ru", "domain:absolutbank.ru", "domain:akbars.ru",
          "domain:centrinvest.ru", "domain:domrfbank.ru", "domain:svoi.ru", "domain:mtsbank.ru",
          "domain:rnkb.ru", "domain:primbank.ru",
          "domain:finam.ru", "domain:bcs.ru", "domain:broker.ru", "domain:moex.com",
          "domain:ybankir.ru", "domain:life-pay.ru", "domain:cloudpayments.ru",
          "domain:paykeeper.ru", "domain:robokassa.ru", "domain:unitpay.ru",
          // Госсервисы и приложения
          "domain:nalog.gov.ru", "domain:nalog.ru", "domain:lknpd.nalog.ru", "domain:fns.ru",
          "domain:npd.nalog.ru", "domain:api-lknpd.nalog.ru", "domain:lkfl2.nalog.ru", "domain:lkip2.nalog.ru",
          "domain:gosuslugi.ru", "domain:esia.gosuslugi.ru", "domain:pos.gosuslugi.ru", "domain:dom.gosuslugi.ru",
          "domain:api.gosuslugi.ru", "domain:mp.gosuslugi.ru", "domain:lk.gosuslugi.ru",
          "domain:mos.ru", "domain:emias.info", "domain:emias.mos.ru", "domain:ag.mos.ru",
          "domain:pfr.gov.ru", "domain:sfr.gov.ru", "domain:fss.ru", "domain:cbr.ru",
          "domain:rosreestr.gov.ru", "domain:rosreestr.ru",
          "domain:mvd.gov.ru", "domain:gibdd.ru", "domain:fssp.gov.ru", "domain:fsin.gov.ru",
          "domain:fas.gov.ru", "domain:customs.gov.ru",
          "domain:gov.ru", "domain:government.ru", "domain:kremlin.ru",
          "domain:duma.gov.ru", "domain:council.gov.ru",
          "domain:zakupki.gov.ru", "domain:torgi.gov.ru", "domain:bus.gov.ru",
          "domain:gu.spb.ru", "domain:uslugi.tatarstan.ru", "domain:dagov.ru",
          "domain:rpn.gov.ru", "domain:minzdrav.gov.ru", "domain:edu.gov.ru",
          "domain:minobrnauki.gov.ru", "domain:mintrud.gov.ru", "domain:minpromtorg.gov.ru",
          "domain:minstroyrf.gov.ru", "domain:mintrans.gov.ru", "domain:mcx.gov.ru",
          "domain:digital.gov.ru", "domain:mid.ru", "domain:mil.ru",
          "domain:rostrud.gov.ru", "domain:rospotrebnadzor.ru", "domain:roszdravnadzor.gov.ru",
          "domain:fstec.ru", "domain:rkn.gov.ru", "domain:genproc.gov.ru",
          "domain:sledcom.ru", "domain:sudrf.ru", "domain:arbitr.ru",
          // Маркетплейсы
          "domain:wildberries.ru", "domain:wb.ru", "domain:wbstatic.net", "domain:wbbasket.ru",
          "domain:ozon.ru", "domain:ozon.st",
          "domain:avito.ru", "domain:avito.st",
          "domain:youla.ru", "domain:kazanexpress.ru", "domain:aliexpress.ru",
          // Доставка
          "domain:cdek.ru", "domain:pochta.ru", "domain:russianpost.ru",
          "domain:boxberry.ru", "domain:dpd.ru", "domain:pecom.ru", "domain:dellin.ru",
          "domain:jde.ru", "domain:dostavista.ru", "domain:nrg-tk.ru",
          "domain:pek.ru", "domain:gtd.ru", "domain:baikalsr.ru", "domain:shiptor.ru", "domain:x5.ru",
          // Карты и навигация
          "domain:2gis.ru", "domain:2gis.com",
          // Яндекс сервисы
          "domain:yandex.ru", "domain:yandex.net", "domain:yandex.com", "domain:ya.ru", "domain:yastatic.net",
          "domain:yandexgo.ru", "domain:taxi.yandex.ru", "domain:go.yandex.ru",
          "domain:kinopoisk.ru", "domain:hd.kinopoisk.ru",
          "domain:yandexpay.ru", "domain:pay.yandex.ru",
          "domain:quasar.yandex.ru", "domain:alice.yandex.ru", "domain:dialogs.yandex.net", "domain:iot.quasar.yandex.ru",
          "domain:lavka.yandex.ru", "domain:market.yandex.ru", "domain:music.yandex.ru",
          "domain:disk.yandex.ru", "domain:cloud.yandex.ru", "domain:practicum.yandex.ru",
          "domain:zen.yandex.ru", "domain:dzen.ru", "domain:edadeal.ru",
          "domain:realty.yandex.ru", "domain:eda.yandex.ru",
          // Недвижимость
          "domain:domclick.ru", "domain:domofond.ru",
          "domain:cian.ru", "domain:n1.ru",
          "domain:pik.ru", "domain:samolet.ru", "domain:lsr.ru", "domain:etagi.com",
          "domain:gis-zhkh.ru", "domain:reformagkh.ru",
          // Транспорт и авиа
          "domain:aviasales.ru", "domain:aviasales.com",
          "domain:tutu.ru", "domain:rzd.ru",
          "domain:pobeda.aero", "domain:aeroflot.ru", "domain:s7.ru",
          "domain:utair.ru", "domain:nordwindairlines.ru", "domain:smartavia.ru", "domain:rossiya-airlines.com",
          // ТВ и кино
          "domain:ntv.ru", "domain:ntvplus.ru", "domain:1tv.ru",
          "domain:vgtrk.ru", "domain:russia.tv", "domain:smotrim.ru",
          "domain:ctc.ru", "domain:tnt-online.ru", "domain:rentv.ru", "domain:5-tv.ru",
          "domain:match.tv", "domain:matchtv.ru", "domain:tv-culture.ru",
          "domain:ivi.ru", "domain:okko.tv", "domain:start.ru", "domain:wink.ru",
          "domain:more.tv", "domain:premier.one", "domain:kion.ru",
          "domain:amediateka.ru", "domain:rutube.ru",
          "domain:vk.com", "domain:vk.me", "domain:vkvideo.ru",
          // Телеком
          "domain:ttktv.ru", "domain:ttk.ru", "domain:domru.ru",
          "domain:rt.ru", "domain:rostelecom.ru",
          "domain:mts.ru", "domain:moskva.mts.ru", "domain:login.mts.ru", "domain:api.mts.ru", "domain:mts.kion.ru",
          "domain:megafon.ru", "domain:beeline.ru", "domain:tele2.ru", "domain:yota.ru",
          // Работа
          "domain:hh.ru", "domain:superjob.ru", "domain:rabota.ru", "domain:trudvsem.ru",
          // Ритейл
          "domain:sportmaster.ru", "domain:mvideo.ru", "domain:eldorado.ru",
          "domain:dns-shop.ru", "domain:citilink.ru", "domain:lamoda.ru",
          "domain:letoile.ru", "domain:goldapple.ru", "domain:detmir.ru",
          "domain:litres.ru",
          // Еда и продукты
          "domain:magnit.ru", "domain:lenta.com", "domain:perekrestok.ru",
          "domain:samokat.ru", "domain:dodo.ru", "domain:dodopizza.ru",
          "domain:delivery-club.ru", "domain:vkusvill.ru",
          "domain:pyaterochka.ru", "domain:dixy.ru", "domain:metro-cc.ru", "domain:globus.ru"
        ],
        outboundTag: "direct",
      },
      { type: "field", ip: ["geoip:ru", "geoip:private"], outboundTag: "direct" },
      { type: "field", port: "0-65535", outboundTag: "proxy" },
    ],
  };

  return configs.map((c) => ({
    remarks: c.name,
    dns,
    inbounds,
    outbounds: [
      {
        tag: "proxy",
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
      },
      { protocol: "freedom", tag: "direct" },
      { protocol: "blackhole", tag: "block" },
      { protocol: "dns", tag: "dns-out" },
    ],
    routing,
  }));
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
    const wantJson = format === "json" || /^Happ\//i.test(ua);

    const happThemeJson = JSON.stringify({
      backgroundGradientRotationAngle: 0,
      backgroundGradientColorIntensity: 1,
      backgroundColors: ["#000000FF", "#0A0A0AFF", "#111111FF"],
      backgroundImageType: "none",
      buttonColor: "#FFFFFFFF",
      buttonTextColor: "#000000FF",
      buttonTimerColor: "#000000FF",
      buttonImageType: "dark",
      powerIconColor: "#1A1A1AFF",
      elipseColors: ["#333333FF", "#444444FF", "#555555FF"],
      serverRowBackgroundColor: "#1A1A1A99",
      serverRowTitleTextColor: "#FFFFFFFF",
      serverRowSubTitleTextColor: "#999999FF",
      serverRowChevronColor: "#FFFFFFFF",
      selectedServerRowColor: "#2A2A2AFF",
      subsHeaderColor: "#1A1A1AFF",
      disclosureHeaderTextColor: "#FFFFFFFF",
      disclosureSubHeaderTextColor: "#999999FF",
      subscriptionInfoBackgroundColor: "#1A1A1AFF",
      subscriptionInfoTextColor: "#FFFFFFFF",
      subscriptionTrafficBackgroundColor: "#333333FF",
      topBarButtonsColor: "#FFFFFFFF",
      additionalOptionsButtonColor: "#FFFFFFCC",
      subHeaderButtonColor: "#FFFFFFFF",
      supportIconColor: "#FFFFFFFF",
      profileWebPageIconColor: "#FFFFFFFF",
    });
    const happTheme = "base64:" + Buffer.from(happThemeJson, "utf-8").toString("base64");

    if (wantJson) {
      const configs = buildXrayConfigs(vpnKey, subType);
      if (configs) {
        return new Response(JSON.stringify(configs, null, 2), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "profile-title": "Atlas Secure",
            "subscription-userinfo": userInfo,
            "profile-update-interval": "1",
            "color-profile": happTheme,
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
      "profile-update-interval": "1",
      "content-disposition": 'attachment; filename="Atlas Secure.txt"',
      "color-profile": happTheme,
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
