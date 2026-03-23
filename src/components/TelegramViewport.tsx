"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        viewportHeight: number;
        viewportStableHeight: number;
        onEvent: (event: string, callback: () => void) => void;
        ready: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe: {
          user?: { id: number; first_name?: string; username?: string };
          start_param?: string;
          [key: string]: unknown;
        };
        openInvoice: (url: string, cb?: (status: string) => void) => void;
        openLink: (url: string) => void;
        openTelegramLink: (url: string) => void;
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        [key: string]: unknown;
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
