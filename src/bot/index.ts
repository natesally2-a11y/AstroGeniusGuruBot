import { Bot, webhookCallback } from 'grammy';
import { logger } from '../utils/logger';
import { userMiddleware } from './middleware/userMiddleware';
import { registerStartHandler } from './handlers/start';
import { registerTodayHandler } from './handlers/today';
import { registerSubscribeHandler } from './handlers/subscribe';
import { registerSettingsHandler } from './handlers/settings';
import { registerPaymentHandlers } from './handlers/payment';

export function createBot(): Bot {
  const token = process.env.BOT_TOKEN;
  if (!token) throw new Error('BOT_TOKEN is not set in environment variables');

  const bot = new Bot(token);

  // Global error handler
  bot.catch((err) => {
    const ctx = err.ctx;
    logger.error(`Error handling update ${ctx.update.update_id}`, {
      error: err.error,
      userId: ctx.from?.id,
    });
  });

  // Middleware
  bot.use(userMiddleware);

  // Register all handlers
  registerStartHandler(bot);
  registerTodayHandler(bot);
  registerSubscribeHandler(bot);
  registerSettingsHandler(bot);
  registerPaymentHandlers(bot);

  // Help command
  bot.command('help', async (ctx) => {
    await ctx.reply(
      `🌟 *AstroGuru — команды:*\n\n` +
      `/start — Главное меню\n` +
      `/today — Гороскоп на сегодня\n` +
      `/subscribe — Оформить Premium подписку\n` +
      `/settings — Изменить данные рождения\n` +
      `/privacy — Политика конфиденциальности\n` +
      `/help — Это сообщение\n\n` +
      `💡 Для получения персонального гороскопа укажите дату рождения в /settings`,
      { parse_mode: 'Markdown' }
    );
  });

  // Mini App data handler
  bot.on('message:web_app_data', async (ctx) => {
    try {
      const data = JSON.parse(ctx.message.web_app_data!.data);
      if (data.action === 'subscribe') {
        const { sendSubscriptionInvoice } = await import('../payments/stars');
        const { getUserByTelegramId } = await import('../database/queries');
        const user = getUserByTelegramId(ctx.from!.id);
        if (user) await sendSubscriptionInvoice(bot, ctx.chat!.id, user.id);
      }
    } catch (e) {
      logger.error('web_app_data parse error', { e });
    }
  });

  // Privacy policy command
  bot.command('privacy', async (ctx) => {
    const webhookUrl = process.env.WEBHOOK_URL || 'https://astroguru-production.up.railway.app';
    await ctx.reply(
      `📄 *Политика конфиденциальности AstroGuru*\n\n` +
      `Ознакомьтесь с полным текстом политики в отношении обработки персональных данных:\n\n` +
      `🔗 ${webhookUrl}/privacy\n\n` +
      `По вопросам обработки персональных данных: natesally@yandex.com`,
      { parse_mode: 'Markdown' }
    );
  });

  // Unknown command fallback
  bot.on('message:text', async (ctx) => {
    if (ctx.message.text?.startsWith('/')) {
      await ctx.reply(
        '❓ Неизвестная команда. Используйте /help для просмотра доступных команд.'
      );
    }
  });

  logger.info('Bot created successfully');
  return bot;
}

export function getWebhookCallback(bot: Bot) {
  return webhookCallback(bot, 'express');
}
