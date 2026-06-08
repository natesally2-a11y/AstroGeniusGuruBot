import { Bot, Api } from 'grammy';
import { logger } from '../utils/logger';
import {
  getUserByTelegramId, updateSubscription, createPayment, completePayment,
  unlockNatalChart, setAutoRenew, User,
} from '../database/queries';
import { isAdmin } from '../config/admin';

export const SUBSCRIPTION_PRICE = parseInt(process.env.SUBSCRIPTION_PRICE || '99', 10);
export const SUBSCRIPTION_DAYS = parseInt(process.env.SUBSCRIPTION_DAYS || '30', 10);
export const NATAL_CHART_PRICE = parseInt(process.env.NATAL_CHART_PRICE || '99', 10);
const SUBSCRIPTION_PERIOD_SEC = SUBSCRIPTION_DAYS * 24 * 60 * 60;

export interface InvoiceParams {
  title: string;
  description: string;
  payload: string;
  prices: Array<{ label: string; amount: number }>;
  subscriptionPeriod?: number;
}

export function buildSubscriptionInvoice(userId: number): InvoiceParams {
  return {
    title: '⭐ AstroGuru Premium',
    description:
      `Ежемесячная подписка Premium · ${SUBSCRIPTION_PRICE} ⭐/мес\n` +
      'Списание происходит автоматически каждые 30 дней. Отменить можно в любой момент в профиле Mini App.',
    payload: JSON.stringify({ type: 'subscription', userId, days: SUBSCRIPTION_DAYS }),
    prices: [{ label: `Premium подписка / ${SUBSCRIPTION_DAYS} дней`, amount: SUBSCRIPTION_PRICE }],
    subscriptionPeriod: SUBSCRIPTION_PERIOD_SEC,
  };
}

export function buildNatalChartInvoice(userId: number): InvoiceParams {
  return {
    title: '🌌 Натальная карта AstroGuru',
    description:
      'Разовая покупка: полная натальная карта с подробной AI-интерпретацией на 30 дней. Без подписки.',
    payload: JSON.stringify({ type: 'natal_chart', userId }),
    prices: [{ label: 'Натальная карта (разово)', amount: NATAL_CHART_PRICE }],
  };
}

async function sendInvoice(api: Api, chatId: number, invoice: InvoiceParams): Promise<void> {
  const options: Record<string, unknown> = {};
  if (invoice.subscriptionPeriod) {
    options.subscription_period = invoice.subscriptionPeriod;
  }
  await api.sendInvoice(
    chatId,
    invoice.title,
    invoice.description,
    invoice.payload,
    'XTR',
    invoice.prices,
    options as any
  );
}

export async function sendSubscriptionInvoice(botOrApi: Bot | Api, chatId: number, userId: number): Promise<void> {
  const api = 'api' in botOrApi ? botOrApi.api : botOrApi;
  try {
    await sendInvoice(api, chatId, buildSubscriptionInvoice(userId));
    logger.info(`Subscription invoice sent to user ${userId}`);
  } catch (error) {
    logger.error('Failed to send subscription invoice', { error, userId });
    throw error;
  }
}

export async function sendNatalChartInvoice(botOrApi: Bot | Api, chatId: number, userId: number): Promise<void> {
  const api = 'api' in botOrApi ? botOrApi.api : botOrApi;
  try {
    await sendInvoice(api, chatId, buildNatalChartInvoice(userId));
    logger.info(`Natal chart invoice sent to user ${userId}`);
  } catch (error) {
    logger.error('Failed to send natal chart invoice', { error, userId });
    throw error;
  }
}

/** Grant lifetime premium — used for admins on startup */
export function grantLifetimePremium(telegramId: number): void {
  updateSubscription(telegramId, 'premium', undefined);
  setAutoRenew(telegramId, false);
  logger.info(`Lifetime premium granted to ${telegramId}`);
}

export function processSuccessfulPayment(
  telegramId: number,
  telegramChargeId: string,
  providerChargeId: string,
  amount: number,
  payloadRaw: string
): void {
  const user = getUserByTelegramId(telegramId);
  if (!user) {
    logger.error(`User not found for payment: ${telegramId}`);
    return;
  }

  let payload: { type: string; userId: number; days?: number };
  try {
    payload = JSON.parse(payloadRaw);
  } catch {
    payload = { type: 'subscription', userId: user.id, days: SUBSCRIPTION_DAYS };
  }

  const paymentId = createPayment({
    user_id: user.id,
    amount,
    subscription_days: payload.type === 'subscription' ? SUBSCRIPTION_DAYS : 0,
    payment_type: payload.type,
  });

  completePayment(paymentId, telegramChargeId, providerChargeId);

  if (payload.type === 'natal_chart') {
    const until = new Date();
    until.setDate(until.getDate() + 30);
    unlockNatalChart(telegramId, until.toISOString());
    logger.info(`Natal chart unlocked for user ${telegramId} until ${until.toISOString()}`);
    return;
  }

  // Subscription payment
  const now = new Date();
  let expiresAt: Date;

  if (user.subscription_status === 'premium' && user.subscription_expires) {
    const currentExpiry = new Date(user.subscription_expires);
    expiresAt = currentExpiry > now ? currentExpiry : now;
  } else {
    expiresAt = now;
  }
  expiresAt.setDate(expiresAt.getDate() + SUBSCRIPTION_DAYS);

  updateSubscription(telegramId, 'premium', expiresAt.toISOString());
  setAutoRenew(telegramId, true);
  logger.info(`Premium activated for user ${telegramId} until ${expiresAt.toISOString()}`);
}

export function isSubscriptionActive(user: Pick<User, 'telegram_id' | 'username' | 'subscription_status' | 'subscription_expires'>): boolean {
  if (isAdmin(user)) return true;
  if (user.subscription_status !== 'premium') return false;
  if (!user.subscription_expires) return true;
  return new Date(user.subscription_expires) > new Date();
}

export function hasNatalChartAccess(user: User): boolean {
  if (isAdmin(user)) return true;
  if (isSubscriptionActive(user)) return true;
  if (!user.natal_chart_unlocked) return false;
  if (!user.natal_chart_unlocked_until) return true;
  return new Date(user.natal_chart_unlocked_until) > new Date();
}

export function cancelSubscription(telegramId: number): void {
  setAutoRenew(telegramId, false);
  logger.info(`Auto-renew disabled for user ${telegramId}`);
}
