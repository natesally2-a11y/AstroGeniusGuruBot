import { Context, MiddlewareFn } from 'grammy';
import { logger } from '../../utils/logger';

const seenUpdateIds = new Set<number>();
const MAX_TRACKED = 5000;

/** Skip duplicate webhook deliveries (Telegram retries the same update_id). */
export function updateDedupMiddleware(): MiddlewareFn<Context> {
  return async (ctx, next) => {
    const updateId = ctx.update.update_id;
    if (seenUpdateIds.has(updateId)) {
      logger.debug('Skipping duplicate update', { updateId, userId: ctx.from?.id });
      return;
    }
    seenUpdateIds.add(updateId);
    if (seenUpdateIds.size > MAX_TRACKED) {
      const oldest = seenUpdateIds.values().next().value;
      if (oldest !== undefined) seenUpdateIds.delete(oldest);
    }
    await next();
  };
}
