import {
  calculateNatalChart, calculateNatalChartForUser, calculateTransits, Transit,
} from './engine';
import { User } from '../database/queries';
import { generateAstrologyText } from '../ai/llm';
import { formatUserLocalDate, getUserLocalDateParts, resolveUserTimezone } from './timezone';
import { getUserLang, t, TranslationKey } from '../i18n';
import { translatePlanet } from '../i18n/astro';
import { LangCode } from '../i18n/languages';

const ASPECT_KEYS: Record<string, TranslationKey> = {
  conjunction: 'transit.aspect.conjunction',
  opposition: 'transit.aspect.opposition',
  trine: 'transit.aspect.trine',
  square: 'transit.aspect.square',
  sextile: 'transit.aspect.sextile',
};

const HINT_KEYS: Record<string, TranslationKey> = {
  harmonious: 'transit.hint.harmonious',
  challenging: 'transit.hint.challenging',
  neutral: 'transit.hint.neutral',
};

export interface TransitListItem extends Transit {
  transitPlanetRu: string;
  natalPlanetRu: string;
  aspectRu: string;
  hint: string;
  text: string;
}

export interface TransitForecastResult {
  content: string;
  transits: TransitListItem[];
}

function aspectLabel(lang: LangCode, aspectType: string): string {
  const key = ASPECT_KEYS[aspectType];
  return key ? t(lang, key) : aspectType;
}

function buildTransitFallback(transits: Transit[], lang: LangCode): string {
  if (transits.length === 0) {
    return t(lang, 'transit.calm_day');
  }

  const lines = transits.map(tr => {
    const icon = tr.energy === 'harmonious' ? '✅' : tr.energy === 'challenging' ? '⚠️' : '➡️';
    return t(lang, 'transit.line', {
      icon,
      transitPlanet: translatePlanet(lang, tr.transitPlanet),
      aspect: aspectLabel(lang, tr.aspectType),
      natalPlanet: translatePlanet(lang, tr.natalPlanet),
    });
  });

  return `${t(lang, 'transit.title')}\n${t(lang, 'transit.subtitle')}\n\n${lines.join('\n')}`;
}

function formatTransitList(transits: Transit[], lang: LangCode): TransitListItem[] {
  return transits.map(tr => ({
    ...tr,
    transitPlanetRu: translatePlanet(lang, tr.transitPlanet),
    natalPlanetRu: translatePlanet(lang, tr.natalPlanet),
    aspectRu: aspectLabel(lang, tr.aspectType),
    hint: t(lang, HINT_KEYS[tr.energy] || 'transit.hint.neutral'),
    text: t(lang, 'transit.line', {
      icon: '',
      transitPlanet: translatePlanet(lang, tr.transitPlanet),
      aspect: aspectLabel(lang, tr.aspectType),
      natalPlanet: translatePlanet(lang, tr.natalPlanet),
    }).trim(),
  }));
}

export function computeTodayTransits(user: User): { transits: Transit[]; natalChart: ReturnType<typeof calculateNatalChartForUser> } {
  const lat = user.birth_lat || 0;
  const lon = user.birth_lon || 0;
  const tz = resolveUserTimezone(user.timezone);
  const natalChart = calculateNatalChartForUser(
    user.birth_date!.trim(), user.birth_time, lat, lon, tz
  );
  const todayParts = getUserLocalDateParts(user);
  const transitChart = calculateNatalChart(
    todayParts.year, todayParts.month, todayParts.day, 12, 0, 0, 0
  );
  const transits = calculateTransits(natalChart, transitChart).slice(0, 6);
  return { transits, natalChart };
}

export async function generateTransitForecastResult(user: User): Promise<TransitForecastResult> {
  const lang = getUserLang(user);
  const { transits, natalChart } = computeTodayTransits(user);
  const fallback = buildTransitFallback(transits, lang);
  const transitList = formatTransitList(transits, lang);

  if (transits.length === 0) {
    return { content: fallback, transits: transitList };
  }

  const today = formatUserLocalDate(user);
  const orbLabel = t(lang, 'transit.orb_label');
  const transitData = transits.map(tr =>
    `${translatePlanet(lang, tr.transitPlanet)} ${aspectLabel(lang, tr.aspectType)} ` +
    `${translatePlanet(lang, tr.natalPlanet)} (${tr.energy}, ${orbLabel} ${tr.orb.toFixed(1)}°)`
  ).join('\n');

  const content = await generateAstrologyText(
    t(lang, 'ai.transits'),
    `Sun ${natalChart.sun.sign}, Moon ${natalChart.moon.sign}, Asc ${natalChart.ascendant.sign}\n` +
      `Date: ${today}\n${transitData}`,
    fallback,
    520,
    60_000,
    lang
  );

  return { content, transits: transitList };
}
