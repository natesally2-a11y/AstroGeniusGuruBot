export const PENDING_LANGUAGE = 'pending';

export type LangCode = 'ru' | 'en' | 'es' | 'ar';

export const SUPPORTED_LANGUAGES: Array<{ code: LangCode; label: string; flag: string }> = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

/** Map legacy / Telegram codes to one of the four supported languages */
const LANG_ALIASES: Record<string, LangCode> = {
  ru: 'ru', en: 'en', es: 'es', ar: 'ar',
  uk: 'ru', be: 'ru', kk: 'ru',
  'pt-br': 'en', pt: 'en', de: 'en', fr: 'en', zh: 'en', 'zh-cn': 'en', 'zh-hans': 'en',
  hi: 'en', ja: 'en', ko: 'en', tr: 'en', it: 'en',
};

export function normalizeLangCode(code?: string | null): LangCode {
  if (!code || code === PENDING_LANGUAGE) return 'en';
  const lower = code.toLowerCase();
  if (SUPPORTED_LANGUAGES.some(l => l.code === lower)) return lower as LangCode;
  return LANG_ALIASES[lower] || 'en';
}

export function isLanguagePending(code?: string | null): boolean {
  return !code || code === PENDING_LANGUAGE;
}

export function getLanguageName(code: LangCode): string {
  return SUPPORTED_LANGUAGES.find(l => l.code === code)?.label || code;
}

export const DATE_LOCALES: Record<LangCode, string> = {
  ru: 'ru-RU', en: 'en-US', es: 'es-ES', ar: 'ar-SA',
};
