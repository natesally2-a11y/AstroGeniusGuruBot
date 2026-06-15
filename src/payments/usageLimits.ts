import { User } from '../database/queries';
import { countAiGenerationsSince, recordAiGeneration as dbRecordAiGeneration } from '../database/queries';
import { SUBSCRIPTION_PRICE, FREE_WEEKLY_AI_LIMIT } from '../config/pricing';
import { isSubscriptionActive } from './stars';
import { getUserLang, t } from '../i18n';

const ROLLING_DAYS = 7;
export { FREE_WEEKLY_AI_LIMIT };

export interface AiQuotaStatus {
  ok: boolean;
  used: number;
  limit: number;
  remaining: number;
  message?: string;
}

export function getAiQuotaStatus(user: Pick<User, 'id' | 'telegram_id' | 'username' | 'subscription_status' | 'subscription_expires'>): AiQuotaStatus {
  if (isSubscriptionActive(user as User)) {
    return { ok: true, used: 0, limit: -1, remaining: -1 };
  }
  const used = countAiGenerationsSince(user.id, ROLLING_DAYS);
  const limit = FREE_WEEKLY_AI_LIMIT;
  const remaining = Math.max(0, limit - used);
  return { ok: remaining > 0, used, limit, remaining };
}

export function checkAiQuota(user: User): AiQuotaStatus {
  const status = getAiQuotaStatus(user);
  if (status.ok) return status;

  const lang = getUserLang(user);
  return {
    ...status,
    message: t(lang, 'usage.limit_reached', {
      used: String(status.used),
      limit: String(status.limit),
      price: String(SUBSCRIPTION_PRICE),
    }),
  };
}

export function trackAiGeneration(user: User, kind: string): void {
  if (isSubscriptionActive(user)) return;
  dbRecordAiGeneration(user.id, kind);
}

export function appendFreeUsageFooter(user: User, text: string): string {
  if (isSubscriptionActive(user)) return text;
  const { remaining, limit } = getAiQuotaStatus(user);
  const lang = getUserLang(user);
  const footer = t(lang, 'usage.remaining', {
    remaining: String(remaining),
    limit: String(limit),
    price: String(SUBSCRIPTION_PRICE),
  });
  return `${text}\n\n${footer}`;
}
