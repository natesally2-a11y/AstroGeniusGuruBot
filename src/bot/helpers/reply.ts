import { Context, InlineKeyboard } from 'grammy';
import { logger } from '../../utils/logger';
import { prepareTelegramText, sanitizeForTelegram } from './telegramText';

type ReplyOptions = {
  reply_markup?: InlineKeyboard;
};

function stripMarkdown(text: string): string {
  return sanitizeForTelegram(text)
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1');
}

export async function deliverHoroscopeMessage(
  ctx: Context,
  text: string,
  options: ReplyOptions = {}
): Promise<number> {
  const parts = prepareTelegramText(text);
  const first = parts[0];

  try {
    const msg = await ctx.reply(first, { parse_mode: 'Markdown', ...options });
    return msg.message_id;
  } catch (error) {
    logger.warn('Markdown deliver failed, sending plain text', { error, userId: ctx.from?.id });
    const msg = await ctx.reply(stripMarkdown(first), options);
    return msg.message_id;
  }
}

export async function replyMarkdownSafe(
  ctx: Context,
  text: string,
  options: ReplyOptions = {}
): Promise<void> {
  const parts = prepareTelegramText(text);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isLast = i === parts.length - 1;
    const opts = isLast ? options : {};
    try {
      await ctx.reply(part, { parse_mode: 'Markdown', ...opts });
    } catch (error) {
      logger.warn('Markdown reply failed, sending plain text', { error, userId: ctx.from?.id });
      await ctx.reply(stripMarkdown(part), opts);
    }
  }
}

export async function editMarkdownSafe(
  ctx: Context,
  messageId: number,
  text: string,
  options: ReplyOptions = {}
): Promise<void> {
  const parts = prepareTelegramText(text);
  const first = parts[0];

  try {
    await ctx.api.editMessageText(ctx.chat!.id, messageId, first, {
      parse_mode: 'Markdown',
      ...options,
    });
    return;
  } catch (error) {
    logger.warn('Markdown edit failed, trying plain text', { error, userId: ctx.from?.id });
  }

  try {
    await ctx.api.editMessageText(ctx.chat!.id, messageId, stripMarkdown(first), options);
    return;
  } catch (editErr) {
    logger.warn('Plain edit failed, sending new message', { editErr });
  }

  await replyMarkdownSafe(ctx, text, options);
}
