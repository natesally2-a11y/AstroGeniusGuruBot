import { Bot, InlineKeyboard } from 'grammy';
import { getUserByTelegramId } from '../../database/queries';
import { logger } from '../../utils/logger';

const MINI_APP_URL = process.env.MINI_APP_URL || 'https://yourdomain.com';

export function registerStartHandler(bot: Bot): void {
  bot.command('start', async (ctx) => {
    const telegramId = ctx.from!.id;
    const user = getUserByTelegramId(telegramId);
    const firstName = ctx.from!.first_name;

    logger.info(`/start from ${telegramId}`);

    const keyboard = new InlineKeyboard()
      .webApp('🌟 Открыть AstroGuru', MINI_APP_URL).row()
      .text('🔮 Мой гороскоп', 'horoscope_today').text('⭐ Premium', 'subscribe_info').row()
      .text('📊 Натальная карта', 'natal_chart').text('💑 Совместимость', 'compatibility').row()
      .text('⚙️ Настройки', 'settings_menu');

    if (!user?.birth_date) {
      await ctx.reply(
        `✨ *Добро пожаловать в AstroGuru, ${firstName}!*\n\n` +
        `Я — ваш личный астрологический помощник. Составлю точный гороскоп на каждый день на основе вашей натальной карты.\n\n` +
        `🌟 *Что я умею:*\n` +
        `• Персональный ежедневный гороскоп\n` +
        `• Расчёт натальной карты\n` +
        `• Проверка совместимости\n` +
        `• Недельные и месячные прогнозы\n\n` +
        `Для начала укажите дату рождения — это займёт всего минуту! 👇`,
        {
          parse_mode: 'Markdown',
          reply_markup: new InlineKeyboard()
            .text('📅 Указать дату рождения', 'edit_birth_date').row()
            .webApp('🌟 Открыть приложение', MINI_APP_URL),
        }
      );
    } else {
      await ctx.reply(
        `🌟 *С возвращением, ${firstName}!*\n\n` +
        `Рад снова видеть вас. Чем займёмся сегодня?`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        }
      );
    }
  });


  bot.callbackQuery('horoscope_today', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply('Используйте команду /today для получения гороскопа');
  });

  bot.callbackQuery('subscribe_info', async (ctx) => {
    await ctx.answerCallbackQuery();
    const price = process.env.SUBSCRIPTION_PRICE || '49';
    const keyboard = new InlineKeyboard()
      .text(`⭐ Подписаться за ${price} Stars`, 'confirm_subscribe').row()
      .text('❓ Что входит в Premium?', 'premium_features');

    await ctx.reply(
      `⭐ *AstroGuru Premium*\n\n` +
      `🆓 *Бесплатно:*\n• Базовый гороскоп по знаку Солнца\n\n` +
      `💎 *Premium — ${price} ⭐ Stars/месяц:*\n` +
      `• Персональный гороскоп на основе натальной карты\n` +
      `• Анализ планетарных транзитов\n` +
      `• Детальная натальная карта\n` +
      `• Недельный и месячный прогноз\n` +
      `• Совместимость с любым знаком\n` +
      `• Ежедневные уведомления в 9:00\n`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );
  });

  bot.callbackQuery('premium_features', async (ctx) => {
    await ctx.answerCallbackQuery({ text: '💎 Premium открывает полный доступ к персональной астрологии!', show_alert: true });
  });

  bot.callbackQuery('natal_chart', async (ctx) => {
    await ctx.answerCallbackQuery();
    const user = getUserByTelegramId(ctx.from.id);
    if (!user?.birth_date) {
      await ctx.reply('📅 Сначала укажите дату рождения командой /settings');
      return;
    }
    if (user.subscription_status !== 'premium') {
      await ctx.reply(
        '🔒 Натальная карта доступна только в *Premium*\n\nОформите подписку командой /subscribe',
        { parse_mode: 'Markdown' }
      );
      return;
    }
    await ctx.reply('🌟 Открываю вашу натальную карту...', {
      reply_markup: new InlineKeyboard().webApp('📊 Натальная карта', MINI_APP_URL),
    });
  });

  bot.callbackQuery('compatibility', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply('💑 Выберите знаки для проверки совместимости в Mini App', {
      reply_markup: new InlineKeyboard().webApp('💑 Открыть совместимость', MINI_APP_URL),
    });
  });

  bot.callbackQuery('settings_menu', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply('⚙️ Настройки — используйте команду /settings');
  });
}
