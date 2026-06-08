import { Bot, InlineKeyboard } from 'grammy';
import { getUserByTelegramId, saveHoroscope, getHoroscope } from '../../database/queries';
import { generateDailyHoroscope, generateWeeklyHoroscope } from '../../astrology/horoscope';
import { isSubscriptionActive } from '../../payments/stars';
import { getLocalDateKey } from '../../astrology/timezone';
import { logger } from '../../utils/logger';

const MINI_APP_URL = process.env.MINI_APP_URL || 'https://yourdomain.com';

export function registerTodayHandler(bot: Bot): void {
  bot.command('today', async (ctx) => {
    const telegramId = ctx.from!.id;
    const user = getUserByTelegramId(telegramId);

    logger.info(`/today from ${telegramId}`);

    if (!user) {
      await ctx.reply('❗ Пожалуйста, начните с команды /start');
      return;
    }

    if (!user.birth_date) {
      await ctx.reply(
        '📅 Для получения персонального гороскопа укажите дату рождения!\n\nИспользуйте команду /settings',
        { reply_markup: new InlineKeyboard().text('⚙️ Указать дату рождения', 'edit_birth_date') }
      );
      return;
    }

    await ctx.api.sendChatAction(ctx.chat!.id, 'typing');

    const tz = user.timezone || 'Europe/Moscow';
    const dateKey = getLocalDateKey(tz);
    const cached = getHoroscope(user.id, dateKey);
    let horoscopeText: string;

    if (cached) {
      horoscopeText = cached.content;
    } else {
      horoscopeText = await generateDailyHoroscope(user, new Date());
      saveHoroscope({ user_id: user.id, date: dateKey, content: horoscopeText });
    }

    const keyboard = new InlineKeyboard();
    if (!isSubscriptionActive(user)) {
      keyboard.text('⭐ Получить Premium', 'subscribe_info').row();
    }
    keyboard
      .webApp('🌟 Открыть Mini App', MINI_APP_URL).row()
      .text('📅 Недельный прогноз', 'weekly_horoscope')
      .text('🌙 Фаза луны', 'moon_phase');

    await ctx.reply(horoscopeText, { parse_mode: 'Markdown', reply_markup: keyboard });
  });

  bot.callbackQuery('weekly_horoscope', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    if (!user) return;

    if (!isSubscriptionActive(user)) {
      await ctx.reply(
        '🔒 Недельный гороскоп доступен только в *Premium*\n\nКоманда /subscribe',
        {
          parse_mode: 'Markdown',
          reply_markup: new InlineKeyboard().text('⭐ Оформить Premium', 'confirm_subscribe'),
        }
      );
      return;
    }

    await ctx.api.sendChatAction(ctx.chat!.id, 'typing');
    const weekly = await generateWeeklyHoroscope(user);
    await ctx.reply(weekly, {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().webApp('📊 Подробнее', MINI_APP_URL),
    });
  });

  bot.callbackQuery('horoscope_today', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    if (!user?.birth_date) {
      await ctx.reply('Укажите дату рождения: /settings');
      return;
    }
    await ctx.api.sendChatAction(ctx.chat!.id, 'typing');
    const text = await generateDailyHoroscope(user, new Date());
    await ctx.reply(text, { parse_mode: 'Markdown' });
  });
}
