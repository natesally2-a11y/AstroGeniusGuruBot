import cron from 'node-cron';
import { Bot } from 'grammy';
import { getAllUsersWithBirthData } from '../database/queries';
import { generateDailyHoroscope } from '../astrology/horoscope';
import { saveHoroscope, markHoroscopeSent, getHoroscope } from '../database/queries';
import { logger } from '../utils/logger';

const MINI_APP_URL = process.env.MINI_APP_URL || 'https://yourdomain.com';

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function sendDailyHoroscopes(bot: Bot): Promise<void> {
  logger.info('Starting daily horoscope distribution...');
  const users = getAllUsersWithBirthData();
  logger.info(`Found ${users.length} users with birth data`);

  const today = new Date();
  const dateKey = today.toISOString().split('T')[0];
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      // Check if already sent today
      const existing = getHoroscope(user.id, dateKey);
      if (existing?.sent_at) {
        continue;
      }

      // Generate or get cached horoscope
      let content = existing?.content;
      if (!content) {
        content = generateDailyHoroscope(user, today);
        saveHoroscope({
          user_id: user.id,
          date: dateKey,
          content,
        });
      }

      const keyboard = {
        inline_keyboard: [
          [{ text: '🌟 Открыть Mini App', web_app: { url: MINI_APP_URL } }],
          [
            { text: '📅 На неделю', callback_data: 'weekly_horoscope' },
            { text: '⭐ Premium', callback_data: 'subscribe_info' },
          ],
        ],
      };

      await bot.api.sendMessage(user.telegram_id, `🌅 *Доброе утро!*\n\n${content}`, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });

      markHoroscopeSent(user.id, dateKey);
      sent++;

      // Rate limiting: 30 messages per second max
      await delay(35);

    } catch (error: unknown) {
      const err = error as { error_code?: number; description?: string };
      if (err?.error_code === 403) {
        // User blocked the bot — could deactivate notifications here
        logger.warn(`User ${user.telegram_id} has blocked the bot`);
      } else {
        logger.error(`Failed to send horoscope to ${user.telegram_id}`, { error });
      }
      failed++;
    }
  }

  logger.info(`Daily horoscopes sent: ${sent} success, ${failed} failed`);
}

export function startScheduler(bot: Bot): void {
  // Send daily horoscopes at 9:00 AM UTC (adjust as needed)
  cron.schedule('0 9 * * *', async () => {
    logger.info('Cron job: daily horoscopes triggered');
    await sendDailyHoroscopes(bot);
  }, {
    timezone: 'UTC',
  });

  // Clean up old horoscopes weekly (keep 30 days)
  cron.schedule('0 2 * * 0', () => {
    logger.info('Cron job: cleaning up old horoscopes');
    try {
      const { db } = require('../database/setup');
      db.prepare(`
        DELETE FROM horoscopes
        WHERE created_at < datetime('now', '-30 days')
      `).run();
      logger.info('Old horoscopes cleaned up');
    } catch (error) {
      logger.error('Failed to clean up horoscopes', { error });
    }
  });

  logger.info('Scheduler started: daily horoscopes at 9:00 UTC');
}

export async function triggerDailyHoroscopes(bot: Bot): Promise<void> {
  await sendDailyHoroscopes(bot);
}
