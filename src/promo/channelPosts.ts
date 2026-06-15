import { InlineKeyboard } from 'grammy';
import { DateTime } from 'luxon';
import { ZODIAC_SIGNS, ZODIAC_EMOJI, ZodiacSign } from '../astrology/engine';
import { getMoonPhase } from '../astrology/features';
import { getSignTheme, getWeeklyAreas } from '../i18n/horoscopeContent';
import { BOT_LINK, BOT_START_CHANNEL, CHANNEL_LINK } from '../config/channel';
import { MINI_APP_URL } from '../config/urls';

const MSK = 'Europe/Moscow';

function todayMsk(): DateTime {
  return DateTime.now().setZone(MSK);
}

function formatDateRu(dt: DateTime): string {
  return dt.setLocale('ru').toFormat('d MMMM yyyy, EEEE');
}

export function channelBotKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .url('🌟 Открыть AstroGuru', BOT_START_CHANNEL)
    .row()
    .url('📱 Mini App', MINI_APP_URL);
}

export function channelSubscribeKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .url('✨ Подписаться на канал', CHANNEL_LINK)
    .row()
    .url('🤖 Запустить бота', BOT_START_CHANNEL);
}

/** Compact daily horoscope for all 12 signs + moon + CTA */
export function buildDailyHoroscopePost(): string {
  const dt = todayMsk();
  const parts = { year: dt.year, month: dt.month, day: dt.day };
  const dateStr = formatDateRu(dt);
  const moon = getMoonPhase(dt.toJSDate());
  const seed = parts.day + parts.month * 31;

  let body = `🌙 *АстроGuru — гороскоп на ${dateStr}*\n\n`;
  body += `${moon.emoji} *${moon.phase}* · Луна в ${moon.sign} (${moon.illumination}%)\n`;
  body += `_${moon.advice}_\n\n`;
  body += `✨ *Краткий прогноз по знакам:*\n\n`;

  for (let i = 0; i < ZODIAC_SIGNS.length; i++) {
    const sign = ZODIAC_SIGNS[i] as ZodiacSign;
    const emoji = ZODIAC_EMOJI[i];
    const theme = getSignTheme('ru', sign, seed + i * 7);
    const short = theme.split(/[.!]/)[0]?.trim() || theme.slice(0, 90);
    body += `${emoji} *${sign}* — ${short}.\n`;
  }

  body += `\n━━━━━━━━━━━━━━\n`;
  body += `🔮 *Персональный гороскоп* — с учётом вашей даты, времени и города рождения.\n`;
  body += `👉 Бесплатный старт в боте: ${BOT_LINK}\n`;
  body += `\n_Информационно-развлекательный контент._`;

  return body;
}

/** Featured sign deep-dive (rotates daily) */
export function buildSignSpotlightPost(): string {
  const dt = todayMsk();
  const parts = { year: dt.year, month: dt.month, day: dt.day };
  const dateStr = formatDateRu(dt);
  const signIndex = parts.day % 12;
  const sign = ZODIAC_SIGNS[signIndex] as ZodiacSign;
  const emoji = ZODIAC_EMOJI[signIndex];
  const theme = getSignTheme('ru', sign, parts.day + parts.month * 31);
  const areas = getWeeklyAreas('ru');
  const forecasts = areas.slice(0, 3).map((area, i) => {
    const line = getSignTheme('ru', sign, parts.day + i * 11);
    return `• ${area}: ${line.split(/[.!]/)[0]}.`;
  }).join('\n');
  const moon = getMoonPhase(dt.toJSDate());

  return `⭐ *Знак дня: ${sign}* ${emoji}
📅 ${dateStr}

${theme}

📊 *Фокус недели:*
${forecasts}

${moon.emoji} Сегодня ${moon.phase.toLowerCase()} — ${moon.advice.split('.')[0]}.

🤖 *Хотите точнее?*
В боте AstroGuru рассчитаем *вашу* натальную карту и транзиты — не только знак Солнца.

👇 Запуск: ${BOT_START_CHANNEL}`;
}

/** Moon phase standalone post */
export function buildMoonPost(): string {
  const dt = todayMsk();
  const moon = getMoonPhase(dt.toJSDate());
  const dateStr = formatDateRu(dt);

  return `🌙 *Лунный календарь AstroGuru*
📅 ${dateStr}

${moon.emoji} *${moon.phase}*
Луна в ${moon.sign} ${moon.signEmoji} · освещённость ${moon.illumination}%

${moon.advice}

🔮 В боте — ежедневные уведомления с фазой Луны и персональным прогнозом:
${BOT_LINK}`;
}

/** Weekly overview post (Sundays) */
export function buildWeeklyPost(): string {
  const dt = todayMsk();
  const dateStr = formatDateRu(dt);
  const parts = { year: dt.year, month: dt.month, day: dt.day };

  let body = `📆 *Неделя в AstroGuru*
${dateStr}

Краткий обзор по знакам:\n\n`;

  for (let i = 0; i < ZODIAC_SIGNS.length; i++) {
    const sign = ZODIAC_SIGNS[i] as ZodiacSign;
    const emoji = ZODIAC_EMOJI[i];
    const line = getSignTheme('ru', sign, parts.day + i * 5);
    body += `${emoji} *${sign}*: ${line.split(/[.!]/)[0]}.\n`;
  }

  body += `\n✨ *Premium в боте:* персональный прогноз по вашей карте + Mini App с натальной картой и совместимостью.\n`;
  body += `👉 ${BOT_START_CHANNEL}`;

  return body;
}

/** Pinned welcome / channel intro */
export function buildWelcomePinnedPost(): string {
  return `✨ *Добро пожаловать в AstroGuru!*

Это официальный канал ИИ-астрologa в Telegram.

*Здесь каждый день:*
🌅 гороскоп на день по всем 12 знакам
🌙 фазы Луны и астрологические советы
⭐ разбор знака дня и недельные тренды

*В боте @AstroGeniusGuruBot — больше:*
🔮 персональный гороскоп по дате рождения
🪐 натальная карта с ИИ-интерпретацией
💫 совместимость знаков
📱 удобное Mini App

👇 Начните бесплатно:
${BOT_START_CHANNEL}

📢 Поделитесь каналом с друзьями — ${CHANNEL_LINK}

_Контент носит информационно-развлекательный характер._`;
}

/** Promo / feature highlight */
export function buildPromoPost(): string {
  return `🚀 *AstroGuru — ваш ИИ-астrolog в кармане*

Что умеет бот:
• 📅 Гороскоп на сегодня / неделю / месяц
• 🪐 Натальная карта + персональный разбор
• 💑 Совместимость партнёров
• 🌙 Лунные фазы и транзиты
• 🍀 Счастливые числа и камни дня

*Бесплатный старт* — укажите дату рождения и получите первый прогноз за минуту.

👉 ${BOT_START_CHANNEL}
📱 Mini App: ${MINI_APP_URL}`;
}

export type ChannelPostType = 'daily' | 'spotlight' | 'moon' | 'weekly' | 'promo' | 'welcome';

export function buildChannelPost(type: ChannelPostType): string {
  switch (type) {
    case 'daily': return buildDailyHoroscopePost();
    case 'spotlight': return buildSignSpotlightPost();
    case 'moon': return buildMoonPost();
    case 'weekly': return buildWeeklyPost();
    case 'promo': return buildPromoPost();
    case 'welcome': return buildWelcomePinnedPost();
  }
}

export function getChannelPostKeyboard(type: ChannelPostType): InlineKeyboard {
  if (type === 'welcome') return channelSubscribeKeyboard();
  return channelBotKeyboard();
}

export function getTodayPostDateKey(type: ChannelPostType): string {
  const dt = todayMsk().toFormat('yyyy-MM-dd');
  return `${type}#${dt}`;
}
