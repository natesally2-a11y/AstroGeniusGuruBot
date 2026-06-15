import { Api, InlineKeyboard } from 'grammy';
import { User, saveHoroscope } from '../../database/queries';
import { generateDailyHoroscope, generateWeeklyHoroscope, generateMonthlyHoroscope } from '../../astrology/horoscope';
import { generateTransitForecastResult, computeTodayTransits, buildTransitFallback } from '../../astrology/transits';
import { getUserLang } from '../../i18n';
import { isSubscriptionActive } from '../../payments/stars';
import { isAiEnabled } from '../../ai/llm';
import { editMarkdownSafeApi } from './reply';
import { sanitizeForTelegram } from './telegramText';
import { endForecastJob } from './forecastLock';
import { logger } from '../../utils/logger';

const PREMIUM_AI_DEADLINE_MS = 10000;

function isUsableHoroscope(text: string): boolean {
  return text.trim().length >= 120;
}

/** Premium: always have a template; race AI so the user never waits on a hung request. */
export async function generateDailyHoroscopeReliable(user: User): Promise<string> {
  if (!isSubscriptionActive(user)) {
    return generateDailyHoroscope(user, true);
  }

  const template = sanitizeForTelegram(await generateDailyHoroscope(user, false));
  if (!isAiEnabled()) return template;

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const aiResult = await Promise.race([
      generateDailyHoroscope(user, true).then(t => sanitizeForTelegram(t)),
      new Promise<string>((resolve) => {
        timer = setTimeout(() => resolve(template), PREMIUM_AI_DEADLINE_MS);
      }),
    ]);
    return isUsableHoroscope(aiResult) ? aiResult : template;
  } catch (error) {
    logger.warn('Premium daily horoscope AI failed, using template', { error, userId: user.id });
    return template;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function generateWeeklyHoroscopeReliable(user: User): Promise<string> {
  const template = sanitizeForTelegram(await generateWeeklyHoroscope(user, false));
  if (!isSubscriptionActive(user) || !isAiEnabled()) return template;

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const aiResult = await Promise.race([
      generateWeeklyHoroscope(user, true).then(t => sanitizeForTelegram(t)),
      new Promise<string>((resolve) => {
        timer = setTimeout(() => resolve(template), PREMIUM_AI_DEADLINE_MS);
      }),
    ]);
    return isUsableHoroscope(aiResult) ? aiResult : template;
  } catch (error) {
    logger.warn('Premium weekly horoscope AI failed, using template', { error, userId: user.id });
    return template;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function generateMonthlyHoroscopeReliable(user: User): Promise<string> {
  const template = sanitizeForTelegram(await generateMonthlyHoroscope(user, false));
  if (!isAiEnabled()) return template;

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const aiResult = await Promise.race([
      generateMonthlyHoroscope(user, true).then(t => sanitizeForTelegram(t)),
      new Promise<string>((resolve) => {
        timer = setTimeout(() => resolve(template), PREMIUM_AI_DEADLINE_MS);
      }),
    ]);
    return aiResult.trim().length >= 40 ? aiResult : template;
  } catch (error) {
    logger.warn('Monthly horoscope AI failed, using template', { error, userId: user.id });
    return template;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function generateTransitForecastReliable(user: User): Promise<string> {
  const lang = getUserLang(user);
  const { transits } = computeTodayTransits(user);
  const template = sanitizeForTelegram(buildTransitFallback(transits, lang));
  if (!isAiEnabled()) return template;

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const aiResult = await Promise.race([
      generateTransitForecastResult(user).then(r => sanitizeForTelegram(r.content)),
      new Promise<string>((resolve) => {
        timer = setTimeout(() => resolve(template), PREMIUM_AI_DEADLINE_MS);
      }),
    ]);
    return aiResult.trim().length >= 40 ? aiResult : template;
  } catch (error) {
    logger.warn('Transit forecast AI failed, using template', { error, userId: user.id });
    return template;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function runMessageDelivery(params: {
  api: Api;
  chatId: number;
  messageId: number;
  telegramId: number;
  errorText: string;
  keyboard?: InlineKeyboard;
  generate: () => Promise<string>;
}): void {
  const { api, chatId, messageId, telegramId, errorText, keyboard, generate } = params;

  void (async () => {
    try {
      const text = await generate();
      await editMarkdownSafeApi(
        api,
        chatId,
        messageId,
        text,
        keyboard ? { reply_markup: keyboard } : {},
        telegramId
      );
    } catch (error) {
      logger.error('Failed to deliver forecast message', { error, telegramId });
      await api.editMessageText(chatId, messageId, errorText).catch(() => {});
    } finally {
      endForecastJob(telegramId);
    }
  })();
}

export function runDailyHoroscopeDelivery(params: {
  api: Api;
  chatId: number;
  messageId: number;
  user: User;
  dateKey: string;
  keyboard: InlineKeyboard;
  errorText: string;
  telegramId: number;
}): void {
  const { api, chatId, messageId, user, dateKey, keyboard, errorText, telegramId } = params;

  void (async () => {
    try {
      const horoscopeText = await generateDailyHoroscopeReliable(user);
      if (!isUsableHoroscope(horoscopeText)) {
        throw new Error('Horoscope too short');
      }
      saveHoroscope({ user_id: user.id, date: dateKey, content: horoscopeText });
      await editMarkdownSafeApi(api, chatId, messageId, horoscopeText, { reply_markup: keyboard }, telegramId);
    } catch (error) {
      logger.error('Failed to deliver daily horoscope', { error, telegramId });
      await api.editMessageText(chatId, messageId, errorText).catch(() => {});
    } finally {
      endForecastJob(telegramId);
    }
  })();
}

export function runWeeklyHoroscopeDelivery(params: {
  api: Api;
  chatId: number;
  messageId: number;
  user: User;
  keyboard: InlineKeyboard;
  errorText: string;
  telegramId: number;
}): void {
  const { api, chatId, messageId, user, keyboard, errorText, telegramId } = params;

  void (async () => {
    try {
      const weekly = await generateWeeklyHoroscopeReliable(user);
      await editMarkdownSafeApi(api, chatId, messageId, weekly, { reply_markup: keyboard }, telegramId);
    } catch (error) {
      logger.error('Failed to deliver weekly horoscope', { error, telegramId });
      await api.editMessageText(chatId, messageId, errorText).catch(() => {});
    } finally {
      endForecastJob(telegramId);
    }
  })();
}
