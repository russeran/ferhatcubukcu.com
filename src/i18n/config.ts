import { routing } from "./routing";

export const locales = ["en", "tr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = routing.defaultLocale;
