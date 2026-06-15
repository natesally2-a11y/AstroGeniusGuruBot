import { getLuckyDay } from './features';
import { parseBirthDate, toJulianDay, calculateSunPosition } from './engine';
import { User } from '../database/queries';
import { generateAstrologyText } from '../ai/llm';
import { getUserLang, t } from '../i18n';
import { formatUserLocalDate } from './timezone';
import { translateSign, translateLuckyColor, translateLuckyStone, translateLuckyTime } from '../i18n/astro';

function buildLuckyFallback(user: User | null | undefined, signIdx: number): string {
  const lang = getUserLang(user);
  const lucky = getLuckyDay(signIdx);
  const sign = translateSign(lang, lucky.sign);
  return (
    `${t(lang, 'lucky.title', { sign })}\n\n` +
    `${t(lang, 'lucky.numbers', { numbers: lucky.numbers.join(', ') })}\n` +
    `${t(lang, 'lucky.color', { color: translateLuckyColor(lang, lucky.color) })}\n` +
    `${t(lang, 'lucky.stone', { stone: translateLuckyStone(lang, lucky.stone) })}\n` +
    `${t(lang, 'lucky.time', { time: translateLuckyTime(lang, lucky.bestTime) })}\n\n` +
    t(lang, 'lucky.footer')
  );
}

export async function formatLuckyDayMessage(user?: User | null): Promise<string> {
  let signIdx = 0;
  if (user?.birth_date) {
    const { year, month, day } = parseBirthDate(user.birth_date);
    const sun = calculateSunPosition(toJulianDay(year, month, day, 12, 0));
    signIdx = sun.signIndex;
  }
  const lucky = getLuckyDay(signIdx);
  const fallback = buildLuckyFallback(user, signIdx);
  const today = formatUserLocalDate(user ?? {});

  return generateAstrologyText(
    t(getUserLang(user), 'ai.lucky'),
    `Sign: ${lucky.sign}\nDate: ${today}\nNumbers: ${lucky.numbers.join(', ')}\n` +
      `Color: ${lucky.color}\nStone: ${lucky.stone}\nBest time: ${lucky.bestTime}`,
    fallback,
    500, 45000, getUserLang(user)
  );
}
