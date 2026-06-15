import { Bot, Api } from 'grammy';
import { logger } from '../utils/logger';
import {
  getUserByTelegramId, updateSubscription, createPayment, completePayment,
  unlockNatalChart, setAutoRenew, clearRenewalNotice, User,
} from '../database/queries';
import { isAdmin } from '../config/admin';
import { isLifetimePremium } from '../config/vip';
import { getUserLang, t } from '../i18n';

export const SUBSCRIPTION_PRICE = parseInt(process.env.SUBSCRIPTION_PRICE || '99', 10);
export const SUBSCRIPTION_DAYS = parseInt(process.env.SUBSCRIPTION_DAYS || '30', 10);
export const NATAL_CHART_PRICE = parseInt(process.env.NATAL_CHART_PRICE || '99', 10);

export interface InvoiceParams {
  title: string;
  description: string;
  payload: string;
  prices: Array<{ label: string; amount: number }>;
}

export function buildSubscriptionInvoice(
  userId: number,
  user?: Pick<User, 'language_code'> | null,
  isRenewal = false
): InvoiceParams {
  const lang = getUserLang(user);
  return {
    title: t(lang, 'invoice.sub_title'),
    description: t(lang, isRenewal ? 'invoice.sub_desc_renewal' : 'invoice.sub_desc', {
      price: String(SUBSCRIPTION_PRICE),
      days: String(SUBSCRIPTION_DAYS),
    }),
    payload: JSON.stringify({ type: 'subscription', userId, days: SUBSCRIPTION_DAYS, renewal: isRenewal }),
    prices: [{ label: t(lang, 'invoice.sub_price_label', { days: String(SUBSCRIPTION_DAYS) }), amount: SUBSCRIPTION_PRICE }],
  };
}

export function buildNatalChartInvoice(
  userId: number,
  user?: Pick<User, 'language_code'> | null
): InvoiceParams {
  const lang = getUserLang(user);
  return {
    title: t(lang, 'invoice.chart_title'),
    description: t(lang, 'invoice.chart_desc'),
    payload: JSON.stringify({ type: 'natal_chart', userId }),
    prices: [{ label: t(lang, 'invoice.chart_price_label'), amount: NATAL_CHART_PRICE }],
  };
}

async function sendInvoice(api: Api, chatId: number, invoice: InvoiceParams): Promise<void> {
  await api.sendInvoice(
    chatId,
    invoice.title,
    invoice.description,
    invoice.payload,
    'XTR',
    invoice.prices,
  );
}

export async function sendSubscriptionInvoice(
  botOrApi: Bot | Api,
  chatId: number,
  userId: number,
  isRenewal = false,
  user?: Pick<User, 'language_code'> | null
): Promise<void> {
  const api = 'api' in botOrApi ? botOrApi.api : botOrApi;
  const u = user || getUserByTelegramId(chatId);
  try {
    await sendInvoice(api, chatId, buildSubscriptionInvoice(userId, u, isRenewal));
    logger.info(`Subscription invoice sent to user ${userId}${isRenewal ? ' (renewal)' : ''}`);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error('Failed to send subscription invoice', { error: errMsg, userId });
    throw error;
  }
}

export async function sendNatalChartInvoice(
  botOrApi: Bot | Api,
  chatId: number,
  userId: number,
  user?: Pick<User, 'language_code'> | null
): Promise<void> {
  const api = 'api' in botOrApi ? botOrApi.api : botOrApi;
  const u = user || getUserByTelegramId(chatId);
  try {
    await sendInvoice(api, chatId, buildNatalChartInvoice(userId, u));
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
  clearRenewalNotice(telegramId);
  logger.info(`Premium activated for user ${telegramId} until ${expiresAt.toISOString()}`);
}

export function isSubscriptionActive(user: Pick<User, 'telegram_id' | 'username' | 'subscription_status' | 'subscription_expires'>): boolean {
  if (isAdmin(user)) return true;
  if (isLifetimePremium(user)) return true;
  if (user.subscription_status !== 'premium') return false;
  if (!user.subscription_expires) return true;
  return new Date(user.subscription_expires) > new Date();
}

export function hasNatalChartAccess(user: User): boolean {
  if (isAdmin(user)) return true;
  if (isLifetimePremium(user)) return true;
  if (isSubscriptionActive(user)) return true;
  if (!user.natal_chart_unlocked) return false;
  if (!user.natal_chart_unlocked_until) return true;
  return new Date(user.natal_chart_unlocked_until) > new Date();
}

export function cancelSubscription(telegramId: number): void {
  setAutoRenew(telegramId, false);
  logger.info(`Auto-renew disabled for user ${telegramId}`);
}
