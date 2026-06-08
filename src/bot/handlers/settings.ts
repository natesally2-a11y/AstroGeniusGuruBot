import { Bot, InlineKeyboard } from 'grammy';
import { getUserByTelegramId, updateUserBirthData, saveNatalChart, getNatalChart } from '../../database/queries';
import { calculateNatalChartForUser, parseBirthDate, parseBirthTime, ZODIAC_EMOJI, ZODIAC_SIGNS } from '../../astrology/engine';
import { logger } from '../../utils/logger';

// Shared in-memory state for multi-step conversations
export const userStates = new Map<number, { step: string; data: Record<string, string> }>();

export function registerSettingsHandler(bot: Bot): void {

  bot.command('settings', async (ctx) => {
    await showSettings(ctx);
  });

  // Entry point used from /start button when no birth data yet
  bot.callbackQuery('edit_birth_date', async (ctx) => {
    await ctx.answerCallbackQuery();
    userStates.set(ctx.from.id, { step: 'birth_date', data: {} });
    await ctx.reply(
      '📅 *Введите дату рождения* в формате ДД.ММ.ГГГГ\n\nНапример: `15.06.1990`',
      { parse_mode: 'Markdown' }
    );
  });

  bot.callbackQuery('edit_birth_time', async (ctx) => {
    await ctx.answerCallbackQuery();
    userStates.set(ctx.from.id, { step: 'birth_time', data: {} });
    await ctx.reply(
      '🕐 *Введите время рождения* в формате ЧЧ:ММ\n\nНапример: `14:30`\n\n_Точное время нужно для расчёта асцендента_',
      { parse_mode: 'Markdown' }
    );
  });

  bot.callbackQuery('edit_birth_city', async (ctx) => {
    await ctx.answerCallbackQuery();
    userStates.set(ctx.from.id, { step: 'birth_city', data: {} });
    await ctx.reply(
      '🏙️ *Введите город рождения*\n\nНапример: `Москва` или `Moscow`',
      { parse_mode: 'Markdown' }
    );
  });

  bot.callbackQuery('recalculate_chart', async (ctx) => {
    await ctx.answerCallbackQuery();
    const user = getUserByTelegramId(ctx.from.id);
    if (!user?.birth_date) {
      await ctx.reply('❗ Сначала укажите дату рождения');
      return;
    }
    await ctx.api.sendChatAction(ctx.chat!.id, 'typing');
    await recalculateAndSaveChart(user.id, user);
    await ctx.reply('✅ Натальная карта пересчитана!');
  });

  bot.callbackQuery('skip_birth_time', async (ctx) => {
    await ctx.answerCallbackQuery();
    const telegramId = ctx.from.id;
    const state = userStates.get(telegramId);
    if (state?.data.birth_date) {
      userStates.set(telegramId, { step: 'birth_city_prompt', data: state.data });
      await ctx.reply(
        '🏙️ Укажите *город рождения* или нажмите "Пропустить"',
        {
          parse_mode: 'Markdown',
          reply_markup: new InlineKeyboard().text('⏭ Пропустить город', 'skip_birth_city'),
        }
      );
    }
  });

  bot.callbackQuery('skip_birth_city', async (ctx) => {
    await ctx.answerCallbackQuery();
    const telegramId = ctx.from.id;
    const state = userStates.get(telegramId);
    if (state?.data.birth_date) {
      // Standalone skip — save with existing birth_date
      const user = getUserByTelegramId(telegramId);
      if (user?.birth_date) {
        updateUserBirthData(telegramId, { birth_date: user.birth_date, birth_time: state.data.birth_time });
        await recalculateAndSaveChart(user.id, user);
      }
      userStates.delete(telegramId);
      await ctx.reply('✅ Данные сохранены! Получайте гороскоп командой /today ✨');
    }
  });

  // ─── Central text handler for multi-step conversation ────────────────────
  bot.on('message:text', async (ctx, next) => {
    const telegramId = ctx.from!.id;
    const state = userStates.get(telegramId);

    if (!state) {
      await next();
      return;
    }

    const text = ctx.message.text.trim();

    // ── Step 1: birth date ──────────────────────────────────────────────────
    if (state.step === 'birth_date') {
      if (!isValidDate(text)) {
        await ctx.reply(
          '❌ Неверный формат. Нужно ДД.ММ.ГГГГ\n\nНапример: `15.06.1990`',
          { parse_mode: 'Markdown' }
        );
        return;
      }
      userStates.set(telegramId, { step: 'birth_time_prompt', data: { birth_date: text } });
      await ctx.reply(
        `✅ Дата рождения: *${text}*\n\n🕐 Теперь введите *время рождения* (ЧЧ:ММ) или пропустите:`,
        {
          parse_mode: 'Markdown',
          reply_markup: new InlineKeyboard().text('⏭ Пропустить', 'skip_birth_time'),
        }
      );
      return;
    }

    // ── Step 2: birth time ──────────────────────────────────────────────────
    if (state.step === 'birth_time_prompt' || state.step === 'birth_time') {
      if (!isValidTime(text)) {
        await ctx.reply(
          '❌ Неверный формат. Нужно ЧЧ:ММ\n\nНапример: `14:30`',
          { parse_mode: 'Markdown' }
        );
        return;
      }

      const newData = { ...state.data, birth_time: text };

      if (state.data.birth_date) {
        // Came from full flow — ask city next
        userStates.set(telegramId, { step: 'birth_city_prompt', data: newData });
        await ctx.reply(
          `✅ Время: *${text}*\n\n🏙️ Введите *город рождения* или пропустите:`,
          {
            parse_mode: 'Markdown',
            reply_markup: new InlineKeyboard().text('⏭ Пропустить', 'skip_birth_city'),
          }
        );
      } else {
        // Standalone time edit
        const user = getUserByTelegramId(telegramId);
        if (user?.birth_date) {
          updateUserBirthData(telegramId, { birth_date: user.birth_date, birth_time: text });
        }
        userStates.delete(telegramId);
        await ctx.reply('✅ Время рождения обновлено!');
      }
      return;
    }

    // ── Step 3: city ────────────────────────────────────────────────────────
    if (state.step === 'birth_city_prompt' || state.step === 'birth_city') {
      const coords = getCityCoordinates(text);
      const birthDate = state.data.birth_date || getUserByTelegramId(telegramId)?.birth_date || '';

      updateUserBirthData(telegramId, {
        birth_date: birthDate,
        birth_time: state.data.birth_time,
        birth_city: text,
        birth_lat: coords.lat,
        birth_lon: coords.lon,
        timezone: coords.timezone,
      });

      const user = getUserByTelegramId(telegramId);
      if (user) await recalculateAndSaveChart(user.id, user);
      userStates.delete(telegramId);
      await showBirthDataSaved(ctx, telegramId, state.data, text);
      return;
    }

    await next();
  });
}

// ─── /settings display ────────────────────────────────────────────────────────

async function showSettings(ctx: any): Promise<void> {
  const telegramId = ctx.from!.id;
  const user = getUserByTelegramId(telegramId);
  logger.info(`/settings from ${telegramId}`);

  if (!user) {
    await ctx.reply('❗ Пожалуйста, начните с команды /start');
    return;
  }

  const birthInfo = user.birth_date
    ? `📅 Дата рождения: *${user.birth_date}*\n` +
      `🕐 Время: *${user.birth_time || 'не указано'}*\n` +
      `🏙️ Город: *${user.birth_city || 'не указан'}*`
    : '❌ Данные о рождении не указаны';

  const subStatus = user.subscription_status === 'premium'
    ? `⭐ *Premium* (до ${user.subscription_expires
        ? new Date(user.subscription_expires).toLocaleDateString('ru-RU')
        : 'бессрочно'})`
    : '🆓 Бесплатный';

  await ctx.reply(
    `⚙️ *Настройки AstroGuru*\n\n` +
    `👤 *${user.first_name}${user.last_name ? ' ' + user.last_name : ''}*\n\n` +
    `${birthInfo}\n\n` +
    `💎 Подписка: ${subStatus}`,
    {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard()
        .text('📅 Изменить дату рождения', 'edit_birth_date').row()
        .text('🕐 Изменить время', 'edit_birth_time').row()
        .text('🏙️ Изменить город', 'edit_birth_city').row()
        .text('🔮 Пересчитать натальную карту', 'recalculate_chart'),
    }
  );
}

// ─── Show confirmation after birth data saved ─────────────────────────────────

async function showBirthDataSaved(
  ctx: any,
  telegramId: number,
  data: Record<string, string>,
  city?: string
): Promise<void> {
  const user = getUserByTelegramId(telegramId);
  const chart = user ? getNatalChart(user.id) : null;

  const sunEmoji = chart ? ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(chart.sun_sign as any)] || '☀️' : '☀️';
  const moonEmoji = chart ? ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(chart.moon_sign as any)] || '🌙' : '🌙';
  const risingEmoji = chart ? ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(chart.rising_sign as any)] || '↑' : '↑';

  await ctx.reply(
    `🎉 *Данные сохранены!*\n\n` +
    `📅 Дата: *${data.birth_date}*\n` +
    `🕐 Время: *${data.birth_time || 'не указано'}*\n` +
    `🏙️ Город: *${city || 'не указан'}*\n\n` +
    (chart
      ? `🌟 *Ваша натальная карта:*\n` +
        `${sunEmoji} Солнце в *${chart.sun_sign}*\n` +
        `${moonEmoji} Луна в *${chart.moon_sign}*\n` +
        `${risingEmoji} Асцендент *${chart.rising_sign}*\n\n`
      : '') +
    `Теперь получайте гороскоп командой /today ✨`,
    {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard()
        .text('🔮 Получить гороскоп', 'horoscope_today').row()
        .text('⭐ Оформить Premium', 'subscribe_info'),
    }
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidDate(str: string): boolean {
  const match = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return false;
  const [, d, m, y] = match.map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d &&
    y >= 1900 &&
    y <= new Date().getFullYear()
  );
}

function isValidTime(str: string): boolean {
  return /^([01]?\d|2[0-3]):([0-5]\d)$/.test(str);
}

const CITIES: Record<string, { lat: number; lon: number; timezone: string }> = {
  'москва': { lat: 55.7558, lon: 37.6176, timezone: 'Europe/Moscow' },
  'moscow': { lat: 55.7558, lon: 37.6176, timezone: 'Europe/Moscow' },
  'мск': { lat: 55.7558, lon: 37.6176, timezone: 'Europe/Moscow' },
  'санкт-петербург': { lat: 59.9311, lon: 30.3609, timezone: 'Europe/Moscow' },
  'спб': { lat: 59.9311, lon: 30.3609, timezone: 'Europe/Moscow' },
  'saint petersburg': { lat: 59.9311, lon: 30.3609, timezone: 'Europe/Moscow' },
  'киев': { lat: 50.4501, lon: 30.5234, timezone: 'Europe/Kiev' },
  'kiev': { lat: 50.4501, lon: 30.5234, timezone: 'Europe/Kiev' },
  'минск': { lat: 53.9045, lon: 27.5615, timezone: 'Europe/Minsk' },
  'minsk': { lat: 53.9045, lon: 27.5615, timezone: 'Europe/Minsk' },
  'алматы': { lat: 43.2220, lon: 76.8512, timezone: 'Asia/Almaty' },
  'астана': { lat: 51.1801, lon: 71.4460, timezone: 'Asia/Almaty' },
  'ташкент': { lat: 41.2995, lon: 69.2401, timezone: 'Asia/Tashkent' },
  'баку': { lat: 40.4093, lon: 49.8671, timezone: 'Asia/Baku' },
  'тбилиси': { lat: 41.7151, lon: 44.8271, timezone: 'Asia/Tbilisi' },
  'ереван': { lat: 40.1872, lon: 44.5152, timezone: 'Asia/Yerevan' },
  'новосибирск': { lat: 54.9885, lon: 82.9207, timezone: 'Asia/Novosibirsk' },
  'екатеринбург': { lat: 56.8389, lon: 60.6057, timezone: 'Asia/Yekaterinburg' },
  'краснодар': { lat: 45.0355, lon: 38.9753, timezone: 'Europe/Moscow' },
  'new york': { lat: 40.7128, lon: -74.0060, timezone: 'America/New_York' },
  'london': { lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' },
  'berlin': { lat: 52.5200, lon: 13.4050, timezone: 'Europe/Berlin' },
  'paris': { lat: 48.8566, lon: 2.3522, timezone: 'Europe/Paris' },
  'istanbul': { lat: 41.0082, lon: 28.9784, timezone: 'Europe/Istanbul' },
  'dubai': { lat: 25.2048, lon: 55.2708, timezone: 'Asia/Dubai' },
};

function getCityCoordinates(city: string): { lat: number; lon: number; timezone: string } {
  const key = city.toLowerCase().trim();
  return CITIES[key] || { lat: 0, lon: 0, timezone: 'UTC' };
}

async function recalculateAndSaveChart(
  userId: number,
  user: { birth_date?: string; birth_time?: string; birth_lat?: number; birth_lon?: number; timezone?: string }
): Promise<void> {
  if (!user.birth_date) return;

  const lat = user.birth_lat || 0;
  const lon = user.birth_lon || 0;
  const tz = user.timezone || 'Europe/Moscow';

  const chart = calculateNatalChartForUser(user.birth_date, user.birth_time, lat, lon, tz);

  saveNatalChart({
    user_id: userId,
    sun_sign: chart.sun.sign,
    moon_sign: chart.moon.sign,
    rising_sign: chart.ascendant.sign,
    sun_degree: chart.sun.longitude,
    moon_degree: chart.moon.longitude,
    rising_degree: chart.ascendant.longitude,
    mercury_sign: chart.mercury.sign,
    venus_sign: chart.venus.sign,
    mars_sign: chart.mars.sign,
    jupiter_sign: chart.jupiter.sign,
    saturn_sign: chart.saturn.sign,
    uranus_sign: chart.uranus.sign,
    neptune_sign: chart.neptune.sign,
    pluto_sign: chart.pluto.sign,
    chart_data: JSON.stringify(chart),
  });
}
