import { User } from '../database/queries';
import {
  LangCode, PENDING_LANGUAGE, SUPPORTED_LANGUAGES,
  normalizeLangCode, isLanguagePending, getLanguageName, DATE_LOCALES,
} from './languages';
import { TRANSLATIONS, TranslationKey } from './translations';

export { LangCode, PENDING_LANGUAGE, SUPPORTED_LANGUAGES, normalizeLangCode, isLanguagePending, getLanguageName, DATE_LOCALES, TranslationKey };

export function resolveUserLang(
  user?: Pick<User, 'language_code'> | { language_code?: string | null } | null,
  telegramLanguageCode?: string
): LangCode {
  const code = user?.language_code;
  if (code && !isLanguagePending(code)) {
    return normalizeLangCode(code);
  }
  if (telegramLanguageCode) {
    return normalizeLangCode(telegramLanguageCode);
  }
  return normalizeLangCode(code);
}

export function getUserLang(user?: Pick<User, 'language_code'> | { language_code?: string | null } | null): LangCode {
  return resolveUserLang(user);
}

export function t(
  lang: LangCode | string,
  key: TranslationKey,
  params?: Record<string, string>
): string {
  const code = normalizeLangCode(lang);
  let text = TRANSLATIONS[code]?.[key] || TRANSLATIONS.en[key] || TRANSLATIONS.ru[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
  }
  return text;
}

export function tUser(user: Pick<User, 'language_code'> | null | undefined, key: TranslationKey, params?: Record<string, string>): string {
  return t(getUserLang(user), key, params);
}

export function getGuideText(lang: LangCode): string {
  return `${t(lang, 'guide.title')}\n\n${t(lang, 'guide.body')}`;
}

export function formatLocalizedDate(
  langOrUser: LangCode | string | Pick<User, 'language_code'> | null | undefined,
  value: string | Date,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
): string {
  const lang = langOrUser && typeof langOrUser === 'object' && 'language_code' in langOrUser
    ? getUserLang(langOrUser)
    : normalizeLangCode(langOrUser as string);
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString(DATE_LOCALES[lang], options);
}

export function getAiLanguageInstruction(lang: LangCode): string {
  const instructions: Record<LangCode, string> = {
    ru: 'Пиши на русском языке.',
    en: 'Write in English.',
    es: 'Escribe en español.',
    ar: 'اكتب باللغة العربية.',
  };
  return instructions[normalizeLangCode(lang)] || instructions.en;
}
