import { Bot } from 'grammy';
import { processSuccessfulPayment, isSubscriptionActive } from '../../payments/stars';
import { getUserByTelegramId } from '../../database/queries';
import { logger } from '../../utils/logger';

const MINI_APP_URL = process.env.MINI_APP_URL || 'https://yourdomain.com';

export function registerPaymentHandlers(bot: Bot): void {
  // Pre-checkout query — must be answered within 10 seconds
  bot.on('pre_checkout_query', async (ctx) => {
    logger.info(`Pre-checkout query from ${ctx.from.id}`, {
      payload: ctx.preCheckoutQuery.invoice_payload,
      amount: ctx.preCheckoutQuery.total_amount,
    });

    try {
      const payload = JSON.parse(ctx.preCheckoutQuery.invoice_payload);

      if (payload.type !== 'subscription') {
        await ctx.answerPreCheckoutQuery(false, { error_message: 'Неверный тип платежа' });
        return;
      }

      const user = getUserByTelegramId(ctx.from.id);
      if (!user) {
        await ctx.answerPreCheckoutQuery(false, { error_message: 'Пользователь не найден' });
        return;
      }

      await ctx.answerPreCheckoutQuery(true);
    } catch (error) {
      logger.error('Pre-checkout error', { error });
      await ctx.answerPreCheckoutQuery(false, { error_message: 'Ошибка обработки платежа' });
    }
  });

  // Successful payment
  bot.on('message:successful_payment', async (ctx) => {
    const payment = ctx.message.successful_payment;
    const telegramId = ctx.from!.id;

    logger.info(`Successful payment from ${telegramId}`, {
      chargeId: payment.telegram_payment_charge_id,
      amount: payment.total_amount,
    });

    try {
      processSuccessfulPayment(
        telegramId,
        payment.telegram_payment_charge_id,
        payment.provider_payment_charge_id || '',
        payment.total_amount
      );

      const user = getUserByTelegramId(telegramId);
      const expiresDate = user?.subscription_expires
        ? new Date(user.subscription_expires).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric',
          })
        : '30 дней';

      await ctx.reply(
        `🎉 *Добро пожаловать в AstroGuru Premium!*\n\n` +
        `✅ Оплата прошла успешно!\n` +
        `⭐ Сумма: *${payment.total_amount} Telegram Stars*\n` +
        `📅 Подписка активна до: *${expiresDate}*\n\n` +
        `🌟 Теперь вам доступны:\n` +
        `• Персональный гороскоп на основе натальной карты\n` +
        `• Анализ планетарных транзитов\n` +
        `• Совместимость со всеми знаками\n` +
        `• Недельные и месячные прогнозы\n\n` +
        `Начните с команды /today ✨`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔮 Получить гороскоп', callback_data: 'horoscope_today' }],
              [{ text: '🌟 Открыть Mini App', web_app: { url: MINI_APP_URL } }],
            ],
          },
        }
      );
    } catch (error) {
      logger.error('Failed to process successful payment', { error, telegramId });
      await ctx.reply(
        '❌ Произошла ошибка при активации подписки. Пожалуйста, напишите в поддержку с чеком об оплате.'
      );
    }
  });
}
