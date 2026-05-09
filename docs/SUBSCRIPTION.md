# Архитектура подписки Atlas

## 0. Высокоуровневый поток

```
Telegram WebApp           Next.js API                    БД (Postgres)
     │                        │                                │
     │  GET /api/subscription │                                │
     │  + initData header     │                                │
     │───────────────────────▶│                                │
     │                        │  validateInitData(HMAC)        │
     │                        │  SELECT FROM subscriptions ───▶│
     │                        │◀────────────────────────────── │
     │                        │  build sub_url with HMAC token │
     │  { is_active, sub_url, │                                │
     │    days_left, … }      │                                │
     │◀───────────────────────│                                │
     │                        │                                │
     │  /api/sub/<token>?id=X │                                │
     │   (клиент VPN/Happ)    │                                │
     │───────────────────────▶│                                │
     │                        │  HMAC check token              │
     │                        │  SELECT vpn_key, subscription_ │
     │                        │      type ────────────────────▶│
     │                        │◀────────────────────────────── │
     │                        │  buildKeys() / buildXrayConfigs│
     │   text | JSON +        │                                │
     │   subscription headers │                                │
     │◀───────────────────────│                                │
```

---

## 1. Где живёт подписочный токен (`sub_url`)

**Файл:** `src/app/api/subscription/route.ts`

1. Клиент (мини-апп `HomeClient.tsx:105`) делает `GET /api/subscription?telegram_id=<id>` с заголовком `x-telegram-init-data`.
2. `validateInitData()` (`subscription/route.ts:12-61`) проверяет initData по схеме Telegram:
   - secret = `HMAC_SHA256("WebAppData", BOT_TOKEN)`
   - проверяемый hash = `HMAC_SHA256(secret, sortedKVs)`
   - срок жизни — 24 ч (`auth_date`).
3. Из БД читается активная подписка:
   ```sql
   SELECT expires_at, subscription_type
   FROM subscriptions
   WHERE telegram_id = $1 AND expires_at > NOW()
   ORDER BY expires_at DESC LIMIT 1
   ```
4. Генерится **sub-токен** (`subscription/route.ts:116-120`):
   ```
   subToken = HMAC_SHA256(BOT_TOKEN, str(telegramId))
              .digest(base64url)
              .substring(0, 32)
   ```
   Это 32 url-safe символа, детерминированно от `telegramId`. Без знания `BOT_TOKEN` подделать невозможно.
5. `appUrl = await getSubBaseUrl()` (см. §2).
6. Возвращается JSON:
   ```json
   {
     "is_active": true,
     "name": "<sanitized first_name>",
     "tariff": "basic" | "plus" | "business",
     "expires_at": "...",
     "expires_formatted": "5 май 2026",
     "days_left": 30,
     "sub_url": "https://atlassecure.ru/api/sub/<subToken>?id=<telegramId>"
   }
   ```

`sub_url` — это **ровно та ссылка**, которую клиент копирует/импортирует в Happ/v2rayTun/Hiddify.

---

## 2. База-домен с фейловером

**Файл:** `src/lib/subDomain.ts`

```ts
PRIMARY  = process.env.SUB_DOMAIN_PRIMARY ?? "https://atlassecure.ru"
FALLBACK = process.env.NEXT_PUBLIC_APP_URL  // без trailing slash
```

`getSubBaseUrl()`:
- HEAD-чек `${PRIMARY}/api/sub/health` (ручка `src/app/api/sub/health/route.ts` — отдаёт `200 ok` на GET/HEAD).
- Любой ответ < 500 за 4 с ⇒ домен живой.
- Кэш на 5 минут в памяти процесса.
- Если PRIMARY мёртв ⇒ FALLBACK.

Зачем: если основной домен заблокируют, миниап автоматически начнёт раздавать ссылки на резервный домен.

---

## 3. Подписочная ручка `/api/sub/[token]`

**Файл:** `src/app/api/sub/[token]/route.ts` (`GET` обработчик в `route.ts:264-361`)

### 3.1 Авторизация
```ts
expected = HMAC_SHA256(BOT_TOKEN, str(telegramId))
           .base64url
           .substring(0, 32)
if (token !== expected || !telegramId) → 401
```
Токен **проверяется как функция от `id` query-параметра**. Поэтому ссылка вида `/api/sub/<token>?id=<telegramId>` стабильна, можно жать F5 в клиенте.

### 3.2 Чтение БД
```sql
SELECT expires_at, subscription_type, vpn_key
FROM subscriptions
WHERE telegram_id = $1 AND expires_at > NOW()
ORDER BY expires_at DESC LIMIT 1
```
- `vpn_key` — это исходная VLESS-ссылка от RemnaWave/панели (в формате `vless://<uuid>@<host>:<port>?...`). Из неё извлекается **только UUID** (`route.ts:31`).
- `subscription_type` определяет, использовать `BASIC_CONFIGS` или `BASIC_CONFIGS + PLUS_EXTRA_CONFIGS`. Сейчас Plus-массив пуст.

### 3.3 Согласование формата ответа (`route.ts:306-307`)
```ts
const ua       = headers["user-agent"] ?? ""
const format   = ?format query
const wantJson = format === "json" || /^Happ\//i.test(ua)
```
- **JSON-ветка** — для Happ или явно `?format=json`.
- **Текст** — все остальные клиенты (v2rayTun, Streisand, Hiddify, sing-box importers и т.д.).

---

## 4. Что отдаётся в каждом формате

### 4.1 Текст (`Content-Type: text/plain`)
Билдер `buildKeys()` (`route.ts:32-49`). На каждый сервер из `BASIC_CONFIGS`:
```
vless://<uuid>@<ip|domain>:<port>?
        encryption=none
       &security=reality
       &sni=<sni>
       &fp=<chrome|firefox>
       &pbk=<reality public key>
       &sid=<short id>
       [&flow=xtls-rprx-vision]   # если flow=true
       &type=tcp                   # либо
       &type=xhttp&path=<urlenc>   # для XHTTP
        #<URL-encoded имя>
```

Все ссылки склеиваются через `\n`. Файл скачивается с заголовком `content-disposition: attachment; filename="Atlas Secure.txt"`.

### 4.2 JSON (`Content-Type: application/json`)
Билдер `buildXrayConfigs()` (`route.ts:69-262`). Возвращается **массив** xray-конфигов — по одному на каждый сервер. Структура одного объекта:
```json
{
  "remarks": "<имя сервера>",
  "dns":      { ... },
  "inbounds": [socks 10808, http 10809],
  "outbounds": [
    { "tag":"proxy", "protocol":"vless", "settings":{vnext:[…]},
      "streamSettings": {
        "network": "tcp"|"xhttp",
        "security": "reality",
        "realitySettings": { serverName, fingerprint, publicKey, shortId },
        "tcpSettings"|"xhttpSettings": { … }
      } },
    { "protocol":"freedom",   "tag":"direct"  },
    { "protocol":"blackhole", "tag":"block"   },
    { "protocol":"dns",       "tag":"dns-out" }
  ],
  "routing": { domainStrategy:"IPIfNonMatch", rules:[ … ] }
}
```

---

## 5. Логика роутинга (одинаковая для всех серверов в JSON)

`buildXrayConfigs()` строит массив правил (`route.ts:97-244`):

| # | Правило | outbound | Зачем |
|---|---------|----------|-------|
| 1 | inbound `dns-inbound` | `proxy` | DoH-запросы идут через туннель |
| 2 | port 53 | `dns-out` | хайджек системного DNS |
| 3 | protocol `bittorrent` | `block` | торренты режем |
| 4 | UDP/443 | `block` | блок QUIC, форсим TCP/TLS |
| 5 | публичные DNS (8.8.8.8, 1.1.1.1, …) | `proxy` | не светим резолверы |
| 6 | наши домены + ЮKassa/ЮMoney | `proxy` | сабскрипшн и платежи через VPN |
| 7 | `geosite:category-ru` + `geosite:apple` + ~210 ru-доменов (Сбер/банки/госуслуги/маркетплейсы/Яндекс/телеком/MAX/…) | `direct` | RU-сервисы мимо туннеля |
| 8 | `geoip:ru` + `geoip:private` | `direct` | то же на уровне IP |
| 9 | port `0-65535` | `proxy` | всё остальное |

DNS:
- 77.88.8.8 (Yandex DNS) для `category-ru` через `direct`
- DoH `https://8.8.8.8/dns-query` через `proxy`

---

## 6. Subscription-метаданные в HTTP-заголовках

Что бы клиент ни запросил, ответ снабжается заголовками RFC sub-userinfo + Happ-расширения (`route.ts:309-323`, общий блок):
```
profile-title:                  Atlas Secure
subscription-userinfo:          upload=0; download=0; total=0; expire=<unix>
profile-update-interval:        1
support-url:                    https://t.me/atlassecure_bot
subscription-autoconnect:       1
subscription-autoconnect-type:  lowestdelay
subscription-ping-onopen-enabled: 1
notification-subs-expire:       1
sub-expire:                     1
sub-expire-button-link:         https://t.me/atlassecure_bot?start=buy
hide-settings:                  1
color-profile:                  resetcolors
per-app-proxy-mode:             bypass
per-app-proxy-list:             ru.roskazna.gosuslugi, ru.sberbankmobile,
                                com.idamob.tinkoff.android, ru.alfabank.mobile.android,
                                ru.vtb24.mobilebanking.android, ru.mts.mymts,
                                ru.nalog.lknpd, ru.gosuslugi.pos, com.vk.im, …
```
Только в текстовом ответе ещё:
```
content-disposition:    attachment; filename="Atlas Secure.txt"
profile-web-page-url:   <appUrl>/api/sub/<token>?id=<id>
```
`profile-web-page-url` позволяет клиенту повторно проверять/обновлять подписку.

---

## 7. Параллельная ручка для deep-link `/api/connect-link`

**Файл:** `src/app/api/connect-link/route.ts`

Используется кнопками типа «Подключить v2RayTun одним тапом». Тот же initData-чек, читает `vpn_key`/`vpn_key_plus`, base64-кодирует и возвращает:
```
v2raytun://install?url=<base64(vless://...)>
```
Это **одна** ссылка для одного сервера (тот, что записан в БД), а не вся подписка. Подписочная (мульти-серверная) ссылка — это `/api/sub/<token>`.

---

## 8. Серверы и их источник истины

`BASIC_CONFIGS` в `src/app/api/sub/[token]/route.ts:23-32` — это hardcoded TS-массив. БД не содержит список серверов; там только UUID юзера + срок + тариф. Изменение состава серверов = деплой.

Текущий состав (8 шт., все `vless+reality+chrome` если не указано):

| # | Имя | Address:Port | Network | SNI | FP | shortId |
|---|-----|--------------|---------|-----|----|---------|
| 1 | 🇳🇱 Atlas Fast #1 ⚡️ | `5.255.126.237:443` | tcp + flow | `www.apple.com` | chrome | `3f9fa000` |
| 2 | 🇩🇪 Atlas Fast #2 ⚡️ | `77.221.156.97:4443` | tcp + flow | `api-maps.yandex.ru` | chrome | `a1b2c3d4` |
| 3 | 🇩🇪 Atlas Fast #3 ⚡️ | `45.144.55.159:4443` | tcp + flow | `flowgrocery.com` | chrome | `a1b2c3d4` |
| 4 | 🇷🇺 YouTube \| Без рекламы | `92.255.76.7:443` | tcp + flow | `max.ru` | chrome | `d4a09544` |
| 5 | 🇺🇸 Atlas USA ⚡️ | `us1.atlassecure.uk:443` | tcp + flow | `www.netflix.com` | chrome | `af819b4bfd529732` |
| 6 | 🇪🇪 Atlas Estonia ⚡️ | `es1.atlassecure.uk:443` | tcp + flow | `e-estonia.com` | chrome | `6b49d21ebeb946e9` |
| 7 | 🇳🇱 Atlas Fast #4 ⚡️ | `185.35.139.195:4443` | tcp + flow | `max.ru` | chrome | `fe6cccae` |
| 8 | 🇳🇱 Atlas Dev | `5.255.126.237:8443` | xhttp `/api` | `ign.com` | firefox | `75c72fb73639b286` |

Все они **используют один и тот же UUID** юзера — тот, что в `vpn_key` в БД. То есть UUID, выданный изначально RemnaWave, валиден на всех серверах: на каждом VLESS-инбаунде должен быть прописан этот UUID (или общий пул через Remnawave-sync).

---

## 9. Безопасность и секреты

| Секрет | Где |
|--------|-----|
| `BOT_TOKEN` | env. Используется и для проверки initData, и для генерации/валидации sub-токена. **Утечка = подделка любых ссылок.** |
| `DATABASE_URL` | env. Postgres pool в `src/lib/db.ts` (max 5 коннектов). |
| Reality public keys (pbk) | hardcoded в массиве — это публичные значения, ок. |
| Reality private keys, API keys серверов (`x-api-key`) | НЕ должны быть в этом репо. Они на стороне VPN-нод. |

---

## 10. ENV-переменные, от которых всё зависит

```
BOT_TOKEN              Telegram bot token (HMAC ключ)
DATABASE_URL           Postgres
SUB_DOMAIN_PRIMARY     https://atlassecure.ru (по умолчанию)
NEXT_PUBLIC_APP_URL    fallback для sub-URL
```

---

## TL;DR

1. Юзер открывает миниап → миниап даёт `/api/subscription` с initData.
2. Сервер выдаёт `sub_url = https://atlassecure.ru/api/sub/<HMAC32(telegramId)>?id=<telegramId>`.
3. Юзер вставляет ссылку в VPN-клиент → клиент GET-ит её.
4. Сервер проверяет HMAC, читает UUID из БД, склеивает 8 vless-ссылок (или 8 xray-конфигов) на основе hardcoded `BASIC_CONFIGS` и отдаёт с subscription-заголовками.
5. Клиент парсит, добавляет 8 серверов, использует `lowestdelay` для автоконнекта, обновляется по `profile-update-interval`.
