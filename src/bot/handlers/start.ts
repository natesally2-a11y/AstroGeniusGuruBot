import { Bot, InlineKeyboard } from 'grammy';
import { getUserByTelegramId } from '../../database/queries';
import { hasNatalChartAccess } from '../../payments/stars';
import { BOT_FEATURES_GUIDE } from '../helpers/messages';
import { formatLuckyDayMessage } from '../../astrology/lucky';
import { logger } from '../../utils/logger';

const MINI_APP_URL = process.env.MINI_APP_URL || 'https://astroguru-production.up.railway.app/app';

export function registerStartHandler(bot: Bot): void {
  bot.command('start', async (ctx) => {
    const telegramId = ctx.from!.id;
    const user = getUserByTelegramId(telegramId);
    const firstName = ctx.from!.first_name;

    logger.info(`/start from ${telegramId}`);

    const keyboard = new InlineKeyboard()
      .webApp('🌟 Открыть AstroGuru', MINI_APP_URL).row()
      .text('🔮 Гороскоп', 'horoscope_today').text('🌙 Луна', 'moon_phase').row()
      .text('⭐ Premium', 'subscribe_info').text('🍀 Удача', 'lucky_day').row()
      .text('📊 Натальная карта', 'natal_chart').text('💑 Совместимость', 'compatibility').row()
      .text('📚 Все команды', 'show_commands').text('⚙️ Настройки', 'settings_menu');

    if (!user?.birth_date) {
      await ctx.reply(
        `✨ *Добро пожаловать в AstroGuru, ${firstName}!*\n\n` +
        `Я — ваш личный астролог. Рассчитываю натальную карту, гороскопы и транзиты по вашим данным рождения.\n\n` +
        `👇 *Начните с даты рождения*, затем изучите все функции:`,
        {
          parse_mode: 'Markdown',
          reply_markup: new InlineKeyboard()
            .text('📅 Указать дату рождения', 'edit_birth_date').row()
            .webApp('🌟 Открыть приложение', MINI_APP_URL).row()
            .text('📚 Все команды бота', 'show_commands'),
        }
      );
      await ctx.reply(BOT_FEATURES_GUIDE, { parse_mode: 'Markdown' });
    } else {
      await ctx.reply(
        `🌟 *С возвращением, ${firstName}!*\n\n` +
        `Выберите действие на клавиатуре или смотрите все команды ниже 👇`,
        { parse_mode: 'Markdown', reply_markup: keyboard }
      );
      await ctx.reply(BOT_FEATURES_GUIDE, { parse_mode: 'Markdown' });
    }
  });

  bot.callbackQuery('show_commands', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    await ctx.reply(BOT_FEATURES_GUIDE, { parse_mode: 'Markdown' });
  });

  bot.callbackQuery('lucky_day', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    await ctx.reply(formatLuckyDayMessage(user), { parse_mode: 'Markdown' });
  });

  bot.callbackQuery('natal_chart', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    if (!user?.birth_date) {
      await ctx.reply('📅 Сначала укажите дату рождения: /settings');
      return;
    }
    if (!hasNatalChartAccess(user)) {
      await ctx.reply(
        '🔒 Натальная карта доступна в *Premium* или разово за 99 ⭐\n\n/subscribe или /buy_chart',
        { parse_mode: 'Markdown' }
      );
      return;
    }
    await ctx.reply('📊 Ваша натальная карта с домами и аспектами:', {
      reply_markup: new InlineKeyboard().webApp('🌟 Открыть карту', MINI_APP_URL),
    });
  });

  bot.callbackQuery('compatibility', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    await ctx.reply('💑 Проверьте совместимость знаков в Mini App:', {
      reply_markup: new InlineKeyboard().webApp('💑 Совместимость', MINI_APP_URL),
    });
  });

  bot.callbackQuery('settings_menu', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    await ctx.reply(
      '⚙️ *Настройки данных рождения*\n\nКоманда /settings — укажите дату, время и город рождения для точных расчётов.',
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard().text('📅 Указать дату', 'edit_birth_date'),
      }
    );
  });
}
