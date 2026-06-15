import { Bot, Context } from 'grammy';
import { getUserByTelegramId, saveHoroscope, getHoroscope } from '../../database/queries';
import { generateDailyHoroscope, generateWeeklyHoroscope } from '../../astrology/horoscope';
import { isSubscriptionActive } from '../../payments/stars';
import { getHoroscopeCacheKey, parseLangFromHoroscopeKey } from '../../astrology/timezone';
import { editMarkdownSafe, replyMarkdownSafe } from '../helpers/reply';
import { sanitizeForTelegram } from '../helpers/telegramText';
import { tryBeginForecastJob, endForecastJob } from '../helpers/forecastLock';
import {
  birthDatePromptKeyboard, horoscopeFollowUpKeyboardForLang,
  premiumGateKeyboard, weeklyHoroscopeKeyboard,
} from '../helpers/keyboards';
import { resolveUserLang, tUser } from '../../i18n';
import { logger } from '../../utils/logger';

function isBrokenHoroscopeCache(content: string): boolean {
  return sanitizeForTelegram(content).length < 120;
}

function resolveHoroscopeLang(ctx: Context, user: NonNullable<ReturnType<typeof getUserByTelegramId>>, dateKey: string) {
  return parseLangFromHoroscopeKey(dateKey)
    || resolveUserLang(user, ctx.from?.language_code);
}

export async function sendTodayHoroscope(ctx: Context): Promise<void> {
  const telegramId = ctx.from!.id;
  const user = getUserByTelegramId(telegramId);
  if (!user?.birth_date) {
    await ctx.reply(tUser(user, 'settings.birth_required'));
    return;
  }

  const dateKey = getHoroscopeCacheKey(user);
  const cached = getHoroscope(user.id, dateKey);
  const isPremium = isSubscriptionActive(user);
  const lang = resolveHoroscopeLang(ctx, user, dateKey);
  const keyboard = horoscopeFollowUpKeyboardForLang(lang, isPremium);

  if (cached?.content && !isBrokenHoroscopeCache(cached.content)) {
    await replyMarkdownSafe(ctx, cached.content, { reply_markup: keyboard });
    return;
  }

  if (!tryBeginForecastJob(telegramId)) {
    logger.info('Daily horoscope already in progress', { telegramId });
    return;
  }

  const loadingMsg = await ctx.reply(
    `${tUser(user, 'today.loading')}\n\n${tUser(user, 'today.loading_sub')}`,
    { parse_mode: 'Markdown' }
  );

  try {
    const horoscopeText = sanitizeForTelegram(await generateDailyHoroscope(user));
    if (horoscopeText.length < 120) {
      throw new Error('Horoscope too short');
    }
    saveHoroscope({ user_id: user.id, date: dateKey, content: horoscopeText });
    await editMarkdownSafe(ctx, loadingMsg.message_id, horoscopeText, { reply_markup: keyboard });
  } catch (error) {
    logger.error('Failed to generate daily horoscope', { error, userId: telegramId });
    await ctx.api.editMessageText(
      ctx.chat!.id,
      loadingMsg.message_id,
      tUser(user, 'today.error')
    ).catch(() => {});
  } finally {
    endForecastJob(telegramId);
  }
}

export function registerTodayHandler(bot: Bot): void {
  bot.command('today', async (ctx) => {
    const telegramId = ctx.from!.id;
    const user = getUserByTelegramId(telegramId);

    logger.info(`/today from ${telegramId}`);

    if (!user) {
      await ctx.reply(tUser(user, 'common.start_first'));
      return;
    }

    if (!user.birth_date) {
      await ctx.reply(
        tUser(user, 'settings.birth_required'),
        { reply_markup: birthDatePromptKeyboard(user) }
      );
      return;
    }

    await ctx.api.sendChatAction(ctx.chat!.id, 'typing');
    await sendTodayHoroscope(ctx);
  });

  bot.callbackQuery('weekly_horoscope', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const telegramId = ctx.from.id;
    const user = getUserByTelegramId(telegramId);
    if (!user) return;

    if (!isSubscriptionActive(user)) {
      await ctx.reply(
        tUser(user, 'today.weekly_premium'),
        {
          parse_mode: 'Markdown',
          reply_markup: premiumGateKeyboard(user),
        }
      );
      return;
    }

    if (!tryBeginForecastJob(telegramId)) {
      logger.info('Weekly horoscope already in progress', { telegramId });
      return;
    }

    const loadingMsg = await ctx.reply(tUser(user, 'today.weekly_loading'), { parse_mode: 'Markdown' });
    await ctx.api.sendChatAction(ctx.chat!.id, 'typing');

    try {
      const weekly = sanitizeForTelegram(await generateWeeklyHoroscope(user));
      await editMarkdownSafe(ctx, loadingMsg.message_id, weekly, {
        reply_markup: weeklyHoroscopeKeyboard(user),
      });
    } catch (error) {
      logger.error('Failed to generate weekly horoscope', { error });
      await ctx.api.editMessageText(ctx.chat!.id, loadingMsg.message_id, tUser(user, 'today.weekly_error')).catch(() => {});
    } finally {
      endForecastJob(telegramId);
    }
  });

  bot.callbackQuery('horoscope_today', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    if (!user?.birth_date) {
      await ctx.reply(tUser(user, 'settings.birth_required'));
      return;
    }
    await ctx.api.sendChatAction(ctx.chat!.id, 'typing');
    await sendTodayHoroscope(ctx);
  });
}
