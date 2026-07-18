"use client";

import { create } from "zustand";

export const LANGUAGES = [
  { code: "lo", label: "ລາວ" },
  { code: "th", label: "ไทย" },
  { code: "en", label: "ENG" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

const STORAGE_KEY = "emenu-lang";

function isLangCode(value: string | null): value is LangCode {
  return !!value && LANGUAGES.some((l) => l.code === value);
}

type LangStore = {
  lang: LangCode;
  hydrated: boolean;
  setLang: (code: LangCode) => void;
  /** Read the persisted language from localStorage (call once on the client). */
  hydrate: () => void;
};

export const useLangStore = create<LangStore>((set) => ({
  // Default to Lao so the server-rendered markup matches the first client paint.
  lang: "lo",
  hydrated: false,
  setLang: (code) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, code);
    }
    set({ lang: code });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    set((prev) => ({
      hydrated: true,
      lang: isLangCode(stored) ? stored : prev.lang,
    }));
  },
}));
