"use client";

import { createContext, useContext } from "react";
import type { Locale, Translations } from "./types";
import { ru } from "./ru";
import { en } from "./en";

export type { Locale, Translations };

const translations: Record<Locale, Translations> = { ru, en };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

type I18nContextValue = {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
};

export const I18nContext = createContext<I18nContextValue>({
  locale: "ru",
  t: ru,
  setLocale: () => {},
});

export function useI18n() {
  return useContext(I18nContext);
}

const LOCALE_KEY = "atlas_locale";

export function getSavedLocale(): Locale {
  if (typeof window === "undefined") return "ru";
  const saved = localStorage.getItem(LOCALE_KEY);
  if (saved === "en" || saved === "ru") return saved;
  return "ru";
}

export function saveLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCALE_KEY, locale);
}
