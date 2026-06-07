import 'dotenv/config';
import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import { initializeDatabase } from './database/setup';
import { createBot, getWebhookCallback } from './bot/index';
import { startScheduler } from './scheduler/cron';
import webappRoutes from './webapp/routes';
import { logger } from './utils/logger';

const PORT = parseInt(process.env.PORT || '3000', 10);
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'astroguru-secret';
const NODE_ENV = process.env.NODE_ENV || 'development';

async function main(): Promise<void> {
  logger.info('Starting AstroGuru Bot...');

  // Initialize database
  initializeDatabase();

  // Create bot
  const bot = createBot();

  // Create Express app
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for Telegram Mini App compatibility
  }));
  app.use(cors({
    origin: ['https://web.telegram.org', 'https://t.me'],
    credentials: true,
  }));

  // Body parsing (must come first so req.body is available for webhook handler)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Webhook handler
  if (WEBHOOK_URL) {
    const webhookPath = `/webhook/${WEBHOOK_SECRET}`;
    app.use(webhookPath, getWebhookCallback(bot));
    logger.info(`Webhook registered at ${webhookPath}`);
  }

  // Static files for Mini App
  app.use(express.static(path.join(process.cwd(), 'public')));

  // API routes for Mini App
  app.use('/api', webappRoutes);

  // Mini App route
  app.get('/app', (_req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  });

  // Privacy policy route
  app.get('/privacy', (_req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'privacy.html'));
  });

  // Start Express server
  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Mini App: http://localhost:${PORT}/app`);
    logger.info(`Environment: ${NODE_ENV}`);
  });

  // Start bot
  if (WEBHOOK_URL) {
    // Production: webhook mode
    const webhookUrl = `${WEBHOOK_URL}/webhook/${WEBHOOK_SECRET}`;
    await bot.api.setWebhook(webhookUrl, {
      secret_token: WEBHOOK_SECRET,
      allowed_updates: ['message', 'callback_query', 'pre_checkout_query', 'chat_member'],
    });
    logger.info(`Webhook set to: ${webhookUrl}`);
  } else {
    // Development: long polling
    await bot.api.deleteWebhook();
    bot.start({
      onStart: (botInfo) => {
        logger.info(`Bot @${botInfo.username} started in polling mode`);
      },
    });
    logger.info('Bot started in long polling mode');
  }

  // Start scheduler for daily horoscopes
  startScheduler(bot);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close();
    if (WEBHOOK_URL) {
      await bot.api.deleteWebhook();
    } else {
      await bot.stop();
    }
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error) => {
  const msg = error instanceof Error ? error.stack || error.message : String(error);
  logger.error('Fatal error during startup: ' + msg);
  console.error(error);
  process.exit(1);
});
