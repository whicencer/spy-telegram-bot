import { LanguageCodes } from "../types/Language";

export function isLanguageCode(langCode: string): langCode is LanguageCodes {
  return Object.values(LanguageCodes).includes(langCode as LanguageCodes);
}