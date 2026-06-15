import { Bot, Context } from 'grammy';
import { getUserByTelegramId, getHoroscope } from '../../database/queries';
import { isSubscriptionActive } from '../../payments/stars';
import { getHoroscopeCacheKey, parseLangFromHoroscopeKey } from '../../astrology/timezone';
import { replyMarkdownSafe } from '../helpers/reply';
import { sanitizeForTelegram } from '../helpers/telegramText';
import { tryBeginForecastJob } from '../helpers/forecastLock';
import { runDailyHoroscopeDelivery, runWeeklyHoroscopeDelivery } from '../helpers/horoscopeDelivery';
import {
  birthDatePromptKeyboard, horoscopeFollowUpKeyboardForLang,
  premiumGateKeyboard, weeklyHoroscopeKeyboard,
} from '../helpers/keyboards';
import { resolveUserLang, tUser } from '../../i18n';
import { logger } from '../../utils/logger';

function isBrokenHoroscopeCache(content: string): boolean {
  const clean = sanitizeForTelegram(content);
  return clean.length < 120;
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

  runDailyHoroscopeDelivery({
    api: ctx.api,
    chatId: ctx.chat!.id,
    messageId: loadingMsg.message_id,
    user,
    dateKey,
    keyboard,
    errorText: tUser(user, 'today.error'),
    telegramId,
  });
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

    runWeeklyHoroscopeDelivery({
      api: ctx.api,
      chatId: ctx.chat!.id,
      messageId: loadingMsg.message_id,
      user,
      keyboard: weeklyHoroscopeKeyboard(user),
      errorText: tUser(user, 'today.weekly_error'),
      telegramId,
    });
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
