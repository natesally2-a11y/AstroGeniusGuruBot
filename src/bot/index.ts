import { Bot, webhookCallback } from 'grammy';
import { logger } from '../utils/logger';
import { userMiddleware } from './middleware/userMiddleware';
import { registerStartHandler } from './handlers/start';
import { registerTodayHandler } from './handlers/today';
import { registerSubscribeHandler } from './handlers/subscribe';
import { registerSettingsHandler } from './handlers/settings';
import { registerPaymentHandlers } from './handlers/payment';
import { registerFeaturesHandler } from './handlers/features';

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

  bot.command('help', async (ctx) => {
    const { BOT_FEATURES_GUIDE } = await import('./helpers/messages');
    await ctx.reply(BOT_FEATURES_GUIDE, { parse_mode: 'Markdown' });
  });

  // Hidden refund info — not in /help
  bot.command('refund_support', async (ctx) => {
    await ctx.reply(
      `📧 *Возврат средств*\n\n` +
      `Для запроса возврата напишите на natesally@yandex.com с темой «Возврат AstroGuru».\n` +
      `Укажите: Telegram ID, дату оплаты, сумму в Stars.\n` +
      `Рассмотрение — до 5 рабочих дней.`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.on('message:web_app_data', async (ctx) => {
    try {
      const data = JSON.parse(ctx.message.web_app_data!.data);
      const { getUserByTelegramId } = await import('../database/queries');
      const user = getUserByTelegramId(ctx.from!.id);

      if (data.action === 'subscribe' && user) {
        const { sendSubscriptionInvoice } = await import('../payments/stars');
        await sendSubscriptionInvoice(bot, ctx.chat!.id, user.id);
        return;
      }

      if (data.action === 'buy_natal_chart' && user) {
        const { sendNatalChartInvoice } = await import('../payments/stars');
        await sendNatalChartInvoice(bot, ctx.chat!.id, user.id);
        return;
      }

      if (data.action === 'cancel_subscription' && user) {
        const { cancelSubscription } = await import('../payments/stars');
        cancelSubscription(ctx.from!.id);
        await ctx.reply('✅ Автопродление отключено. Подписка действует до конца оплаченного периода.');
        return;
      }

      if (data.action === 'command' && data.command) {
        const cmd = data.command.replace('/', '');
        const handlers: Record<string, () => Promise<void>> = {
          today: async () => { await ctx.reply('🔮 Отправляю гороскоп...'); },
          settings: async () => { await ctx.reply('⚙️ Введите /settings для изменения данных рождения'); },
        };
        if (handlers[cmd]) {
          await handlers[cmd]();
        } else {
          await ctx.reply(`Выполните команду ${data.command} в чате с ботом 👇`);
        }
        // Trigger actual command by simulating - user can tap
        if (cmd === 'today') {
          const { generateDailyHoroscope } = await import('../astrology/horoscope');
          if (user?.birth_date) {
            const text = await generateDailyHoroscope(user, new Date());
            await ctx.reply(text, { parse_mode: 'Markdown' });
          }
        }
        if (cmd === 'settings') {
          await ctx.reply('⚙️ Введите дату рождения в формате ДД.ММ.ГГГГ', {
            reply_markup: { inline_keyboard: [[{ text: '📅 Указать дату', callback_data: 'edit_birth_date' }]] },
          });
        }
      }
    } catch (e) {
      logger.error('web_app_data error', { e });
    }
  });

  bot.command('appss_verify', async (ctx) => {
    await ctx.reply('appss_0a3e35');
  });

  bot.command('privacy', async (ctx) => {
    const webhookUrl = process.env.WEBHOOK_URL || 'https://astroguru-production.up.railway.app';
    await ctx.reply(
      `📄 *Политика конфиденциальности*\n\n🔗 ${webhookUrl}/privacy\n\n` +
      `📧 natesally@yandex.com`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.on('message:text', async (ctx) => {
    if (ctx.message.text?.startsWith('/')) {
      await ctx.reply('❓ Неизвестная команда. /help');
    }
  });

  logger.info('Bot created successfully');
  return bot;
}

export function getWebhookCallback(bot: Bot) {
  return webhookCallback(bot, 'express');
}
