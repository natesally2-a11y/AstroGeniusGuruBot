import { Bot, webhookCallback } from 'grammy';
import { logger } from '../utils/logger';
import { userMiddleware } from './middleware/userMiddleware';
import { registerStartHandler } from './handlers/start';
import { registerTodayHandler } from './handlers/today';
import { registerSubscribeHandler } from './handlers/subscribe';
import { registerSettingsHandler } from './handlers/settings';
import { registerPaymentHandlers } from './handlers/payment';
import { registerFeaturesHandler } from './handlers/features';
import { registerLanguageHandler } from './handlers/language';
import { registerChannelAdminHandler } from './handlers/channelAdmin';

export function createBot(): Bot {
  const token = process.env.BOT_TOKEN;
  if (!token) throw new Error('BOT_TOKEN is not set in environment variables');

  const bot = new Bot(token);

  bot.catch((err) => {
    logger.error(`Error handling update ${err.ctx.update.update_id}`, {
      error: err.error,
      userId: err.ctx.from?.id,
    });
  });

  bot.use(userMiddleware);

  registerStartHandler(bot);
  registerTodayHandler(bot);
  registerSubscribeHandler(bot);
  registerSettingsHandler(bot);
  registerPaymentHandlers(bot);
  registerFeaturesHandler(bot);
  registerLanguageHandler(bot);
  registerChannelAdminHandler(bot);

  bot.command('help', async (ctx) => {
    const { getUserByTelegramId } = await import('../database/queries');
    const { getGuideText, getUserLang } = await import('../i18n');
    const user = getUserByTelegramId(ctx.from!.id);
    await ctx.reply(getGuideText(getUserLang(user)), { parse_mode: 'Markdown' });
  });

  // Hidden refund info — not in /help
  bot.command('refund_support', async (ctx) => {
    const { getUserByTelegramId } = await import('../database/queries');
    const { tUser } = await import('../i18n');
    const user = getUserByTelegramId(ctx.from!.id);
    await ctx.reply(tUser(user, 'common.refund_support'), { parse_mode: 'Markdown' });
  });

  bot.on('message:web_app_data', async (ctx) => {
    try {
      const data = JSON.parse(ctx.message.web_app_data!.data);
      const { getUserByTelegramId } = await import('../database/queries');
      const user = getUserByTelegramId(ctx.from!.id);

      if (data.action === 'subscribe' && user) {
        const { sendSubscriptionInvoice } = await import('../payments/stars');
        await sendSubscriptionInvoice(bot, ctx.chat!.id, user.id, false, user);
        return;
      }

      if (data.action === 'buy_natal_chart' && user) {
        const { sendNatalChartInvoice } = await import('../payments/stars');
        await sendNatalChartInvoice(bot, ctx.chat!.id, user.id, user);
        return;
      }

      if (data.action === 'cancel_subscription' && user) {
        const { cancelSubscription } = await import('../payments/stars');
        const { tUser } = await import('../i18n');
        cancelSubscription(ctx.from!.id);
        await ctx.reply(tUser(user, 'common.auto_renew_off'));
        return;
      }

      if (data.action === 'command' && data.command) {
        const cmd = data.command.replace('/', '');
        const { tUser } = await import('../i18n');
        if (cmd === 'today' && user?.birth_date) {
          const { sendTodayHoroscope } = await import('./handlers/today');
          await sendTodayHoroscope(ctx);
          return;
        }
        if (cmd === 'settings') {
          const { enterDateKeyboard } = await import('./helpers/keyboards');
          await ctx.reply(tUser(user, 'birth.enter_date'), {
            parse_mode: 'Markdown',
            reply_markup: enterDateKeyboard(user),
          });
          return;
        }
        await ctx.reply(tUser(user, 'common.run_command', { command: data.command }));
      }
    } catch (e) {
      logger.error('web_app_data error', { e });
    }
  });

  bot.command('appss_verify', async (ctx) => {
    await ctx.reply('appss_0a3e35');
  });

  bot.command('privacy', async (ctx) => {
    const { getUserByTelegramId } = await import('../database/queries');
    const { tUser } = await import('../i18n');
    const user = getUserByTelegramId(ctx.from!.id);
    const webhookUrl = process.env.WEBHOOK_URL || 'https://astroguru-production.up.railway.app';
    await ctx.reply(
      tUser(user, 'common.privacy', { url: webhookUrl }),
      { parse_mode: 'Markdown' }
    );
  });

  const knownCommands = new Set([
    'start', 'today', 'subscribe', 'settings', 'help', 'lucky', 'moon', 'month',
    'transits', 'cancel', 'buy_chart', 'privacy', 'refund_support', 'appss_verify', 'language',
    'channel_info', 'channel_post', 'channel_preview',
  ]);

  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text?.trim() || '';
    if (!text.startsWith('/')) return;

    const command = text.split(/\s+/)[0].slice(1).split('@')[0].toLowerCase();
    if (knownCommands.has(command)) return;

    const { getUserByTelegramId } = await import('../database/queries');
    const { tUser } = await import('../i18n');
    const user = getUserByTelegramId(ctx.from!.id);
    await ctx.reply(tUser(user, 'common.unknown_command'));
  });

  logger.info('Bot created successfully');
  return bot;
}

export function getWebhookCallback(bot: Bot) {
  return webhookCallback(bot, 'express', {
    // Telegram retries after ~60s — answer quickly; heavy work continues after template delivery.
    timeoutMilliseconds: 25_000,
    onTimeout: 'return',
  });
}
