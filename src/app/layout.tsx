import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { TelegramViewport } from "@/components/TelegramViewport";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
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
      <body className={`${inter.variable} antialiased min-h-screen`}>
        <TelegramViewport />
        {children}
      </body>
    </html>
  );
}
