"use client";

import { createContext, useContext } from "react";
import type { Translations } from "./types";
import { ru } from "./ru";

export type { Translations };
export const t = ru;

type I18nContextValue = {
  t: Translations;
};

export const I18nContext = createContext<I18nContextValue>({ t: ru });

export function useI18n() {
  return useContext(I18nContext);
}
