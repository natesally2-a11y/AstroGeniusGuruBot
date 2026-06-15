/** Telegram promo channel configuration (BotFather / channel admin). */

export const BOT_USERNAME = (process.env.BOT_USERNAME || 'AstroGeniusGuruBot').replace(/^@/, '');

export const BOT_LINK = `https://t.me/${BOT_USERNAME}`;

export const BOT_START_CHANNEL = `${BOT_LINK}?start=channel`;

export const PROMO_CHANNEL_ID = process.env.PROMO_CHANNEL_ID?.trim() || '';

export const PROMO_CHANNEL_USERNAME = (process.env.PROMO_CHANNEL_USERNAME || 'AstroGuruChannel')
  .replace(/^@/, '');

export const CHANNEL_LINK = `https://t.me/${PROMO_CHANNEL_USERNAME}`;

export function isChannelPostingEnabled(): boolean {
  return process.env.CHANNEL_POST_ENABLED !== 'false' && Boolean(PROMO_CHANNEL_ID);
}

export function getChannelChatId(): string | number {
  const raw = PROMO_CHANNEL_ID;
  if (/^-?\d+$/.test(raw)) return parseInt(raw, 10);
  return raw;
}
