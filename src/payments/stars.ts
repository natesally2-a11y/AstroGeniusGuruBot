import { Bot } from 'grammy';
import { logger } from '../utils/logger';
import { getUserByTelegramId, updateSubscription, createPayment, completePayment } from '../database/queries';

const SUBSCRIPTION_PRICE = parseInt(process.env.SUBSCRIPTION_PRICE || '49', 10);
const SUBSCRIPTION_DAYS = parseInt(process.env.SUBSCRIPTION_DAYS || '30', 10);

export interface InvoiceParams {
  title: string;
  description: string;
  payload: string;
  prices: Array<{ label: string; amount: number }>;
}

export function buildSubscriptionInvoice(userId: number): InvoiceParams {
  return {
    title: '⭐ AstroGuru Premium',
    description:
      'Персональный гороскоп на основе натальной карты · ' +
      'Планетарные транзиты · Совместимость · Недельный прогноз',
    payload: JSON.stringify({ type: 'subscription', userId, days: SUBSCRIPTION_DAYS }),
    prices: [
      { label: `Подписка на ${SUBSCRIPTION_DAYS} дней`, amount: SUBSCRIPTION_PRICE },
    ],
  };
}

export async function sendSubscriptionInvoice(bot: Bot, chatId: number, userId: number): Promise<void> {
  const invoice = buildSubscriptionInvoice(userId);
  try {
    await bot.api.sendInvoice(chatId, invoice.title, invoice.description, invoice.payload, 'XTR', invoice.prices);
    logger.info(`Invoice sent to user ${userId}`);
  } catch (error) {
    logger.error('Failed to send invoice', { error, userId });
    throw error;
  }
}

export function processSuccessfulPayment(
  telegramId: number,
  telegramChargeId: string,
  providerChargeId: string,
  amount: number
): void {
  const user = getUserByTelegramId(telegramId);
  if (!user) {
    logger.error(`User not found for payment: ${telegramId}`);
    return;
  }

  // Calculate new expiry date
  const now = new Date();
  let expiresAt: Date;

  // If already premium and not expired, extend from current expiry
  if (user.subscription_status === 'premium' && user.subscription_expires) {
    const currentExpiry = new Date(user.subscription_expires);
    expiresAt = currentExpiry > now ? currentExpiry : now;
  } else {
    expiresAt = now;
  }
  expiresAt.setDate(expiresAt.getDate() + SUBSCRIPTION_DAYS);

  const paymentId = createPayment({
    user_id: user.id,
    amount,
    subscription_days: SUBSCRIPTION_DAYS,
  });

  completePayment(paymentId, telegramChargeId, providerChargeId);
  updateSubscription(telegramId, 'premium', expiresAt.toISOString());

  logger.info(`Premium activated for user ${telegramId} until ${expiresAt.toISOString()}`);
}

export function isSubscriptionActive(user: { subscription_status: string; subscription_expires?: string }): boolean {
  if (user.subscription_status !== 'premium') return false;
  if (!user.subscription_expires) return true;
  return new Date(user.subscription_expires) > new Date();
}
