/**
 * Subscription domain resolver with health-check caching.
 *
 * Priority: SUB_DOMAIN_PRIMARY ("atlassecure.ru") → NEXT_PUBLIC_APP_URL fallback.
 * The health check result is cached for 5 minutes so we don't hit the network on every request.
 */

const PRIMARY = process.env.SUB_DOMAIN_PRIMARY ?? "https://atlassecure.ru";
const FALLBACK = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

const CACHE_TTL = 5 * 60 * 1000; // 5 min
const CHECK_TIMEOUT = 4_000; // 4 s

let cached: { url: string; ts: number } | null = null;

async function isReachable(origin: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), CHECK_TIMEOUT);
    const res = await fetch(`${origin}/api/sub/health`, {
      method: "HEAD",
      signal: ctrl.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    // Any response (even 404) means the domain resolves & server responds
    return res.status < 500;
  } catch {
    return false;
  }
}

/**
 * Returns the base URL to use for subscription links.
 * Checks PRIMARY domain first, falls back to NEXT_PUBLIC_APP_URL.
 */
export async function getSubBaseUrl(): Promise<string> {
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.url;
  }

  const primaryOk = await isReachable(PRIMARY);
  const url = primaryOk ? PRIMARY : FALLBACK;

  cached = { url, ts: Date.now() };
  return url;
}
