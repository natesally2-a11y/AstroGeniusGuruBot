import { getUserByTelegramId, createUser, User } from '../database/queries';
import { PENDING_LANGUAGE, getUserLang, t, TranslationKey } from '../i18n';
import { db } from '../database/setup';
import { TelegramUser } from '../utils/initData';
import { ensureLifetimePremium } from '../config/vip';

export function userHasBirthData(user: User | undefined): boolean {
  return Boolean(user?.birth_date?.trim());
}

export function resolveWebAppUser(tgUser: TelegramUser): User {
  let user = getUserByTelegramId(tgUser.id);

  if (!user) {
    user = createUser({
      telegram_id: tgUser.id,
      first_name: tgUser.first_name,
      last_name: tgUser.last_name,
      username: tgUser.username,
      language_code: PENDING_LANGUAGE,
    });
    ensureLifetimePremium(user);
    return getUserByTelegramId(tgUser.id) as User;
  }

  db.prepare(`
    UPDATE users SET
      first_name = @first_name,
      last_name = @last_name,
      username = @username,
      updated_at = datetime('now')
    WHERE telegram_id = @telegram_id
  `).run({
    first_name: tgUser.first_name,
    last_name: tgUser.last_name || null,
    username: tgUser.username || null,
    telegram_id: tgUser.id,
  });

  const updated = getUserByTelegramId(tgUser.id) as User;
  ensureLifetimePremium(updated);
  return getUserByTelegramId(tgUser.id) as User;
}

export function localizedError(user: User | null | undefined, key: TranslationKey): string {
  return t(getUserLang(user), key);
}
