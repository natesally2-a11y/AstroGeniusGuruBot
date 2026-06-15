import { Bot } from 'grammy';
import { getUserByTelegramId } from '../../database/queries';
import { getMoonPhase } from '../../astrology/features';
import { formatLuckyDayMessage } from '../../astrology/lucky';
import { generateMonthlyHoroscope, generateTransitForecast } from '../../astrology/horoscope';
import { isSubscriptionActive } from '../../payments/stars';
import { formatLocalizedDate, tUser } from '../../i18n';
import { localizeMoon } from '../../i18n/astro';
import { getUserLang } from '../../i18n';
import { tryBeginForecastJob, endForecastJob } from '../helpers/forecastLock';
import { logger } from '../../utils/logger';

export function registerFeaturesHandler(bot: Bot): void {
  bot.command('moon', async (ctx) => {
    const user = getUserByTelegramId(ctx.from!.id);
    const moon = getMoonPhase();
    const loc = localizeMoon(moon, getUserLang(user));
    await ctx.reply(
      `${tUser(user, 'features.moon_title', { emoji: moon.emoji })}\n\n` +
      `${tUser(user, 'features.moon_illumination', { phase: loc.phase, pct: String(moon.illumination) })}\n` +
      `${tUser(user, 'features.moon_sign_line', { sign: loc.sign, signEmoji: moon.signEmoji })}\n\n` +
      loc.advice,
      { parse_mode: 'Markdown' }
    );
  });

  bot.callbackQuery('moon_phase', async (ctx) => {
    await ctx.answerCallbackQuery();
    const user = getUserByTelegramId(ctx.from.id);
    const moon = getMoonPhase();
    const loc = localizeMoon(moon, getUserLang(user));
    await ctx.reply(
      tUser(user, 'features.moon_callback', {
        emoji: moon.emoji,
        phase: loc.phase,
        sign: loc.sign,
        advice: loc.advice,
      }),
      { parse_mode: 'Markdown' }
    );
  });

  bot.command('lucky', async (ctx) => {
    const telegramId = ctx.from!.id;
    if (!tryBeginForecastJob(telegramId)) return;
    const user = getUserByTelegramId(telegramId);
    try {
      await ctx.api.sendChatAction(ctx.chat!.id, 'typing');
      await ctx.reply(await formatLuckyDayMessage(user), { parse_mode: 'Markdown' });
    } finally {
      endForecastJob(telegramId);
    }
  });

  bot.command('month', async (ctx) => {
    const telegramId = ctx.from!.id;
    const user = getUserByTelegramId(telegramId);
    if (!user?.birth_date) {
      await ctx.reply(tUser(user, 'settings.birth_required'));
      return;
    }
    if (!isSubscriptionActive(user)) {
      await ctx.reply(tUser(user, 'features.month_premium'));
      return;
    }
    if (!tryBeginForecastJob(telegramId)) return;
    try {
      await ctx.api.sendChatAction(ctx.chat!.id, 'typing');
      await ctx.reply(await generateMonthlyHoroscope(user), { parse_mode: 'Markdown' });
    } finally {
      endForecastJob(telegramId);
    }
  });

  bot.command('transits', async (ctx) => {
    const telegramId = ctx.from!.id;
    const user = getUserByTelegramId(telegramId);
    if (!user?.birth_date) {
      await ctx.reply(tUser(user, 'settings.birth_required'));
      return;
    }
    if (!tryBeginForecastJob(telegramId)) return;
    try {
      await ctx.api.sendChatAction(ctx.chat!.id, 'typing');
      await ctx.reply(await generateTransitForecast(user), { parse_mode: 'Markdown' });
    } finally {
      endForecastJob(telegramId);
    }
  });

  bot.command('cancel', async (ctx) => {
    const user = getUserByTelegramId(ctx.from!.id);
    if (!user || !isSubscriptionActive(user)) {
      await ctx.reply(tUser(user, 'features.no_subscription'));
      return;
    }
    const { cancelSubscription } = await import('../../payments/stars');
    cancelSubscription(ctx.from!.id);
    const exp = user.subscription_expires
      ? formatLocalizedDate(user, user.subscription_expires)
      : '—';
    await ctx.reply(
      tUser(user, 'features.cancel_ok', { date: exp }),
      { parse_mode: 'Markdown' }
    );
  });

  logger.info('Features handler registered');
}
