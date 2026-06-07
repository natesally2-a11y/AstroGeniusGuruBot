import { Context, NextFunction } from 'grammy';
import { getUserByTelegramId, createUser } from '../../database/queries';
import { logger } from '../../utils/logger';

export async function userMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  if (!ctx.from) {
    await next();
    return;
  }

  try {
    let user = getUserByTelegramId(ctx.from.id);
    if (!user) {
      user = createUser({
        telegram_id: ctx.from.id,
        first_name: ctx.from.first_name,
        last_name: ctx.from.last_name,
        username: ctx.from.username,
        language_code: ctx.from.language_code || 'ru',
      });
      logger.info(`New user registered: ${ctx.from.id} (@${ctx.from.username})`);
    }
  } catch (error) {
    logger.error('User middleware error', { error, userId: ctx.from.id });
  }

  await next();
}
