import { Bot } from 'grammy';
import { getUserByTelegramId, setUserReferralSource } from '../../database/queries';
import { hasNatalChartAccess } from '../../payments/stars';
import { getGuideText, getUserLang, tUser } from '../../i18n';
import { sendWelcomeMessages } from '../helpers/welcome';
import { formatLuckyDayMessage } from '../../astrology/lucky';
import { birthDatePromptKeyboard, compatAppKeyboard, openChartKeyboard } from '../helpers/keyboards';
import { logger } from '../../utils/logger';

function parseStartPayload(text: string | undefined): string | null {
  if (!text?.startsWith('/start')) return null;
  const parts = text.trim().split(/\s+/);
  return parts[1]?.slice(0, 64) || null;
}

export function registerStartHandler(bot: Bot): void {
  bot.command('start', async (ctx) => {
    logger.info(`/start from ${ctx.from!.id}`);
    if ((ctx as typeof ctx & { welcomed?: boolean }).welcomed) return;

    const payload = parseStartPayload(ctx.message?.text);
    if (payload) {
      setUserReferralSource(ctx.from!.id, payload);
      logger.info(`Start payload: ${payload} from ${ctx.from!.id}`);
    }

    await sendWelcomeMessages(ctx, undefined, payload);
  });

  bot.callbackQuery('show_commands', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    await ctx.reply(getGuideText(getUserLang(user)), { parse_mode: 'Markdown' });
  });

  bot.callbackQuery('lucky_day', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    await ctx.api.sendChatAction(ctx.chat!.id, 'typing');
    await ctx.reply(await formatLuckyDayMessage(user), { parse_mode: 'Markdown' });
  });

  bot.callbackQuery('natal_chart', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    if (!user?.birth_date) {
      await ctx.reply(tUser(user, 'settings.birth_required'));
      return;
    }
    if (!hasNatalChartAccess(user)) {
      await ctx.reply(tUser(user, 'start.natal_locked'), { parse_mode: 'Markdown' });
      return;
    }
    await ctx.reply(tUser(user, 'start.natal_open'), {
      reply_markup: openChartKeyboard(user),
    });
  });

  bot.callbackQuery('compatibility', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    await ctx.reply(tUser(user, 'start.compat_prompt'), {
      reply_markup: compatAppKeyboard(getUserByTelegramId(ctx.from.id)),
    });
  });

  bot.callbackQuery('settings_menu', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    await ctx.reply(tUser(user, 'settings.menu'), {
      parse_mode: 'Markdown',
      reply_markup: birthDatePromptKeyboard(user),
    });
  });
}
