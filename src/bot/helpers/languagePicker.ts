import { Context, InlineKeyboard } from 'grammy';
import { SUPPORTED_LANGUAGES, LangCode, normalizeLangCode } from '../../i18n';
import { t } from '../../i18n';

export function buildLanguageKeyboard(suggested?: string): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  const suggest = suggested ? normalizeLangCode(suggested) : null;

  for (let i = 0; i < SUPPORTED_LANGUAGES.length; i += 2) {
    const a = SUPPORTED_LANGUAGES[i];
    const b = SUPPORTED_LANGUAGES[i + 1];
    const labelA = `${a.flag} ${a.label}${suggest === a.code ? ' ✓' : ''}`;
    keyboard.text(labelA, `set_lang:${a.code}`);
    if (b) {
      const labelB = `${b.flag} ${b.label}${suggest === b.code ? ' ✓' : ''}`;
      keyboard.text(labelB, `set_lang:${b.code}`);
    }
    keyboard.row();
  }
  return keyboard;
}

export async function sendLanguagePicker(ctx: Context, suggestedLang?: string): Promise<void> {
  const hint = normalizeLangCode(suggestedLang || 'en');
  await ctx.reply(
    `${t(hint, 'lang.choose_title')}\n\n${t(hint, 'lang.choose_subtitle')}`,
    { parse_mode: 'Markdown', reply_markup: buildLanguageKeyboard(suggestedLang) }
  );
}

export function parseLanguageCallback(data: string): LangCode | null {
  if (!data.startsWith('set_lang:')) return null;
  const code = data.slice('set_lang:'.length) as LangCode;
  return SUPPORTED_LANGUAGES.some(l => l.code === code) ? code : null;
}
