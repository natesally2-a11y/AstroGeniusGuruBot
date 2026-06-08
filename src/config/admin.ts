import { User } from '../database/queries';

const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '6004279903')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);

const ADMIN_USERNAMES = (process.env.ADMIN_USERNAMES || 'ADBusinessAnalyst')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

export function isAdmin(user: Pick<User, 'telegram_id' | 'username'>): boolean {
  if (ADMIN_IDS.includes(user.telegram_id)) return true;
  if (user.username && ADMIN_USERNAMES.includes(user.username.toLowerCase())) return true;
  return false;
}

export function isAdminTelegramId(telegramId: number): boolean {
  return ADMIN_IDS.includes(telegramId);
}
