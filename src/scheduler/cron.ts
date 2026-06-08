import cron from 'node-cron';
import { Bot } from 'grammy';
import { getAllUsersWithBirthData, downgradeExpiredSubscriptions } from '../database/queries';
import { generateDailyHoroscope } from '../astrology/horoscope';
import { saveHoroscope, markHoroscopeSent, getHoroscope } from '../database/queries';
import { isNineAmInTimezone, getLocalDateKey } from '../astrology/timezone';
import { logger } from '../utils/logger';

const MINI_APP_URL = process.env.MINI_APP_URL || 'https://yourdomain.com';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function sendDailyHoroscopeToUser(
  bot: Bot,
  user: ReturnType<typeof getAllUsersWithBirthData>[0],
  dateKey: string
): Promise<'sent' | 'skipped' | 'failed'> {
  try {
    const existing = getHoroscope(user.id, dateKey);
    if (existing?.sent_at) return 'skipped';

    let content = existing?.content;
    if (!content) {
      content = await generateDailyHoroscope(user, new Date(), true);
      saveHoroscope({ user_id: user.id, date: dateKey, content });
    }

    const keyboard = {
      inline_keyboard: [
        [{ text: '🌟 Открыть Mini App', web_app: { url: MINI_APP_URL } }],
        [
          { text: '📅 На неделю', callback_data: 'weekly_horoscope' },
          { text: '🌙 Фаза луны', callback_data: 'moon_phase' },
        ],
        [{ text: '⭐ Premium', callback_data: 'subscribe_info' }],
      ],
    };

    await bot.api.sendMessage(user.telegram_id, `🌅 *Доброе утро!*\n\n${content}`, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });

    markHoroscopeSent(user.id, dateKey);
    return 'sent';
  } catch (error: unknown) {
    const err = error as { error_code?: number };
    if (err?.error_code === 403) {
      logger.warn(`User ${user.telegram_id} has blocked the bot`);
    } else {
      logger.error(`Failed to send horoscope to ${user.telegram_id}`, { error });
    }
    return 'failed';
  }
}

async function sendDailyHoroscopes(bot: Bot): Promise<void> {
  downgradeExpiredSubscriptions();
  const users = getAllUsersWithBirthData();
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const user of users) {
    const tz = user.timezone || 'Europe/Moscow';
    if (!isNineAmInTimezone(tz)) continue;

    const dateKey = getLocalDateKey(tz);
    const result = await sendDailyHoroscopeToUser(bot, user, dateKey);
    if (result === 'sent') sent++;
    else if (result === 'failed') failed++;
    else skipped++;

    await delay(35);
  }

  if (sent > 0 || failed > 0) {
    logger.info(`Daily horoscopes: ${sent} sent, ${skipped} skipped, ${failed} failed`);
  }
}

export function startScheduler(bot: Bot): void {
  // Check every hour — send to users where local time is 9:00
  cron.schedule('0 * * * *', async () => {
    logger.info('Cron: checking users for 9:00 local delivery');
    await sendDailyHoroscopes(bot);
  }, { timezone: 'UTC' });

  cron.schedule('0 2 * * 0', () => {
    logger.info('Cron job: cleaning up old horoscopes');
    try {
      const { db } = require('../database/setup');
      db.prepare(`DELETE FROM horoscopes WHERE created_at < datetime('now', '-30 days')`).run();
      db.prepare(`DELETE FROM chart_interpretations WHERE created_at < datetime('now', '-90 days')`).run();
    } catch (error) {
      logger.error('Failed to clean up old data', { error });
    }
  });

  logger.info('Scheduler started: daily horoscopes at 9:00 local time (per user timezone)');
}

export async function triggerDailyHoroscopes(bot: Bot): Promise<void> {
  const users = getAllUsersWithBirthData();
  for (const user of users) {
    const tz = user.timezone || 'Europe/Moscow';
    const dateKey = getLocalDateKey(tz);
    await sendDailyHoroscopeToUser(bot, user, dateKey);
    await delay(35);
  }
}
