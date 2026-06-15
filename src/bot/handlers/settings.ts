import { Bot, Context } from 'grammy';
import {
  getUserByTelegramId, patchUserBirthData, saveNatalChart, getNatalChart, User,
} from '../../database/queries';
import { calculateNatalChartForUser, ZODIAC_EMOJI, ZODIAC_SIGNS } from '../../astrology/engine';
import {
  birthSavedKeyboard, settingsMenuKeyboard, skipCityKeyboard, skipCityOnlyKeyboard, skipTimeKeyboard,
} from '../helpers/keyboards';
import { DATE_LOCALES, LangCode, resolveUserLang, t, TranslationKey } from '../../i18n';
import { translateSign } from '../../i18n/astro';
import { logger } from '../../utils/logger';

const DATE_LOCALE: Record<LangCode, string> = DATE_LOCALES;

// Shared in-memory state for multi-step conversations
export const userStates = new Map<number, { step: string; data: Record<string, string> }>();

function userLang(ctx: Context, user?: User | null): LangCode {
  return resolveUserLang(user, ctx.from?.language_code);
}

function msg(ctx: Context, user: User | null | undefined, key: TranslationKey, params?: Record<string, string>): string {
  return t(userLang(ctx, user ?? undefined), key, params);
}

function formatDate(ctx: Context, user: User | null | undefined, iso?: string): string {
  if (!iso) return msg(ctx, user, 'settings.lifetime');
  const lang = userLang(ctx, user);
  return new Date(iso).toLocaleDateString(DATE_LOCALE[lang] || 'en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function registerSettingsHandler(bot: Bot): void {

  bot.command('settings', async (ctx) => {
    await showSettings(ctx);
  });

  bot.callbackQuery('edit_birth_date', async (ctx) => {
    await ctx.answerCallbackQuery();
    const user = getUserByTelegramId(ctx.from.id);
    userStates.set(ctx.from.id, { step: 'birth_date', data: {} });
    await ctx.reply(msg(ctx, user, 'birth.enter_date'), { parse_mode: 'Markdown' });
  });

  bot.callbackQuery('edit_birth_time', async (ctx) => {
    await ctx.answerCallbackQuery();
    const user = getUserByTelegramId(ctx.from.id);
    userStates.set(ctx.from.id, { step: 'birth_time', data: {} });
    await ctx.reply(msg(ctx, user, 'birth.enter_time'), { parse_mode: 'Markdown' });
  });

  bot.callbackQuery('edit_birth_city', async (ctx) => {
    await ctx.answerCallbackQuery();
    const user = getUserByTelegramId(ctx.from.id);
    userStates.set(ctx.from.id, { step: 'birth_city', data: {} });
    await ctx.reply(msg(ctx, user, 'birth.enter_city'), { parse_mode: 'Markdown' });
  });

  bot.callbackQuery('recalculate_chart', async (ctx) => {
    await ctx.answerCallbackQuery();
    const user = getUserByTelegramId(ctx.from.id);
    if (!user?.birth_date) {
      await ctx.reply(msg(ctx, user, 'birth.need_date_first'));
      return;
    }
    await ctx.api.sendChatAction(ctx.chat!.id, 'typing');
    await recalculateAndSaveChart(user.id, user);
    await ctx.reply(msg(ctx, user, 'birth.recalculated'));
  });

  bot.callbackQuery('skip_birth_time', async (ctx) => {
    await ctx.answerCallbackQuery();
    const telegramId = ctx.from.id;
    const state = userStates.get(telegramId);
    const user = getUserByTelegramId(telegramId);
    if (state?.data.birth_date) {
      patchUserBirthData(telegramId, { birth_date: state.data.birth_date });
      userStates.set(telegramId, { step: 'birth_city_prompt', data: state.data });
      await ctx.reply(msg(ctx, user, 'birth.city_prompt'), {
        parse_mode: 'Markdown',
        reply_markup: skipCityKeyboard(user),
      });
    }
  });

  bot.callbackQuery('skip_birth_city', async (ctx) => {
    await ctx.answerCallbackQuery();
    const telegramId = ctx.from.id;
    const state = userStates.get(telegramId);
    if (!state?.data.birth_date) return;

    patchUserBirthData(telegramId, {
      birth_date: state.data.birth_date,
      birth_time: state.data.birth_time,
    });

    const user = getUserByTelegramId(telegramId);
    if (user) await recalculateAndSaveChart(user.id, user);
    userStates.delete(telegramId);
    await showBirthDataSaved(ctx, telegramId, state.data);
  });

  bot.on('message:text', async (ctx, next) => {
    const telegramId = ctx.from!.id;
    const state = userStates.get(telegramId);

    if (!state) {
      await next();
      return;
    }

    const user = getUserByTelegramId(telegramId);
    const text = ctx.message.text.trim();

    if (state.step === 'birth_date') {
      if (!isValidDate(text)) {
        await ctx.reply(msg(ctx, user, 'birth.invalid_date'), { parse_mode: 'Markdown' });
        return;
      }
      patchUserBirthData(telegramId, { birth_date: text });
      userStates.set(telegramId, { step: 'birth_time_prompt', data: { birth_date: text } });
      await ctx.reply(msg(ctx, user, 'birth.date_ok', { date: text }), {
        parse_mode: 'Markdown',
        reply_markup: skipTimeKeyboard(user),
      });
      return;
    }

    if (state.step === 'birth_time_prompt' || state.step === 'birth_time') {
      if (!isValidTime(text)) {
        await ctx.reply(msg(ctx, user, 'birth.invalid_time'), { parse_mode: 'Markdown' });
        return;
      }

      const newData = { ...state.data, birth_time: text };

      if (state.data.birth_date) {
        patchUserBirthData(telegramId, { birth_date: state.data.birth_date, birth_time: text });
        userStates.set(telegramId, { step: 'birth_city_prompt', data: newData });
        await ctx.reply(msg(ctx, user, 'birth.time_ok', { time: text }), {
          parse_mode: 'Markdown',
          reply_markup: skipCityOnlyKeyboard(user),
        });
      } else {
        const u = getUserByTelegramId(telegramId);
        if (u?.birth_date) {
          patchUserBirthData(telegramId, { birth_time: text });
          await recalculateAndSaveChart(u.id, getUserByTelegramId(telegramId)!);
        }
        userStates.delete(telegramId);
        await ctx.reply(msg(ctx, user, 'birth.time_updated'));
      }
      return;
    }

    if (state.step === 'birth_city_prompt' || state.step === 'birth_city') {
      const coords = getCityCoordinates(text);
      const birthDate = state.data.birth_date || user?.birth_date || '';

      patchUserBirthData(telegramId, {
        birth_date: birthDate,
        birth_time: state.data.birth_time,
        birth_city: text,
        birth_lat: coords.lat,
        birth_lon: coords.lon,
        timezone: coords.timezone,
      });

      const u = getUserByTelegramId(telegramId);
      if (u) await recalculateAndSaveChart(u.id, u);
      userStates.delete(telegramId);
      await showBirthDataSaved(ctx, telegramId, state.data, text);
      return;
    }

    await next();
  });
}

async function showSettings(ctx: Context): Promise<void> {
  const telegramId = ctx.from!.id;
  const user = getUserByTelegramId(telegramId);
  logger.info(`/settings from ${telegramId}`);

  if (!user) {
    await ctx.reply(msg(ctx, null, 'common.start_first'));
    return;
  }

  const notSet = msg(ctx, user, 'birth.not_set');
  const notSetCity = msg(ctx, user, 'birth.not_set_city');

  const birthInfo = user.birth_date
    ? msg(ctx, user, 'settings.line_date', { value: user.birth_date }) + '\n' +
      msg(ctx, user, 'settings.line_time', { value: user.birth_time || notSet }) + '\n' +
      msg(ctx, user, 'settings.line_city', { value: user.birth_city || notSetCity })
    : msg(ctx, user, 'settings.no_birth');

  const subStatus = user.subscription_status === 'premium'
    ? msg(ctx, user, 'settings.sub_premium', {
        date: user.subscription_expires
          ? formatDate(ctx, user, user.subscription_expires)
          : msg(ctx, user, 'settings.lifetime'),
      })
    : msg(ctx, user, 'settings.sub_free');

  await ctx.reply(
    `${msg(ctx, user, 'settings.page_title')}\n\n` +
    `👤 *${user.first_name}${user.last_name ? ' ' + user.last_name : ''}*\n\n` +
    `${birthInfo}\n\n` +
    msg(ctx, user, 'settings.sub_label', { status: subStatus }),
    {
      parse_mode: 'Markdown',
      reply_markup: settingsMenuKeyboard(user),
    }
  );
}

async function showBirthDataSaved(
  ctx: Context,
  telegramId: number,
  data: Record<string, string>,
  city?: string
): Promise<void> {
  const user = getUserByTelegramId(telegramId);
  const chart = user ? getNatalChart(user.id) : null;
  const lang = userLang(ctx, user);
  const notSet = msg(ctx, user, 'birth.not_set');
  const notSetCity = msg(ctx, user, 'birth.not_set_city');

  let chartBlock = '';
  if (chart) {
    const sunEmoji = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(chart.sun_sign as typeof ZODIAC_SIGNS[number])] || '☀️';
    const moonEmoji = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(chart.moon_sign as typeof ZODIAC_SIGNS[number])] || '🌙';
    const risingEmoji = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(chart.rising_sign as typeof ZODIAC_SIGNS[number])] || '↑';
    chartBlock =
      `${msg(ctx, user, 'birth.chart_header')}\n` +
      msg(ctx, user, 'birth.planet_sun', { emoji: sunEmoji, sign: translateSign(lang, chart.sun_sign) }) + '\n' +
      msg(ctx, user, 'birth.planet_moon', { emoji: moonEmoji, sign: translateSign(lang, chart.moon_sign) }) + '\n' +
      msg(ctx, user, 'birth.planet_rising', { emoji: risingEmoji, sign: translateSign(lang, chart.rising_sign) }) + '\n\n';
  }

  await ctx.reply(
    `${msg(ctx, user, 'birth.saved')}\n\n` +
    msg(ctx, user, 'birth.line_date', { value: data.birth_date }) + '\n' +
    msg(ctx, user, 'birth.line_time', { value: data.birth_time || notSet }) + '\n' +
    msg(ctx, user, 'birth.line_city', { value: city || notSetCity }) + '\n\n' +
    chartBlock +
    msg(ctx, user, 'birth.today_hint'),
    {
      parse_mode: 'Markdown',
      reply_markup: birthSavedKeyboard(user),
    }
  );
}

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
