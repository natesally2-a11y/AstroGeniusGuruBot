import { Bot } from 'grammy';
import {
  processSuccessfulPayment, isSubscriptionActive,
  SUBSCRIPTION_PRICE, NATAL_CHART_PRICE,
} from '../../payments/stars';
import { getUserByTelegramId } from '../../database/queries';
import { logger } from '../../utils/logger';

const MINI_APP_URL = process.env.MINI_APP_URL || 'https://yourdomain.com';

export function registerPaymentHandlers(bot: Bot): void {
  bot.on('pre_checkout_query', async (ctx) => {
    logger.info(`Pre-checkout from ${ctx.from.id}`, {
      payload: ctx.preCheckoutQuery.invoice_payload,
      amount: ctx.preCheckoutQuery.total_amount,
    });

    try {
      const payload = JSON.parse(ctx.preCheckoutQuery.invoice_payload);
      const validTypes = ['subscription', 'natal_chart'];
      if (!validTypes.includes(payload.type)) {
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

  bot.on('message:successful_payment', async (ctx) => {
    const payment = ctx.message.successful_payment;
    const telegramId = ctx.from!.id;

    logger.info(`Successful payment from ${telegramId}`, {
      chargeId: payment.telegram_payment_charge_id,
      amount: payment.total_amount,
    });

    try {
      let payloadType = 'subscription';
      try {
        payloadType = JSON.parse(payment.invoice_payload).type;
      } catch { /* default */ }

      processSuccessfulPayment(
        telegramId,
        payment.telegram_payment_charge_id,
        payment.provider_payment_charge_id || '',
        payment.total_amount,
        payment.invoice_payload
      );

      if (payloadType === 'natal_chart') {
        await ctx.reply(
          `🎉 *Натальная карта разблокирована!*\n\n` +
          `✅ Оплата: *${payment.total_amount} ⭐*\n` +
          `🌌 Доступ к полной натальной карте с AI-интерпретацией на 30 дней.\n\n` +
          `Откройте Mini App → вкладка «Карта»`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '🌟 Открыть Mini App', web_app: { url: MINI_APP_URL } }]],
            },
          }
        );
        return;
      }

      const user = getUserByTelegramId(telegramId);
      const expiresDate = user?.subscription_expires
        ? new Date(user.subscription_expires).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric',
          })
        : '30 дней';

      await ctx.reply(
        `🎉 *Добро пожаловать в AstroGuru Premium!*\n\n` +
        `✅ Оплата: *${payment.total_amount} ⭐*\n` +
        `📅 Подписка активна до: *${expiresDate}*\n` +
        `🔄 Автопродление: *${SUBSCRIPTION_PRICE} ⭐/мес*\n` +
        `Отменить: /cancel или в профиле Mini App\n\n` +
        `🌟 Доступно: персональный гороскоп, транзиты, натальная карта, месячный прогноз`,
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
      logger.error('Failed to process payment', { error, telegramId });
      await ctx.reply('❌ Ошибка активации. Напишите natesally@yandex.com с чеком об оплате.');
    }
  });
}
