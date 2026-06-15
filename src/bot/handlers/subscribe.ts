import { Bot } from 'grammy';
import { getUserByTelegramId } from '../../database/queries';
import {
  sendSubscriptionInvoice, sendNatalChartInvoice,
  isSubscriptionActive, SUBSCRIPTION_PRICE,
} from '../../payments/stars';
import { isAdmin } from '../../config/admin';
import { formatLocalizedDate, tUser } from '../../i18n';
import { logger } from '../../utils/logger';

import {
  agreePayKeyboard, confirmSubscribeKeyboard, subscribeActiveKeyboard, subscribeOfferKeyboard,
} from '../helpers/keyboards';

export function registerSubscribeHandler(bot: Bot): void {
  bot.command('subscribe', async (ctx) => {
    const telegramId = ctx.from!.id;
    const user = getUserByTelegramId(telegramId);
    logger.info(`/subscribe from ${telegramId}`);

    if (!user) {
      await ctx.reply(tUser(user, 'common.start_short'));
      return;
    }

    if (isSubscriptionActive(user)) {
      const expiresDate = isAdmin(user)
        ? tUser(user, 'subscribe.admin_lifetime')
        : user.subscription_expires
          ? formatLocalizedDate(user, user.subscription_expires)
          : tUser(user, 'settings.lifetime');

      const renewText = user.auto_renew !== 0 && !isAdmin(user)
        ? tUser(user, 'subscribe.auto_on', { price: String(SUBSCRIPTION_PRICE) })
        : tUser(user, 'subscribe.auto_off');

      const keyboard = subscribeActiveKeyboard(
        user,
        !isAdmin(user) && user.auto_renew !== 0,
        !isAdmin(user)
      );

      await ctx.reply(
        `${tUser(user, 'subscribe.active_title')}\n\n` +
        `${tUser(user, 'subscribe.active_until', { date: expiresDate })}\n` +
        `${renewText}\n\n` +
        `${tUser(user, 'subscribe.active_features')}\n\n` +
        tUser(user, 'subscribe.active_cancel_note'),
        { parse_mode: 'Markdown', reply_markup: keyboard }
      );
      return;
    }

    await ctx.reply(
      `${tUser(user, 'subscribe.offer_title', { price: String(SUBSCRIPTION_PRICE) })}\n\n` +
      `${tUser(user, 'subscribe.offer_features')}\n\n` +
      tUser(user, 'subscribe.terms'),
      {
        parse_mode: 'Markdown',
        reply_markup: subscribeOfferKeyboard(user),
      }
    );
  });

  bot.callbackQuery('confirm_subscribe', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    await ctx.reply(tUser(user, 'subscribe.terms'), {
      parse_mode: 'Markdown',
      reply_markup: agreePayKeyboard(user),
    });
  });

  bot.callbackQuery('agree_subscribe_pay', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    if (!user) { await ctx.reply(tUser(user, 'common.start_short')); return; }
    try {
      await sendSubscriptionInvoice(bot, ctx.chat!.id, user.id, false, user);
      await ctx.reply(
        tUser(user, 'subscribe.invoice_sent', { price: String(SUBSCRIPTION_PRICE) }),
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      logger.error('Invoice error', { error });
      await ctx.reply(tUser(user, 'subscribe.invoice_error'));
    }
  });

  bot.callbackQuery('cancel_subscribe_flow', async (ctx) => {
    const user = getUserByTelegramId(ctx.from.id);
    await ctx.answerCallbackQuery({ text: tUser(user, 'subscribe.flow_cancelled') }).catch(() => {});
  });

  bot.callbackQuery('cancel_auto_renew', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    if (!user || !isSubscriptionActive(user)) {
      await ctx.reply(tUser(user, 'subscribe.no_active'));
      return;
    }
    const { cancelSubscription } = await import('../../payments/stars');
    cancelSubscription(ctx.from.id);
    const exp = user.subscription_expires
      ? formatLocalizedDate(user, user.subscription_expires)
      : '—';
    await ctx.reply(
      tUser(user, 'subscribe.cancel_auto_ok', { date: exp }),
      { parse_mode: 'Markdown' }
    );
  });

  bot.command('buy_chart', async (ctx) => {
    const user = getUserByTelegramId(ctx.from!.id);
    if (!user) { await ctx.reply(tUser(user, 'common.start_short')); return; }
    if (!user.birth_date) {
      await ctx.reply(tUser(user, 'settings.birth_required'));
      return;
    }
    await sendNatalChartInvoice(bot, ctx.chat!.id, user.id, user);
  });

  bot.callbackQuery('buy_natal_chart', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    if (!user?.birth_date) {
      await ctx.reply(tUser(user, 'settings.birth_required'));
      return;
    }
    await sendNatalChartInvoice(bot, ctx.chat!.id, user.id, user);
  });

  bot.callbackQuery('subscribe_info', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    if (user && isSubscriptionActive(user)) {
      await ctx.reply(tUser(user, 'subscribe.already_premium_short'));
      return;
    }
    await ctx.reply(
      `${tUser(user, 'subscribe.info_title', { price: String(SUBSCRIPTION_PRICE) })}\n\n` + tUser(user, 'subscribe.terms'),
      {
        parse_mode: 'Markdown',
        reply_markup: confirmSubscribeKeyboard(user),
      }
    );
  });

  bot.callbackQuery('stars_info', async (ctx) => {
    const user = getUserByTelegramId(ctx.from.id);
    await ctx.answerCallbackQuery({
      text: tUser(user, 'subscribe.stars_info'),
      show_alert: true,
    }).catch(() => {});
  });
}
