import { Bot } from 'grammy';
import { getChannelChatId, isChannelPostingEnabled } from '../config/channel';
import {
  buildChannelPost, ChannelPostType, getChannelPostKeyboard, getTodayPostDateKey,
} from './channelPosts';
import { logger } from '../utils/logger';
import { db } from '../database/setup';

function ensureChannelPostsTable(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS channel_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_type TEXT NOT NULL,
      date_key TEXT NOT NULL UNIQUE,
      message_id INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

function wasPostedToday(type: ChannelPostType): boolean {
  ensureChannelPostsTable();
  const key = getTodayPostDateKey(type);
  const row = db.prepare('SELECT id FROM channel_posts WHERE date_key = ?').get(key);
  return Boolean(row);
}

function markPosted(type: ChannelPostType, messageId: number): void {
  ensureChannelPostsTable();
  const key = getTodayPostDateKey(type);
  db.prepare(
    'INSERT OR REPLACE INTO channel_posts (date_key, post_type, message_id) VALUES (?, ?, ?)'
  ).run(key, type, messageId);
}

export async function publishChannelPost(
  bot: Bot,
  type: ChannelPostType,
  options: { force?: boolean; disableNotification?: boolean } = {}
): Promise<number | null> {
  if (!isChannelPostingEnabled()) {
    logger.warn('Channel posting disabled or PROMO_CHANNEL_ID not set');
    return null;
  }

  if (!options.force && wasPostedToday(type)) {
    logger.info(`Channel post ${type} already sent today`);
    return null;
  }

  const chatId = getChannelChatId();
  const text = buildChannelPost(type);
  const keyboard = getChannelPostKeyboard(type);

  try {
    const msg = await bot.api.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
      disable_notification: options.disableNotification,
      link_preview_options: { is_disabled: true },
    });
    markPosted(type, msg.message_id);
    logger.info(`Channel post sent: ${type} → message ${msg.message_id}`);
    return msg.message_id;
  } catch (error) {
    logger.error(`Failed to publish channel post (${type})`, { error, chatId });
    throw error;
  }
}

export async function runDailyChannelSchedule(bot: Bot): Promise<void> {
  if (!isChannelPostingEnabled()) return;

  await publishChannelPost(bot, 'daily', { disableNotification: false });
  await publishChannelPost(bot, 'spotlight', { disableNotification: true });
}

export async function runWeeklyChannelSchedule(bot: Bot): Promise<void> {
  if (!isChannelPostingEnabled()) return;
  await publishChannelPost(bot, 'weekly');
}

export async function runEveningChannelSchedule(bot: Bot): Promise<void> {
  if (!isChannelPostingEnabled()) return;
  await publishChannelPost(bot, 'moon', { disableNotification: true });
}
