import { DateTime } from 'luxon';
import { getUserLang, LangCode, normalizeLangCode } from '../i18n';

/** DB default is UTC; treat it as unset so daily horoscope uses local calendar day */
export function resolveUserTimezone(timezone?: string | null): string {
  if (!timezone || timezone === 'UTC') return 'Europe/Moscow';
  return timezone;
}

export function getUserLocalDateTime(user: { timezone?: string | null }): DateTime {
  return DateTime.now().setZone(resolveUserTimezone(user.timezone));
}

export function getUserLocalDateParts(user: { timezone?: string | null }): {
  year: number;
  month: number;
  day: number;
} {
  const dt = getUserLocalDateTime(user);
  return { year: dt.year, month: dt.month, day: dt.day };
}

export function formatUserLocalDate(
  user: { timezone?: string | null; language_code?: string | null },
  style: 'long' | 'iso' = 'long'
): string {
  const dt = getUserLocalDateTime(user);
  if (style === 'iso') return dt.toISODate() || '';
  const lang = getUserLang(user);
  const locale = lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : lang;
  return dt.setLocale(locale).toFormat('d MMMM yyyy');
}

export function localBirthToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezone = 'Europe/Moscow'
): { year: number; month: number; day: number; hour: number; minute: number } {
  const local = DateTime.fromObject(
    { year, month, day, hour, minute },
    { zone: timezone || 'Europe/Moscow' }
  );
  const utc = local.toUTC();
  return {
    year: utc.year,
    month: utc.month,
    day: utc.day,
    hour: utc.hour,
    minute: utc.minute,
  };
}

export function getLocalDateKey(timezone = 'Europe/Moscow'): string {
  const tz = resolveUserTimezone(timezone);
  return DateTime.now().setZone(tz).toISODate() || new Date().toISOString().split('T')[0];
}

/** Cache key includes language so horoscope regenerates when user switches language */
export function getHoroscopeCacheKey(user: { timezone?: string; language_code?: string | null }): string {
  return `${getLocalDateKey(user.timezone)}#${getUserLang(user)}`;
}

/** Extract language suffix from horoscope cache key (e.g. 2026-06-10#es → es) */
export function parseLangFromHoroscopeKey(cacheKey: string): LangCode | null {
  const idx = cacheKey.lastIndexOf('#');
  if (idx < 0) return null;
  const code = cacheKey.slice(idx + 1);
  if (!/^[a-z]{2}$/i.test(code)) return null;
  return normalizeLangCode(code);
}

export function isNineAmInTimezone(timezone = 'Europe/Moscow'): boolean {
  const now = DateTime.now().setZone(resolveUserTimezone(timezone));
  return now.hour === 9;
}

export function getCurrentMonthKey(timezone = 'Europe/Moscow'): string {
  const now = DateTime.now().setZone(resolveUserTimezone(timezone));
  return `${now.year}-${String(now.month).padStart(2, '0')}`;
}
