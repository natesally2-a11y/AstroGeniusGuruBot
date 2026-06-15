import { Bot, Context } from 'grammy';
import { isAdminTelegramId } from '../../config/admin';
import {
  BOT_LINK, CHANNEL_LINK, isChannelPostingEnabled, PROMO_CHANNEL_ID, PROMO_CHANNEL_USERNAME,
} from '../../config/channel';
import { buildChannelPost, ChannelPostType } from '../../promo/channelPosts';
import { publishChannelPost } from '../../promo/channelPublisher';
import { logger } from '../../utils/logger';

const POST_TYPES: ChannelPostType[] = ['daily', 'spotlight', 'moon', 'weekly', 'promo', 'welcome'];

function adminOnly(ctx: Context): boolean {
  return isAdminTelegramId(ctx.from!.id);
}

export function registerChannelAdminHandler(bot: Bot): void {
  bot.command('channel_info', async (ctx) => {
    if (!adminOnly(ctx)) return;
    await ctx.reply(
      `📢 *Канал AstroGuru*\n\n` +
      `ID: \`${PROMO_CHANNEL_ID || 'не задан'}\`\n` +
      `Username: @${PROMO_CHANNEL_USERNAME}\n` +
      `Ссылка: ${CHANNEL_LINK}\n` +
      `Бот: ${BOT_LINK}\n` +
      `Автопостинг: ${isChannelPostingEnabled() ? '✅ включён' : '❌ выключен'}\n\n` +
      `Команды:\n` +
      `/channel\\_post daily — гороскоп на день\n` +
      `/channel\\_post spotlight — знак дня\n` +
      `/channel\\_post moon — луна\n` +
      `/channel\\_post weekly — неделя\n` +
      `/channel\\_post promo — промо бота\n` +
      `/channel\\_post welcome — приветственный пост\n` +
      `/channel\\_preview daily — превью без отправки`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.command('channel_preview', async (ctx) => {
    if (!adminOnly(ctx)) return;
    const type = (ctx.match?.trim() || 'daily') as ChannelPostType;
    if (!POST_TYPES.includes(type)) {
      await ctx.reply(`Типы: ${POST_TYPES.join(', ')}`);
      return;
    }
    const text = buildChannelPost(type);
    if (text.length > 4000) {
      await ctx.reply(text.slice(0, 4000), { parse_mode: 'Markdown' });
      await ctx.reply(text.slice(4000), { parse_mode: 'Markdown' });
    } else {
      await ctx.reply(text, { parse_mode: 'Markdown' });
    }
  });

  bot.command('channel_post', async (ctx) => {
    if (!adminOnly(ctx)) return;
    const type = (ctx.match?.trim() || 'daily') as ChannelPostType;
    if (!POST_TYPES.includes(type)) {
      await ctx.reply(`Укажите тип: ${POST_TYPES.join(', ')}`);
      return;
    }
    if (!isChannelPostingEnabled()) {
      await ctx.reply('❌ Задайте PROMO_CHANNEL_ID и CHANNEL_POST_ENABLED в .env');
      return;
    }
    await ctx.reply(`⏳ Публикую: *${type}*…`, { parse_mode: 'Markdown' });
    try {
      const messageId = await publishChannelPost(bot, type, { force: true });
      await ctx.reply(messageId ? `✅ Опубликовано (message_id: ${messageId})` : '⚠️ Не отправлено');
    } catch (error) {
      logger.error('channel_post command failed', { error });
      await ctx.reply(`❌ Ошибка: ${(error as Error).message}`);
    }
  });
}
