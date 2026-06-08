import { Bot, InlineKeyboard } from 'grammy';
import { getUserByTelegramId } from '../../database/queries';
import { getMoonPhase } from '../../astrology/features';
import { formatLuckyDayMessage } from '../../astrology/lucky';
import { generateMonthlyHoroscope } from '../../astrology/horoscope';
import { calculateNatalChartForUser } from '../../astrology/engine';
import { isSubscriptionActive } from '../../payments/stars';
import { logger } from '../../utils/logger';

export function registerFeaturesHandler(bot: Bot): void {
  bot.command('moon', async (ctx) => {
    const moon = getMoonPhase();
    await ctx.reply(
      `${moon.emoji} *Фаза луны сегодня*\n\n` +
      `*${moon.phase}* (${moon.illumination}% освещённости)\n` +
      `Луна в знаке: *${moon.sign}* ${moon.signEmoji}\n\n` +
      `${moon.advice}`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.callbackQuery('moon_phase', async (ctx) => {
    await ctx.answerCallbackQuery();
    const moon = getMoonPhase();
    await ctx.reply(
      `${moon.emoji} *${moon.phase}* · Луна в ${moon.sign}\n${moon.advice}`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.command('lucky', async (ctx) => {
    const user = getUserByTelegramId(ctx.from!.id);
    await ctx.reply(formatLuckyDayMessage(user), { parse_mode: 'Markdown' });
  });

  bot.command('month', async (ctx) => {
    const user = getUserByTelegramId(ctx.from!.id);
    if (!user?.birth_date) {
      await ctx.reply('📅 Укажите дату рождения: /settings');
      return;
    }
    if (!isSubscriptionActive(user)) {
      await ctx.reply('🔒 Месячный прогноз доступен в Premium. /subscribe');
      return;
    }
    await ctx.api.sendChatAction(ctx.chat!.id, 'typing');
    const forecast = await generateMonthlyHoroscope(user);
    await ctx.reply(forecast, { parse_mode: 'Markdown' });
  });

  bot.command('transits', async (ctx) => {
    const user = getUserByTelegramId(ctx.from!.id);
    if (!user?.birth_date) {
      await ctx.reply('📅 Укажите дату рождения: /settings');
      return;
    }
    const chart = calculateNatalChartForUser(
      user.birth_date, user.birth_time, user.birth_lat || 0, user.birth_lon || 0, user.timezone
    );
    const today = new Date();
    const { calculateNatalChart, calculateTransits } = await import('../../astrology/engine');
    const transit = calculateNatalChart(
      today.getFullYear(), today.getMonth() + 1, today.getDate(), 12, 0, 0, 0
    );
    const transits = calculateTransits(chart, transit).slice(0, 5);

    if (transits.length === 0) {
      await ctx.reply('✨ Сегодня нет сильных транзитов к вашей натальной карте.');
      return;
    }

    const planetRu: Record<string, string> = {
      sun: 'Солнце', moon: 'Луна', mercury: 'Меркурий', venus: 'Венера',
      mars: 'Марс', jupiter: 'Юпитер', saturn: 'Сатурн', ascendant: 'Асцендент',
    };
    const aspectRu: Record<string, string> = {
      conjunction: 'соединение', opposition: 'оппозиция', trine: 'трин',
      square: 'квадрат', sextile: 'секстиль',
    };
    const lines = transits.map(t => {
      const icon = t.energy === 'harmonious' ? '✅' : t.energy === 'challenging' ? '⚠️' : '➡️';
      const tp = planetRu[t.transitPlanet] || t.transitPlanet;
      const np = planetRu[t.natalPlanet] || t.natalPlanet;
      const asp = aspectRu[t.aspectType] || t.aspectType;
      return `${icon} Транзит *${tp}* ${asp} натальное *${np}*`;
    });
    await ctx.reply(
      `🪐 *Транзиты планет сегодня*\n` +
      `_Как текущее положение планет влияет на вашу натальную карту:_\n\n` +
      lines.join('\n'),
      { parse_mode: 'Markdown' }
    );
  });

  bot.command('cancel', async (ctx) => {
    const user = getUserByTelegramId(ctx.from!.id);
    if (!user || !isSubscriptionActive(user)) {
      await ctx.reply('У вас нет активной подписки.');
      return;
    }
    const { cancelSubscription } = await import('../../payments/stars');
    cancelSubscription(ctx.from!.id);
    await ctx.reply(
      `✅ *Автопродление отключено*\n\n` +
      `Подписка останется активной до: *${user.subscription_expires ? new Date(user.subscription_expires).toLocaleDateString('ru-RU') : '—'}*\n\n` +
      `После этой даты списания прекратятся. Возобновить: /subscribe`,
      { parse_mode: 'Markdown' }
    );
  });

  logger.info('Features handler registered');
}
