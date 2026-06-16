import {
  NatalChartData, Transit, ZodiacSign, ZODIAC_SIGNS, ZODIAC_EMOJI,
  calculateNatalChart, calculateNatalChartForUser, calculateTransits,
  calculateSunPosition, parseBirthDate, toJulianDay,
} from './engine';
import { User } from '../database/queries';
import { generateAstrologyText } from '../ai/llm';
import { getUserLang, t } from '../i18n';
import { translateSign, translateMoonPhase } from '../i18n/astro';
import {
  getPlanetMeaning, getSignTheme, getLuckyColor, getWeeklyAreas, getDateLocale,
} from '../i18n/horoscopeContent';
import {
  formatUserLocalDate, getUserLocalDateParts, resolveUserTimezone,
} from './timezone';
import { getMoonPhase } from './features';
import { DateTime } from 'luxon';
import { prepareHoroscopeText } from '../bot/helpers/telegramText';

/** Shared AI limits — daily stays compact; weekly/monthly need more in Mini App. */
const AI_TIMEOUT_MS = 45_000;
const AI_TOKENS = 520;
export const AI_TOKENS_WEEKLY = 1400;
export const AI_TOKENS_MONTHLY = 1600;
export const AI_TIMEOUT_LONG_MS = 90_000;

function getUserSunSign(user: User): ZodiacSign {
  const { year, month, day } = parseBirthDate(user.birth_date!);
  return calculateSunPosition(toJulianDay(year, month, day, 12, 0)).sign;
}

function getMoonPhaseForUserDay(
  user: { timezone?: string | null },
  parts: { year: number; month: number; day: number }
) {
  const tz = resolveUserTimezone(user.timezone);
  const utc = DateTime.fromObject(
    { year: parts.year, month: parts.month, day: parts.day, hour: 12, minute: 0 },
    { zone: tz }
  ).toUTC();
  return getMoonPhase(new Date(Date.UTC(utc.year, utc.month - 1, utc.day, utc.hour, utc.minute)));
}

// ─── Lucky numbers (internal keys use Russian sign names) ─────────────────────

const LUCKY_NUMBERS: Record<ZodiacSign, number[]> = {
  'Овен': [1, 9, 17], 'Телец': [2, 6, 24], 'Близнецы': [3, 12, 21],
  'Рак': [4, 13, 22], 'Лев': [5, 14, 23], 'Дева': [6, 15, 27],
  'Весы': [7, 16, 24], 'Скорпион': [8, 11, 22], 'Стрелец': [9, 18, 27],
  'Козерог': [2, 8, 26], 'Водолей': [4, 11, 22], 'Рыбы': [3, 9, 12],
};

// ─── Free horoscope (sun sign only) ──────────────────────────────────────────

export function generateFreeHoroscope(
  sunSign: ZodiacSign,
  parts: { year: number; month: number; day: number },
  dateStr: string,
  lang = getUserLang(null)
): string {
  const seed = parts.day + parts.month * 31;
  const overview = getSignTheme(lang, sunSign, seed);
  const love = getSignTheme(lang, sunSign, seed + 7);
  const work = getSignTheme(lang, sunSign, seed + 13);
  const advice = getSignTheme(lang, sunSign, seed + 19);
  const numbers = LUCKY_NUMBERS[sunSign];
  const color = getLuckyColor(lang, sunSign);
  const emoji = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(sunSign)];
  const sign = translateSign(lang, sunSign);

  return `${emoji} *${t(lang, 'horoscope.free_title', { sign })}*
📅 ${dateStr}

${t(lang, 'horoscope.free_overview', { text: overview })}

${t(lang, 'horoscope.free_love', { text: love })}
${t(lang, 'horoscope.free_work', { text: work })}
${t(lang, 'horoscope.free_advice', { text: advice })}

${t(lang, 'horoscope.free_lucky_numbers', { numbers: numbers.join(', ') })} · ${t(lang, 'horoscope.free_lucky_color', { color })}`;
}

// ─── Premium personalized horoscope ──────────────────────────────────────────

export function generatePremiumHoroscope(
  user: User,
  natalChart: NatalChartData,
  transits: Transit[],
  dateStr: string,
  parts: { year: number; month: number; day: number }
): string {
  const lang = getUserLang(user);
  const sunSign = natalChart.sun.sign;
  const moonSign = natalChart.moon.sign;
  const risingSign = natalChart.ascendant.sign;
  const sunEmoji = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(sunSign)];
  const moonEmoji = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(moonSign)];
  const risingEmoji = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(risingSign)];

  const harmonious = transits.filter(tr => tr.energy === 'harmonious').slice(0, 2);
  const challenging = transits.filter(tr => tr.energy === 'challenging').slice(0, 1);

  let transitText = '';
  for (const tr of harmonious) {
    const meaning = getPlanetMeaning(lang, tr.transitPlanet, tr.aspectType);
    if (meaning) transitText += `✅ ${meaning}\n`;
  }
  for (const tr of challenging) {
    const meaning = getPlanetMeaning(lang, tr.transitPlanet, tr.aspectType);
    if (meaning) transitText += `⚠️ ${meaning}\n`;
  }

  if (!transitText) {
    const seed = parts.day + parts.month * 31;
    transitText = `✨ ${getSignTheme(lang, sunSign, seed)}\n`;
  }

  const numbers = LUCKY_NUMBERS[sunSign];
  const color = getLuckyColor(lang, sunSign);
  const harmoniousCount = transits.filter(tr => tr.energy === 'harmonious').length;
  const challengingCount = transits.filter(tr => tr.energy === 'challenging').length;
  const energyScore = Math.min(10, Math.max(1, 5 + harmoniousCount - challengingCount));
  const energyBar = '⭐'.repeat(energyScore) + '☆'.repeat(10 - energyScore);

  return `🌟 *${t(lang, 'horoscope.premium_title')}*
📅 ${dateStr}

${t(lang, 'horoscope.premium_triad', {
  sunEmoji, moonEmoji, risingEmoji,
  sun: translateSign(lang, sunSign),
  moon: translateSign(lang, moonSign),
  rising: translateSign(lang, risingSign),
})}

${t(lang, 'horoscope.premium_energy')}
${energyBar}

${t(lang, 'horoscope.premium_transits')}
${transitText.trim()}

${t(lang, 'horoscope.premium_lucky_numbers', { numbers: numbers.join(', ') })} · ${t(lang, 'horoscope.premium_lucky_color', { color })}`;
}

// ─── Generate horoscope for user ──────────────────────────────────────────────

export async function generateDailyHoroscope(user: User, useAi = true): Promise<string> {
  const lang = getUserLang(user);
  const todayParts = getUserLocalDateParts(user);
  const dateStr = formatUserLocalDate(user);

  if (!user.birth_date) {
    return t(lang, 'settings.birth_required');
  }

  const { year, month, day } = parseBirthDate(user.birth_date);
  const moonLine = (moon: ReturnType<typeof getMoonPhaseForUserDay>) =>
    t(lang, 'horoscope.moon_line', {
      emoji: moon.emoji,
      phase: translateMoonPhase(lang, moon.phase),
      sign: translateSign(lang, moon.sign),
    });

  const jd = toJulianDay(year, month, day, 12, 0);
  const sunPos = calculateSunPosition(jd);
  const free = generateFreeHoroscope(sunPos.sign, todayParts, dateStr, lang);
  const moon = getMoonPhaseForUserDay(user, todayParts);
  const text = free + `\n\n${moonLine(moon)}`;

  if (!useAi) return prepareHoroscopeText(text);
  return prepareHoroscopeText(await generateAstrologyText(
    t(lang, 'ai.horoscope_free'),
    `Sign: ${sunPos.sign}\nMoon: ${moon.phase} in ${moon.sign}\nDate: ${dateStr}\nBase:\n${free}`,
    text,
    AI_TOKENS, AI_TIMEOUT_MS, lang
  ));
}

export async function generateTransitForecast(user: User): Promise<string> {
  if (!user.birth_date) {
    return t(getUserLang(user), 'settings.birth_required');
  }
  const { generateTransitForecastResult } = await import('./transits');
  const result = await generateTransitForecastResult(user);
  return result.content;
}

// ─── Weekly horoscope ─────────────────────────────────────────────────────────

export async function generateWeeklyHoroscope(
  user: User,
  useAi = true,
  maxTokens = AI_TOKENS,
  timeoutMs = AI_TIMEOUT_MS
): Promise<string> {
  const lang = getUserLang(user);
  if (!user.birth_date) {
    return t(lang, 'settings.birth_required');
  }

  const sunSign = getUserSunSign(user);
  const sunEmoji = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(sunSign)];

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const locale = getDateLocale(lang);
  const formatDate = (d: Date) => d.toLocaleDateString(locale, { day: 'numeric', month: 'long' });

  const areas = getWeeklyAreas(lang);
  const forecasts = areas.map((area, i) => {
    const seed = area.length + today.getMonth() + i;
    return `${area}: ${getSignTheme(lang, sunSign, seed)}`;
  });

  const numbers = LUCKY_NUMBERS[sunSign];
  const color = getLuckyColor(lang, sunSign);

  const fallback = `${sunEmoji} *${t(lang, 'horoscope.weekly_title')}*
📅 ${formatDate(weekStart)} – ${formatDate(weekEnd)}

${forecasts.join('\n\n')}

${t(lang, 'horoscope.weekly_numbers', { numbers: numbers.join(', ') })}
${t(lang, 'horoscope.weekly_color', { color })}

${t(lang, 'horoscope.weekly_footer', {
  sun: translateSign(lang, sunSign),
  moon: translateSign(lang, sunSign),
})}`;

  if (!useAi) return prepareHoroscopeText(fallback);

  return prepareHoroscopeText(await generateAstrologyText(
    t(lang, 'ai.horoscope_weekly'),
    `Sun: ${sunSign}\nWeek: ${formatDate(weekStart)} – ${formatDate(weekEnd)}`,
    fallback, maxTokens, timeoutMs, lang
  ));
}

export async function generateMonthlyHoroscope(
  user: User,
  maxTokens = AI_TOKENS,
  timeoutMs = AI_TIMEOUT_MS
): Promise<string> {
  const lang = getUserLang(user);
  if (!user.birth_date) {
    return t(lang, 'settings.birth_required');
  }
  const sunSign = getUserSunSign(user);
  const now = new Date();
  const monthName = now.toLocaleDateString(getDateLocale(lang), { month: 'long', year: 'numeric' });
  const sun = translateSign(lang, sunSign);
  const fallback = `🌙 *${t(lang, 'horoscope.monthly_title', { month: monthName })}*\n\n` +
    t(lang, 'horoscope.monthly_body', { sun, moon: sun });

  return prepareHoroscopeText(await generateAstrologyText(
    t(lang, 'ai.horoscope_monthly'),
    `Month: ${monthName}\nSun sign: ${sunSign}`,
    fallback, maxTokens, timeoutMs, lang
  ));
}
