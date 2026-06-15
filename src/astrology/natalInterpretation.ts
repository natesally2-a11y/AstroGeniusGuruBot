import { NatalChartData, calculateAspects } from './engine';
import { generateAstrologyText } from '../ai/llm';
import { getCurrentMonthKey } from './timezone';
import { sanitizeForTelegram } from '../bot/helpers/telegramText';
import { translatePlanet, translateSign } from '../i18n/astro';
import {
  getNatalAiPrompt,
  getNatalFooter,
  isCompleteNatalInterpretation,
} from '../i18n/natalContent';
import { buildDecodingFallbackMarkdown, buildNatalDecoding } from './natalDecoding';

export const NATAL_CACHE_VERSION = 'v5';

export { isCompleteNatalInterpretation, buildNatalDecoding };

export function getNatalInterpretationCacheKey(timezone = 'Europe/Moscow', lang = 'ru'): string {
  const code = (lang || 'ru').toLowerCase().slice(0, 2);
  return `${getCurrentMonthKey(timezone)}-${code}-${NATAL_CACHE_VERSION}`;
}

export async function generateNatalInterpretation(
  chart: NatalChartData,
  timezone = 'Europe/Moscow',
  userName?: string,
  lang = 'ru',
  birth?: { date?: string; time?: string; city?: string; timezone?: string }
): Promise<string> {
  const monthKey = getNatalInterpretationCacheKey(timezone, lang);
  const aspects = calculateAspects(chart).slice(0, 12);

  const chartSummary = [
    `${translatePlanet(lang, 'sun')}: ${translateSign(lang, chart.sun.sign)} ${chart.sun.degree}°`,
    `${translatePlanet(lang, 'moon')}: ${translateSign(lang, chart.moon.sign)} ${chart.moon.degree}°`,
    `${translatePlanet(lang, 'ascendant')}: ${translateSign(lang, chart.ascendant.sign)} ${chart.ascendant.degree}°`,
    `${translatePlanet(lang, 'mercury')}: ${translateSign(lang, chart.mercury.sign)}`,
    `${translatePlanet(lang, 'venus')}: ${translateSign(lang, chart.venus.sign)}`,
    `${translatePlanet(lang, 'mars')}: ${translateSign(lang, chart.mars.sign)}`,
    `${translatePlanet(lang, 'jupiter')}: ${translateSign(lang, chart.jupiter.sign)}`,
    `${translatePlanet(lang, 'saturn')}: ${translateSign(lang, chart.saturn.sign)}`,
    `${translatePlanet(lang, 'uranus')}: ${translateSign(lang, chart.uranus.sign)}`,
    `${translatePlanet(lang, 'neptune')}: ${translateSign(lang, chart.neptune.sign)}`,
    `${translatePlanet(lang, 'pluto')}: ${translateSign(lang, chart.pluto.sign)}`,
    ...aspects.map(a => `Aspect: ${a.planet1}-${a.planet2} ${a.type} orb${a.orb.toFixed(1)}`),
  ].join('\n');

  const fallback = buildDecodingFallbackMarkdown(chart, monthKey, lang);

  const aiPart = await generateAstrologyText(
    getNatalAiPrompt(lang),
    `Month: ${monthKey}\nName: ${userName || 'User'}\nBirth: ${birth?.date || ''} ${birth?.time || ''} ${birth?.city || ''}\n\n${chartSummary}`,
    fallback,
    2800, 55000, lang
  );

  const interpretation = sanitizeForTelegram(aiPart) + '\n\n' + getNatalFooter(lang);
  return interpretation;
}
