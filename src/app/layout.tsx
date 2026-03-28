import type { Metadata } from "next";
import Script from "next/script";
import { TelegramViewport } from "@/components/TelegramViewport";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlas Secure",
  description: "Подписка и подключение Atlas Secure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased min-h-screen" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
        <TelegramViewport />
        {children}
      </body>
    </html>
  );
}
