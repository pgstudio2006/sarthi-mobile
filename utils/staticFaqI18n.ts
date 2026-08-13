import { AppLanguage } from '../i18n/translations';

export type StaticFaqKey = string;

export const STATIC_FAQ_I18N: Record<AppLanguage, Record<StaticFaqKey, { title: string; body: string }>> & { Tamil?: Record<StaticFaqKey, { title: string; body: string }> } = {
  English: {},
  Hindi: {},
  Gujarati: {},
  Kannada: {},
  Tamil: {},
};

export function translateStaticFaq(key: string, lang: AppLanguage, fallback: { title: string; body: string }): { title: string; body: string } {
  const entry = STATIC_FAQ_I18N[lang]?.[key];
  if (entry) return entry;
  return fallback;
}
