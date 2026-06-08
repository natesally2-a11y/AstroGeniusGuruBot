import { Bot, InlineKeyboard } from 'grammy';
import { getUserByTelegramId } from '../../database/queries';
import {
  sendSubscriptionInvoice, sendNatalChartInvoice,
  isSubscriptionActive, SUBSCRIPTION_PRICE, NATAL_CHART_PRICE,
} from '../../payments/stars';
import { logger } from '../../utils/logger';

export function registerSubscribeHandler(bot: Bot): void {
  bot.command('subscribe', async (ctx) => {
    const telegramId = ctx.from!.id;
    const user = getUserByTelegramId(telegramId);
    logger.info(`/subscribe from ${telegramId}`);

    if (!user) {
      await ctx.reply('❗ Начните с /start');
      return;
    }

    if (isSubscriptionActive(user)) {
      const expiresDate = user.subscription_expires
        ? new Date(user.subscription_expires).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric',
          })
        : 'бессрочно';

      await ctx.reply(
        `✅ *Premium активен до ${expiresDate}*\n\n` +
        `Отменить автопродление: /cancel\n` +
        `Разовая натальная карта без подписки: /buy_chart`,
        {
          parse_mode: 'Markdown',
          reply_markup: new InlineKeyboard()
            .text('🔄 Продлить', 'confirm_subscribe').row()
            .text('🔮 Гороскоп', 'horoscope_today'),
        }
      );
      return;
    }

    await ctx.reply(
      `⭐ *AstroGuru Premium — ${SUBSCRIPTION_PRICE} ⭐/мес*\n\n` +
      `💎 *В подписке:*\n` +
      `✅ Персональный AI-гороскоп по натальной карте\n` +
      `✅ Натальная карта с подробной интерпретацией\n` +
      `✅ Транзиты, недельный и месячный прогноз\n` +
      `✅ Совместимость и фаза луны\n` +
      `✅ Утренние уведомления в 9:00 по вашему времени\n\n` +
      `🔄 *Ежемесячное списание ${SUBSCRIPTION_PRICE} ⭐*. Отмена в любой момент: /cancel\n\n` +
      `🌌 *Разовая натальная карта:* ${NATAL_CHART_PRICE} ⭐ без подписки → /buy_chart`,
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard()
          .text(`⭐ Подписаться — ${SUBSCRIPTION_PRICE} ⭐/мес`, 'confirm_subscribe').row()
          .text(`🌌 Карта разово — ${NATAL_CHART_PRICE} ⭐`, 'buy_natal_chart').row()
          .text('❓ Telegram Stars', 'stars_info'),
      }
    );
  });

  bot.command('buy_chart', async (ctx) => {
    const user = getUserByTelegramId(ctx.from!.id);
    if (!user) { await ctx.reply('❗ /start'); return; }
    if (!user.birth_date) {
      await ctx.reply('📅 Сначала укажите дату рождения: /settings');
      return;
    }
    await sendNatalChartInvoice(bot, ctx.chat!.id, user.id);
  });

  bot.callbackQuery('confirm_subscribe', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    if (!user) { await ctx.reply('❗ /start'); return; }
    try {
      await sendSubscriptionInvoice(bot, ctx.chat!.id, user.id);
    } catch (error) {
      logger.error('Invoice error', { error });
      await ctx.reply('❌ Не удалось создать счёт. Попробуйте позже.');
    }
  });

  bot.callbackQuery('buy_natal_chart', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    if (!user?.birth_date) {
      await ctx.reply('📅 Укажите дату рождения: /settings');
      return;
    }
    await sendNatalChartInvoice(bot, ctx.chat!.id, user.id);
  });

  bot.callbackQuery('subscribe_info', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    await ctx.reply(
      `⭐ Premium — ${SUBSCRIPTION_PRICE} ⭐/мес\n` +
      `Персональный гороскоп, натальная карта, транзиты, месячный прогноз.\n` +
      `Отмена: /cancel`,
      {
        reply_markup: new InlineKeyboard()
          .text(`⭐ Оформить — ${SUBSCRIPTION_PRICE} ⭐`, 'confirm_subscribe'),
      }
    );
  });

  bot.callbackQuery('stars_info', async (ctx) => {
    await ctx.answerCallbackQuery({
      text: 'Telegram Stars — официальная валюта Telegram. Купить можно в настройках Telegram.',
      show_alert: true,
    }).catch(() => {});
  });
}
