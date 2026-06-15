import { Bot, Context, InlineKeyboard } from 'grammy';
import { getUserByTelegramId, saveHoroscope, getHoroscope } from '../../database/queries';
import { generateDailyHoroscope, generateWeeklyHoroscope } from '../../astrology/horoscope';
import { isSubscriptionActive } from '../../payments/stars';
import { getHoroscopeCacheKey, parseLangFromHoroscopeKey } from '../../astrology/timezone';
import { editMarkdownSafe, replyMarkdownSafe } from '../helpers/reply';
import { checkAiQuota, trackAiGeneration } from '../../payments/usageLimits';
import { isAiEnabled } from '../../ai/llm';
import {
  birthDatePromptKeyboard, horoscopeFollowUpKeyboardForLang,
  premiumGateKeyboard, weeklyHoroscopeKeyboard,
} from '../helpers/keyboards';
import { resolveUserLang, tUser } from '../../i18n';
import { logger } from '../../utils/logger';

function isBrokenHoroscopeCache(content: string): boolean {
  if (content.length < 80) return true;
  if (/###/.test(content)) return true;
  if (/\*\*/.test(content)) return true;
  return false;
}

function resolveHoroscopeLang(ctx: Context, user: NonNullable<ReturnType<typeof getUserByTelegramId>>, dateKey: string) {
  return parseLangFromHoroscopeKey(dateKey)
    || resolveUserLang(user, ctx.from?.language_code);
}

async function upgradeDailyHoroscopeWithAi(
  ctx: Context,
  messageId: number,
  user: NonNullable<ReturnType<typeof getUserByTelegramId>>,
  dateKey: string,
  keyboard: InlineKeyboard
): Promise<void> {
  const quota = checkAiQuota(user);
  if (!quota.ok || !isAiEnabled()) return;

  try {
    const aiText = await generateDailyHoroscope(user, true);
    if (aiText.length < 120) return;

    trackAiGeneration(user, 'daily');
    saveHoroscope({ user_id: user.id, date: dateKey, content: aiText });
    await editMarkdownSafe(ctx, messageId, aiText, { reply_markup: keyboard });
  } catch (error) {
    logger.warn('AI horoscope upgrade failed, template already delivered', {
      error, userId: user.telegram_id,
    });
  }
}

export async function sendTodayHoroscope(ctx: Context): Promise<void> {
  const user = getUserByTelegramId(ctx.from!.id);
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

  const loadingMsg = await ctx.reply(
    `${tUser(user, 'today.loading')}\n\n${tUser(user, 'today.loading_sub')}`,
    { parse_mode: 'Markdown' }
  );

  try {
    const templateText = await generateDailyHoroscope(user, false);
    if (templateText.length < 80) {
      throw new Error('Horoscope template too short');
    }

    saveHoroscope({ user_id: user.id, date: dateKey, content: templateText });
    await editMarkdownSafe(ctx, loadingMsg.message_id, templateText, { reply_markup: keyboard });

    void upgradeDailyHoroscopeWithAi(ctx, loadingMsg.message_id, user, dateKey, keyboard);
  } catch (error) {
    logger.error('Failed to generate daily horoscope', { error, userId: ctx.from?.id });
    await ctx.api.editMessageText(
      ctx.chat!.id,
      loadingMsg.message_id,
      tUser(user, 'today.error')
    ).catch(() => {});
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
    const user = getUserByTelegramId(ctx.from.id);
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

    const loadingMsg = await ctx.reply(tUser(user, 'today.weekly_loading'), { parse_mode: 'Markdown' });
    await ctx.api.sendChatAction(ctx.chat!.id, 'typing');

    try {
      const quota = checkAiQuota(user);
      if (!quota.ok) {
        await ctx.api.editMessageText(
          ctx.chat!.id,
          loadingMsg.message_id,
          quota.message || tUser(user, 'today.error'),
          { parse_mode: 'Markdown' }
        ).catch(() => {});
        return;
      }
      const weekly = await generateWeeklyHoroscope(user, false);
      await editMarkdownSafe(ctx, loadingMsg.message_id, weekly, {
        reply_markup: weeklyHoroscopeKeyboard(user),
      });
      void generateWeeklyHoroscope(user, true).then(async (aiWeekly) => {
        if (aiWeekly.length < 120) return;
        trackAiGeneration(user, 'weekly');
        await editMarkdownSafe(ctx, loadingMsg.message_id, aiWeekly, {
          reply_markup: weeklyHoroscopeKeyboard(user),
        });
      }).catch((error) => logger.warn('Weekly AI upgrade failed', { error }));
    } catch (error) {
      logger.error('Failed to generate weekly horoscope', { error });
      await ctx.api.editMessageText(ctx.chat!.id, loadingMsg.message_id, tUser(user, 'today.weekly_error')).catch(() => {});
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
