import { Bot } from 'grammy';
import { getUserByTelegramId, setUserLanguage } from '../../database/queries';
import { sendWelcomeMessages } from '../helpers/welcome';
import { sendLanguagePicker, parseLanguageCallback } from '../helpers/languagePicker';
import { getLanguageName, t } from '../../i18n';
import { logger } from '../../utils/logger';

export function registerLanguageHandler(bot: Bot): void {
  bot.command('language', async (ctx) => {
    const user = getUserByTelegramId(ctx.from!.id);
    await sendLanguagePicker(ctx, user?.language_code || ctx.from!.language_code);
  });

  bot.callbackQuery(/^set_lang:/, async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    const lang = parseLanguageCallback(ctx.callbackQuery.data);
    if (!lang) return;

    setUserLanguage(ctx.from.id, lang);
    logger.info(`Language set to ${lang} for ${ctx.from.id}`);

    const user = getUserByTelegramId(ctx.from.id);
    await ctx.reply(t(lang, 'lang.changed', { lang: getLanguageName(lang) }), { parse_mode: 'Markdown' });
    await sendWelcomeMessages(ctx, user || undefined);
    (ctx as typeof ctx & { welcomed?: boolean }).welcomed = true;
  });
}
