"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        viewportHeight: number;
        viewportStableHeight: number;
        onEvent: (event: string, callback: () => void) => void;
      };
    };
  }
}

export function TelegramViewport() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      document.documentElement.style.setProperty(
        "--tg-viewport-height",
        tg.viewportHeight + "px"
      );
      document.documentElement.style.setProperty(
        "--tg-viewport-stable-height",
        tg.viewportStableHeight + "px"
      );
      tg.onEvent("viewportChanged", () => {
        document.documentElement.style.setProperty(
          "--tg-viewport-height",
          tg.viewportHeight + "px"
        );
      });
    }
  }, []);
  return null;
}
