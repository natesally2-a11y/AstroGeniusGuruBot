import { Bot, InlineKeyboard } from 'grammy';
import { getUserByTelegramId } from '../../database/queries';
import { sendSubscriptionInvoice, isSubscriptionActive } from '../../payments/stars';
import { logger } from '../../utils/logger';

export function registerSubscribeHandler(bot: Bot): void {
  bot.command('subscribe', async (ctx) => {
    const telegramId = ctx.from!.id;
    const user = getUserByTelegramId(telegramId);

    logger.info(`/subscribe from ${telegramId}`);

    if (!user) {
      await ctx.reply('❗ Пожалуйста, начните с команды /start');
      return;
    }

    if (isSubscriptionActive(user)) {
      const expiresDate = user.subscription_expires
        ? new Date(user.subscription_expires).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric',
          })
        : 'бессрочно';

      await ctx.reply(
        `✅ *У вас активна подписка Premium!*\n\n📅 Действует до: *${expiresDate}*\n\n` +
        `Вы уже пользуетесь всеми преимуществами AstroGuru Premium:\n` +
        `• Персональный гороскоп\n• Натальная карта\n• Транзиты планет\n• Совместимость`,
        {
          parse_mode: 'Markdown',
          reply_markup: new InlineKeyboard()
            .text('🔄 Продлить подписку', 'confirm_subscribe').row()
            .text('🔮 Мой гороскоп', 'horoscope_today'),
        }
      );
      return;
    }

    const price = process.env.SUBSCRIPTION_PRICE || '49';
    const days = process.env.SUBSCRIPTION_DAYS || '30';

    await ctx.reply(
      `⭐ *AstroGuru Premium*\n\n` +
      `Получите полный доступ к персональной астрологии!\n\n` +
      `💎 *Что входит в Premium:*\n` +
      `✅ Персональный гороскоп на основе натальной карты\n` +
      `✅ Анализ планетарных транзитов\n` +
      `✅ Детальная натальная карта с домами\n` +
      `✅ Недельный и месячный прогноз\n` +
      `✅ Совместимость с любым знаком\n` +
      `✅ Ежедневные уведомления в 9:00\n\n` +
      `💰 *Стоимость:* ${price} ⭐ Telegram Stars / ${days} дней\n\n` +
      `_Оплата производится через безопасную систему Telegram Stars_`,
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard()
          .text(`⭐ Оплатить ${price} Stars`, 'confirm_subscribe').row()
          .text('❓ Что такое Telegram Stars?', 'stars_info'),
      }
    );
  });

  bot.callbackQuery('confirm_subscribe', async (ctx) => {
    await ctx.answerCallbackQuery();
    const telegramId = ctx.from.id;
    const user = getUserByTelegramId(telegramId);

    if (!user) {
      await ctx.reply('❗ Ошибка. Попробуйте /start');
      return;
    }

    try {
      await sendSubscriptionInvoice(bot, ctx.chat!.id, user.id);
    } catch (error) {
      logger.error('Failed to send invoice from callback', { error, telegramId });
      await ctx.reply('❌ Не удалось создать счёт. Попробуйте позже или обратитесь в поддержку.');
    }
  });

  bot.callbackQuery('stars_info', async (ctx) => {
    await ctx.answerCallbackQuery({
      text: 'Telegram Stars — официальная цифровая валюта Telegram для оплаты в ботах и мини-приложениях. ' +
        'Купить Stars можно прямо в приложении Telegram.',
      show_alert: true,
    });
  });
}
