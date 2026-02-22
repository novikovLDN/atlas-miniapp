export type DeviceType = "ios" | "android" | "windows" | "macos" | "unknown";

export function detectDevice(): DeviceType {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  if (/windows/.test(ua)) return "windows";
  if (/mac os x/.test(ua) && !/iphone|ipad/.test(ua)) return "macos";
  return "unknown";
}

export const APP_LINKS = {
  ios: {
    name: "v2RayTun",
    url: "https://apps.apple.com/app/v2raytun/id6476628951",
    icon: "📱",
    deeplink: (subUrl: string) => `v2raytun://import/${subUrl}`,
  },
  android: {
    name: "v2RayTun",
    url: "https://play.google.com/store/apps/details?id=com.v2raytun.android",
    icon: "🤖",
    deeplink: (subUrl: string) => `v2raytun://import/${subUrl}`,
  },
  windows: {
    name: "v2RayN",
    url: "https://github.com/2dust/v2rayN/releases/latest",
    icon: "🖥",
    deeplink: null as ((subUrl: string) => string) | null,
  },
  macos: {
    name: "v2RayTun",
    url: "https://apps.apple.com/app/v2raytun/id6476628951",
    icon: "🍎",
    deeplink: (subUrl: string) => `v2raytun://import/${subUrl}`,
  },
  unknown: {
    name: "v2RayTun",
    url: "https://apps.apple.com/app/v2raytun/id6476628951",
    icon: "📱",
    deeplink: (subUrl: string) => `v2raytun://import/${subUrl}`,
  },
};
