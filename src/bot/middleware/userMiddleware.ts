import { Context, NextFunction } from 'grammy';
import { getUserByTelegramId, createUser } from '../../database/queries';
import { ensureLifetimePremium } from '../../config/vip';
import { isLanguagePending } from '../../i18n';
import { sendLanguagePicker } from '../helpers/languagePicker';
import { logger } from '../../utils/logger';

function getMessageText(ctx: Context): string {
  return ctx.message?.text?.trim() || '';
}

function isStartCommand(ctx: Context): boolean {
  const text = getMessageText(ctx);
  if (!text.startsWith('/')) return false;
  const cmd = text.split(/\s+/)[0].slice(1).split('@')[0].toLowerCase();
  return cmd === 'start';
}

function isLanguageCommand(ctx: Context): boolean {
  const text = getMessageText(ctx);
  if (!text.startsWith('/')) return false;
  const cmd = text.split(/\s+/)[0].slice(1).split('@')[0].toLowerCase();
  return cmd === 'language';
}

function isSetLangCallback(ctx: Context): boolean {
  return Boolean(ctx.callbackQuery?.data?.startsWith('set_lang:'));
}

export async function userMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  if (!ctx.from) {
    await next();
    return;
  }

  let isNewUser = false;

  try {
    let user = getUserByTelegramId(ctx.from.id);
    if (!user) {
      user = createUser({
        telegram_id: ctx.from.id,
        first_name: ctx.from.first_name,
        last_name: ctx.from.last_name,
        username: ctx.from.username,
      });
      isNewUser = true;
      logger.info(`New user registered: ${ctx.from.id} (@${ctx.from.username})`);
    }

    ensureLifetimePremium(user);
  } catch (error) {
    logger.error('User middleware error', { error, userId: ctx.from.id });
  }

  const user = getUserByTelegramId(ctx.from.id);
  if (user && isLanguagePending(user.language_code)) {
    if (isSetLangCallback(ctx) || isLanguageCommand(ctx)) {
      await next();
      return;
    }

    try {
      await sendLanguagePicker(ctx, ctx.from.language_code);
      if (isNewUser) logger.info(`Language picker sent to new user ${ctx.from.id}`);
    } catch (error) {
      logger.error('Language picker failed', { error, userId: ctx.from.id });
    }
    return;
  }

  if (isNewUser && isStartCommand(ctx)) return;

  await next();
}
