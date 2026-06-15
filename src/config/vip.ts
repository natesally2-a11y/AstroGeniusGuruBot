import { User, getUserByTelegramId, updateSubscription, setAutoRenew } from '../database/queries';
import { db } from '../database/setup';
import { isAdmin } from './admin';
import { logger } from '../utils/logger';

const LIFETIME_PREMIUM_IDS = (process.env.LIFETIME_PREMIUM_TELEGRAM_IDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);

const LIFETIME_PREMIUM_USERNAMES = (process.env.LIFETIME_PREMIUM_USERNAMES || 'maraJB007,reverendigel,A1010A')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

export function isLifetimePremium(user: Pick<User, 'telegram_id' | 'username'>): boolean {
  if (isAdmin(user)) return false;
  if (LIFETIME_PREMIUM_IDS.includes(user.telegram_id)) return true;
  if (user.username && LIFETIME_PREMIUM_USERNAMES.includes(user.username.toLowerCase())) return true;
  return false;
}

function applyLifetimePremium(telegramId: number): void {
  updateSubscription(telegramId, 'premium', undefined);
  setAutoRenew(telegramId, false);
}

export function ensureLifetimePremium(user: Pick<User, 'telegram_id' | 'username' | 'subscription_status' | 'subscription_expires'>): void {
  if (!isLifetimePremium(user)) return;
  if (user.subscription_status === 'premium' && !user.subscription_expires) return;
  applyLifetimePremium(user.telegram_id);
  logger.info(`Lifetime premium ensured for @${user.username || user.telegram_id}`);
}

export function grantLifetimePremiumToVipAccounts(): number {
  let granted = 0;
  for (const username of LIFETIME_PREMIUM_USERNAMES) {
    const rows = db.prepare(
      'SELECT telegram_id, username, subscription_status, subscription_expires FROM users WHERE LOWER(username) = ?'
    ).all(username) as Pick<User, 'telegram_id' | 'username' | 'subscription_status' | 'subscription_expires'>[];

    for (const row of rows) {
      ensureLifetimePremium(row);
      granted++;
    }
  }
  for (const id of LIFETIME_PREMIUM_IDS) {
    const user = getUserByTelegramId(id);
    if (user) {
      ensureLifetimePremium(user);
      granted++;
    }
  }
  return granted;
}
