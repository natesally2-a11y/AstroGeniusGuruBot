import { Bot, InlineKeyboard } from 'grammy';
import { getUserByTelegramId } from '../../database/queries';
import {
  sendSubscriptionInvoice, sendNatalChartInvoice,
  isSubscriptionActive, SUBSCRIPTION_PRICE, NATAL_CHART_PRICE,
} from '../../payments/stars';
import { isAdmin } from '../../config/admin';
import { SUBSCRIPTION_TERMS } from '../helpers/messages';
import { logger } from '../../utils/logger';

const MINI_APP_URL = process.env.MINI_APP_URL || 'https://astroguru-production.up.railway.app/app';

export function registerSubscribeHandler(bot: Bot): void {
  bot.command('subscribe', async (ctx) => {
    const telegramId = ctx.from!.id;
    const user = getUserByTelegramId(telegramId);
    logger.info(`/subscribe from ${telegramId}`);

    if (!user) {
      await ctx.reply('❗ Начните с /start');
      return;
    }

    if (isSubscriptionActive(user)) {
      const expiresDate = isAdmin(user)
        ? 'бессрочно (админ)'
        : user.subscription_expires
          ? new Date(user.subscription_expires).toLocaleDateString('ru-RU', {
              day: 'numeric', month: 'long', year: 'numeric',
            })
          : 'бессрочно';

      const renewText = user.auto_renew !== 0 && !isAdmin(user)
        ? `🔄 Автопродление: *включено* (${SUBSCRIPTION_PRICE} ⭐/мес)`
        : '⏸ Автопродление: *отключено*';

      const keyboard = new InlineKeyboard()
        .webApp('🌟 Открыть Mini App', MINI_APP_URL).row();

      if (!isAdmin(user) && user.auto_renew !== 0) {
        keyboard.text('❌ Отменить автопродление', 'cancel_auto_renew');
      }
      if (!isAdmin(user)) {
        keyboard.row().text('🔄 Продлить вручную', 'confirm_subscribe');
      }

      await ctx.reply(
        `✅ *У вас уже есть Premium!*\n\n` +
        `📅 Действует до: *${expiresDate}*\n` +
        `${renewText}\n\n` +
        `💎 *Ваши возможности:*\n` +
        `• Персональный AI-гороскоп\n` +
        `• Натальная карта с домами и аспектами\n` +
        `• Транзиты, недельный и месячный прогноз\n\n` +
        `_Отмена: подписка останется до конца оплаченного периода, новые списания прекратятся._`,
        { parse_mode: 'Markdown', reply_markup: keyboard }
      );
      return;
    }

    await ctx.reply(
      `⭐ *AstroGuru Premium — ${SUBSCRIPTION_PRICE} ⭐/мес*\n\n` +
      `💎 *В подписке:*\n` +
      `✅ Персональный AI-гороскоп по натальной карте\n` +
      `✅ Натальная карта: дома, аспекты, интерпретация\n` +
      `✅ Транзиты, недельный и месячный прогноз\n` +
      `✅ Утренние уведомления в 9:00\n\n` +
      SUBSCRIPTION_TERMS,
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard()
          .text('✅ Согласен, оформить', 'confirm_subscribe').row()
          .text(`🌌 Карта разово — ${NATAL_CHART_PRICE} ⭐`, 'buy_natal_chart').row()
          .text('❓ Telegram Stars', 'stars_info'),
      }
    );
  });

  bot.callbackQuery('confirm_subscribe', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    await ctx.reply(SUBSCRIPTION_TERMS, {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard()
        .text(`✅ Согласен — оплатить ${SUBSCRIPTION_PRICE} ⭐`, 'agree_subscribe_pay')
        .row()
        .text('❌ Отмена', 'cancel_subscribe_flow'),
    });
  });

  bot.callbackQuery('agree_subscribe_pay', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    if (!user) { await ctx.reply('❗ /start'); return; }
    try {
      await sendSubscriptionInvoice(bot, ctx.chat!.id, user.id);
      await ctx.reply(
        `💳 Счёт на *${SUBSCRIPTION_PRICE} ⭐/мес* отправлен выше.\n\n` +
        `После оплаты подписка продлевается автоматически. Отменить: /cancel`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      logger.error('Invoice error', { error });
      await ctx.reply('❌ Не удалось создать счёт. Попробуйте позже.');
    }
  });

  bot.callbackQuery('cancel_subscribe_flow', async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Оформление отменено' }).catch(() => {});
  });

  bot.callbackQuery('cancel_auto_renew', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    if (!user || !isSubscriptionActive(user)) {
      await ctx.reply('Активная подписка не найдена.');
      return;
    }
    const { cancelSubscription } = await import('../../payments/stars');
    cancelSubscription(ctx.from.id);
    const exp = user.subscription_expires
      ? new Date(user.subscription_expires).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
      : '—';
    await ctx.reply(
      `✅ *Автопродление отключено*\n\n` +
      `Premium останется активным до: *${exp}*\n` +
      `Новые списания производиться не будут.\n\n` +
      `Возобновить: /subscribe`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.command('buy_chart', async (ctx) => {
    const user = getUserByTelegramId(ctx.from!.id);
    if (!user) { await ctx.reply('❗ /start'); return; }
    if (!user.birth_date) {
      await ctx.reply('📅 Сначала укажите дату рождения: /settings');
      return;
    }
    await sendNatalChartInvoice(bot, ctx.chat!.id, user.id);
  });

  bot.callbackQuery('buy_natal_chart', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    if (!user?.birth_date) {
      await ctx.reply('📅 Укажите дату рождения: /settings');
      return;
    }
    await sendNatalChartInvoice(bot, ctx.chat!.id, user.id);
  });

  bot.callbackQuery('subscribe_info', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const user = getUserByTelegramId(ctx.from.id);
    if (user && isSubscriptionActive(user)) {
      await ctx.reply(`✅ У вас уже есть Premium! Подробности: /subscribe`);
      return;
    }
    await ctx.reply(
      `⭐ Premium — ${SUBSCRIPTION_PRICE} ⭐/мес\n\n` + SUBSCRIPTION_TERMS,
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard()
          .text('✅ Согласен, оформить', 'confirm_subscribe'),
      }
    );
  });

  bot.callbackQuery('stars_info', async (ctx) => {
    await ctx.answerCallbackQuery({
      text: 'Telegram Stars — официальная валюта Telegram. Купить можно в настройках Telegram.',
      show_alert: true,
    }).catch(() => {});
  });
}
