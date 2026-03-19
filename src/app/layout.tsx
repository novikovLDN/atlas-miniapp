import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { TelegramViewport } from "@/components/TelegramViewport";
import "./globals.css";

const geist = localFont({
  src: [
    {
      path: "../../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2",
      style: "normal",
    },
  ],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atlas VPN",
  description: "Подписка и подключение Atlas VPN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
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
      <body className={`${geist.variable} antialiased min-h-screen`}>
        <TelegramViewport />
        {children}
      </body>
    </html>
  );
}
