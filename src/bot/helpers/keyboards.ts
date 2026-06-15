import { InlineKeyboard } from 'grammy';
import { User } from '../../database/queries';
import { getUserLang, LangCode, t } from '../../i18n';
import { MINI_APP_URL } from '../../config/urls';
import { NATAL_CHART_PRICE, SUBSCRIPTION_PRICE } from '../../payments/stars';

type LangUser = Pick<User, 'language_code'> | null | undefined;

function L(user?: LangUser): LangCode {
  return getUserLang(user ?? undefined);
}

export function horoscopeFollowUpKeyboardForLang(lang: LangCode, isPremium: boolean): InlineKeyboard {
  const kb = new InlineKeyboard();
  if (!isPremium) kb.text(t(lang, 'btn.get_premium'), 'subscribe_info').row();
  return kb
    .webApp(t(lang, 'btn.open_mini_app'), MINI_APP_URL).row()
    .text(t(lang, 'btn.weekly'), 'weekly_horoscope')
    .text(t(lang, 'btn.moon_phase'), 'moon_phase');
}

export function horoscopeFollowUpKeyboard(user: LangUser, isPremium: boolean): InlineKeyboard {
  return horoscopeFollowUpKeyboardForLang(L(user), isPremium);
}

export function settingsMenuKeyboard(user: LangUser): InlineKeyboard {
  const lang = L(user);
  return new InlineKeyboard()
    .text(t(lang, 'btn.change_date'), 'edit_birth_date').row()
    .text(t(lang, 'btn.change_time'), 'edit_birth_time').row()
    .text(t(lang, 'btn.change_city'), 'edit_birth_city').row()
    .text(t(lang, 'btn.recalculate'), 'recalculate_chart');
}

export function birthSavedKeyboard(user: LangUser): InlineKeyboard {
  const lang = L(user);
  return new InlineKeyboard()
    .text(t(lang, 'btn.get_horoscope'), 'horoscope_today').row()
    .text(t(lang, 'btn.subscribe_premium'), 'subscribe_info');
}

export function skipCityKeyboard(user: LangUser): InlineKeyboard {
  return new InlineKeyboard().text(t(L(user), 'btn.skip_city'), 'skip_birth_city');
}

export function skipTimeKeyboard(user: LangUser): InlineKeyboard {
  return new InlineKeyboard().text(t(L(user), 'btn.skip'), 'skip_birth_time');
}

export function skipCityOnlyKeyboard(user: LangUser): InlineKeyboard {
  return new InlineKeyboard().text(t(L(user), 'btn.skip'), 'skip_birth_city');
}

export function subscribeActiveKeyboard(user: LangUser, showCancel: boolean, showRenew: boolean): InlineKeyboard {
  const lang = L(user);
  const kb = new InlineKeyboard().webApp(t(lang, 'btn.open_mini_app'), MINI_APP_URL).row();
  if (showCancel) kb.text(t(lang, 'btn.cancel_auto_renew'), 'cancel_auto_renew');
  if (showRenew) kb.row().text(t(lang, 'btn.renew_manual'), 'confirm_subscribe');
  return kb;
}

export function subscribeOfferKeyboard(user: LangUser): InlineKeyboard {
  const lang = L(user);
  return new InlineKeyboard()
    .text(t(lang, 'btn.agree_subscribe'), 'confirm_subscribe').row()
    .text(t(lang, 'btn.buy_chart_once', { price: String(NATAL_CHART_PRICE) }), 'buy_natal_chart').row()
    .text(t(lang, 'btn.stars_info'), 'stars_info');
}

export function agreePayKeyboard(user: LangUser): InlineKeyboard {
  const lang = L(user);
  return new InlineKeyboard()
    .text(t(lang, 'btn.agree_pay', { price: String(SUBSCRIPTION_PRICE) }), 'agree_subscribe_pay')
    .row()
    .text(t(lang, 'btn.cancel_flow'), 'cancel_subscribe_flow');
}

export function confirmSubscribeKeyboard(user: LangUser): InlineKeyboard {
  return new InlineKeyboard().text(t(L(user), 'btn.agree_subscribe'), 'confirm_subscribe');
}

export function paymentPremiumKeyboard(user: LangUser): InlineKeyboard {
  const lang = L(user);
  return new InlineKeyboard()
    .text(t(lang, 'btn.get_horoscope'), 'horoscope_today').row()
    .webApp(t(lang, 'btn.open_mini_app'), MINI_APP_URL);
}

export function paymentChartKeyboard(user: LangUser): InlineKeyboard {
  return new InlineKeyboard().webApp(t(L(user), 'btn.open_mini_app'), MINI_APP_URL);
}

export function weeklyHoroscopeKeyboard(user: LangUser): InlineKeyboard {
  return new InlineKeyboard().webApp(t(L(user), 'btn.more_in_app'), MINI_APP_URL);
}

export function birthDatePromptKeyboard(user: LangUser): InlineKeyboard {
  return new InlineKeyboard().text(t(L(user), 'btn.birth_date'), 'edit_birth_date');
}

export function enterDateKeyboard(user: LangUser): InlineKeyboard {
  return new InlineKeyboard().text(t(L(user), 'btn.enter_date_short'), 'edit_birth_date');
}

export function openChartKeyboard(user: LangUser): InlineKeyboard {
  return new InlineKeyboard().webApp(t(L(user), 'btn.open_chart'), MINI_APP_URL);
}

export function compatAppKeyboard(user: LangUser): InlineKeyboard {
  return new InlineKeyboard().webApp(t(L(user), 'btn.compat'), MINI_APP_URL);
}

export function premiumGateKeyboard(user: LangUser): InlineKeyboard {
  return new InlineKeyboard().text(t(L(user), 'btn.subscribe_premium'), 'confirm_subscribe');
}

export function morningNotifyKeyboard(user: LangUser): InlineKeyboard {
  return morningNotifyKeyboardForLang(L(user));
}

export function morningNotifyKeyboardForLang(lang: LangCode): InlineKeyboard {
  return new InlineKeyboard()
    .webApp(t(lang, 'btn.open_mini_app'), MINI_APP_URL).row()
    .text(t(lang, 'btn.weekly'), 'weekly_horoscope')
    .text(t(lang, 'btn.moon_phase'), 'moon_phase').row()
    .text(t(lang, 'btn.premium'), 'subscribe_info');
}
