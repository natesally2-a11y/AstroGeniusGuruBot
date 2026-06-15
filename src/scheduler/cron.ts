import cron from 'node-cron';
import { Bot } from 'grammy';
import {
  getAllUsersWithBirthData, downgradeExpiredSubscriptions,
  getUsersForRenewalReminder, markRenewalNoticeSent,
} from '../database/queries';
import { sendSubscriptionInvoice, SUBSCRIPTION_PRICE } from '../payments/stars';
import { isAdmin } from '../config/admin';
import { generateDailyHoroscope } from '../astrology/horoscope';
import { saveHoroscope, markHoroscopeSent, getHoroscope } from '../database/queries';
import { isNineAmInTimezone, getHoroscopeCacheKey, parseLangFromHoroscopeKey } from '../astrology/timezone';
import { morningNotifyKeyboardForLang } from '../bot/helpers/keyboards';
import { resolveUserLang, t, tUser, formatLocalizedDate } from '../i18n';
import { logger } from '../utils/logger';
import { isChannelPostingEnabled } from '../config/channel';
import {
  runDailyChannelSchedule, runEveningChannelSchedule, runWeeklyChannelSchedule,
} from '../promo/channelPublisher';

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
      content = await generateDailyHoroscope(user);
      saveHoroscope({ user_id: user.id, date: dateKey, content });
    }

    const lang = parseLangFromHoroscopeKey(dateKey) || resolveUserLang(user);

    await bot.api.sendMessage(user.telegram_id, `${t(lang, 'cron.morning')}\n\n${content}`, {
      parse_mode: 'Markdown',
      reply_markup: morningNotifyKeyboardForLang(lang),
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
  downgradeExpiredSubscriptions(
    (process.env.ADMIN_TELEGRAM_IDS || '6004279903').split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean)
  );
  const users = getAllUsersWithBirthData();
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const user of users) {
    const tz = user.timezone || 'Europe/Moscow';
    if (!isNineAmInTimezone(tz)) continue;

    const dateKey = getHoroscopeCacheKey(user);
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

async function sendRenewalReminders(bot: Bot): Promise<void> {
  const users = getUsersForRenewalReminder();
  let sent = 0;

  for (const user of users) {
    if (isAdmin(user)) continue;
    try {
      const expiresDate = user.subscription_expires
        ? formatLocalizedDate(user, user.subscription_expires)
        : '—';

      await sendSubscriptionInvoice(bot, user.telegram_id, user.id, true, user);
      await bot.api.sendMessage(
        user.telegram_id,
        t(resolveUserLang(user), 'cron.renewal', {
          date: expiresDate,
          price: String(SUBSCRIPTION_PRICE),
        }),
        { parse_mode: 'Markdown' }
      );
      markRenewalNoticeSent(user.telegram_id, user.subscription_expires!);
      sent++;
      await delay(500);
    } catch (error) {
      logger.error(`Failed to send renewal invoice to ${user.telegram_id}`, { error });
    }
  }

  if (sent > 0) {
    logger.info(`Renewal reminders sent: ${sent}`);
  }
}

export function startScheduler(bot: Bot): void {
  // Check every hour — send to users where local time is 9:00
  cron.schedule('0 * * * *', async () => {
    logger.info('Cron: checking users for 9:00 local delivery');
    await sendDailyHoroscopes(bot);
  }, { timezone: 'UTC' });

  cron.schedule('0 10 * * *', async () => {
    logger.info('Cron: sending subscription renewal reminders');
    await sendRenewalReminders(bot);
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

  if (isChannelPostingEnabled()) {
    // 07:00 MSK — daily horoscope + sign spotlight
    cron.schedule('0 4 * * *', async () => {
      logger.info('Cron: channel morning posts');
      await runDailyChannelSchedule(bot);
    }, { timezone: 'UTC' });

    // 20:00 MSK — moon post
    cron.schedule('0 17 * * *', async () => {
      logger.info('Cron: channel evening moon post');
      await runEveningChannelSchedule(bot);
    }, { timezone: 'UTC' });

    // Sunday 12:00 MSK — weekly digest
    cron.schedule('0 9 * * 0', async () => {
      logger.info('Cron: channel weekly post');
      await runWeeklyChannelSchedule(bot);
    }, { timezone: 'UTC' });

    logger.info('Channel scheduler: 07:00 daily, 20:00 moon, Sun 12:00 weekly (MSK)');
  }

  logger.info('Scheduler started: daily horoscopes at 9:00 local time (per user timezone)');
}

export async function triggerDailyHoroscopes(bot: Bot): Promise<void> {
  const users = getAllUsersWithBirthData();
  for (const user of users) {
    const tz = user.timezone || 'Europe/Moscow';
    const dateKey = getHoroscopeCacheKey(user);
    await sendDailyHoroscopeToUser(bot, user, dateKey);
    await delay(35);
  }
}
