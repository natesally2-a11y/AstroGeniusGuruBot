import { Context, InlineKeyboard } from 'grammy';
import { getUserByTelegramId, User } from '../../database/queries';
import { getUserLang, t, getGuideText } from '../../i18n';
import { MINI_APP_URL } from '../../config/urls';
import { CHANNEL_LINK } from '../../config/channel';

function mainKeyboard(lang: ReturnType<typeof getUserLang>): InlineKeyboard {
  return new InlineKeyboard()
    .webApp(t(lang, 'btn.open_app'), MINI_APP_URL).row()
    .text(t(lang, 'btn.horoscope'), 'horoscope_today').text(t(lang, 'btn.moon'), 'moon_phase').row()
    .text(t(lang, 'btn.premium'), 'subscribe_info').text(t(lang, 'btn.lucky'), 'lucky_day').row()
    .text(t(lang, 'btn.natal'), 'natal_chart').text(t(lang, 'btn.compat'), 'compatibility').row()
    .text(t(lang, 'btn.commands'), 'show_commands').text(t(lang, 'btn.settings'), 'settings_menu');
}

export async function sendWelcomeMessages(
  ctx: Context,
  existingUser?: User,
  referralSource?: string | null,
): Promise<void> {
  const telegramId = ctx.from!.id;
  const firstName = ctx.from!.first_name;
  const user = existingUser || getUserByTelegramId(telegramId);
  const lang = getUserLang(user);
  const fromChannel = referralSource === 'channel';

  const channelNote = fromChannel
    ? `\n\n📢 Спасибо, что пришли из канала AstroGuru!`
    : '';

  if (!user?.birth_date) {
    const kb = new InlineKeyboard()
      .text(t(lang, 'btn.birth_date'), 'edit_birth_date').row()
      .webApp(t(lang, 'btn.open_app'), MINI_APP_URL).row();
    if (fromChannel) kb.url('📢 Наш канал', CHANNEL_LINK).row();
    kb.text(t(lang, 'btn.commands'), 'show_commands');

    await ctx.reply(
      `${t(lang, 'welcome.new', { name: firstName })}${channelNote}\n\n${t(lang, 'welcome.new_hint')}`,
      { parse_mode: 'Markdown', reply_markup: kb }
    );
    await ctx.reply(getGuideText(lang), { parse_mode: 'Markdown' });
  } else {
    await ctx.reply(
      `${t(lang, 'welcome.return', { name: firstName })}${channelNote}`,
      { parse_mode: 'Markdown', reply_markup: mainKeyboard(lang) }
    );
    await ctx.reply(getGuideText(lang), { parse_mode: 'Markdown' });
  }
}
