import "server-only";

const dictionaries = {
  en: () => import("../dictionaries/en.json").then((m) => m.default),
  pl: () => import("../dictionaries/pl.json").then((m) => m.default),
  ar: () => import("../dictionaries/ar.json").then((m) => m.default),
};

export type Locale = keyof typeof dictionaries;
export const LOCALES: Locale[] = ["en", "pl", "ar"];

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;

export const getDictionary = async (locale: Locale) => dictionaries[locale]();

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
