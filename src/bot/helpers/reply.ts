import { Context, InlineKeyboard, Api } from 'grammy';
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

async function sendMarkdownParts(
  send: (part: string, opts: ReplyOptions) => Promise<void>,
  text: string,
  options: ReplyOptions = {}
): Promise<void> {
  const parts = prepareTelegramText(text);
  for (let i = 0; i < parts.length; i++) {
    const isLast = i === parts.length - 1;
    await send(parts[i], isLast ? options : {});
  }
}

export async function editMarkdownSafeApi(
  api: Api,
  chatId: number,
  messageId: number,
  text: string,
  options: ReplyOptions = {},
  userId?: number
): Promise<void> {
  const parts = prepareTelegramText(text);
  const first = parts[0];

  try {
    await api.editMessageText(chatId, messageId, first, {
      parse_mode: 'Markdown',
      ...options,
    });
  } catch (error) {
    logger.warn('Markdown edit failed, trying plain text', { error, userId });
    try {
      await api.editMessageText(chatId, messageId, stripMarkdown(first), options);
    } catch (editErr) {
      logger.warn('Plain edit failed, replacing loading message', { editErr, userId });
      await api.deleteMessage(chatId, messageId).catch(() => {});
      await sendMarkdownParts(
        (part, opts) => api.sendMessage(chatId, part, { parse_mode: 'Markdown', ...opts }).then(() => {}),
        text,
        options
      );
      return;
    }
  }

  for (let i = 1; i < parts.length; i++) {
    await api.sendMessage(chatId, parts[i], { parse_mode: 'Markdown' });
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
  await editMarkdownSafeApi(ctx.api, ctx.chat!.id, messageId, text, options, ctx.from?.id);
}
