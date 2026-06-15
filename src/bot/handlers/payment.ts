import { Bot } from 'grammy';
import {
  processSuccessfulPayment, isSubscriptionActive,
  SUBSCRIPTION_PRICE, NATAL_CHART_PRICE,
} from '../../payments/stars';
import { getUserByTelegramId } from '../../database/queries';
import { formatLocalizedDate, tUser } from '../../i18n';
import { logger } from '../../utils/logger';
import { paymentChartKeyboard, paymentPremiumKeyboard } from '../helpers/keyboards';

export function registerPaymentHandlers(bot: Bot): void {
  bot.on('pre_checkout_query', async (ctx) => {
    logger.info(`Pre-checkout from ${ctx.from.id}`, {
      payload: ctx.preCheckoutQuery.invoice_payload,
      amount: ctx.preCheckoutQuery.total_amount,
    });

    const user = getUserByTelegramId(ctx.from.id);

    try {
      const payload = JSON.parse(ctx.preCheckoutQuery.invoice_payload);
      const validTypes = ['subscription', 'natal_chart'];
      if (!validTypes.includes(payload.type)) {
        await ctx.answerPreCheckoutQuery(false, { error_message: tUser(user, 'payment.invalid_type') });
        return;
      }

      if (!user) {
        await ctx.answerPreCheckoutQuery(false, { error_message: tUser(user, 'payment.user_not_found') });
        return;
      }

      await ctx.answerPreCheckoutQuery(true);
    } catch (error) {
      logger.error('Pre-checkout error', { error });
      await ctx.answerPreCheckoutQuery(false, { error_message: tUser(user, 'payment.process_error') });
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
        const user = getUserByTelegramId(telegramId);
        await ctx.reply(
          tUser(user, 'payment.chart_unlocked', { amount: String(payment.total_amount) }),
          {
            parse_mode: 'Markdown',
            reply_markup: paymentChartKeyboard(user),
          }
        );
        return;
      }

      const user = getUserByTelegramId(telegramId);
      const expiresDate = user?.subscription_expires
        ? formatLocalizedDate(user, user.subscription_expires)
        : tUser(user, 'common.days_30');

      await ctx.reply(
        tUser(user, 'payment.premium_welcome', {
          amount: String(payment.total_amount),
          date: expiresDate,
          price: String(SUBSCRIPTION_PRICE),
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: paymentPremiumKeyboard(user),
        }
      );
    } catch (error) {
      logger.error('Failed to process payment', { error, telegramId });
      const user = getUserByTelegramId(telegramId);
      await ctx.reply(tUser(user, 'payment.activation_error'));
    }
  });
}
