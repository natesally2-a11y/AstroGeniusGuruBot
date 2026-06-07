import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface InitData {
  query_id?: string;
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  start_param?: string;
}

/**
 * Validates Telegram Mini App initData using HMAC-SHA256
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateInitData(initDataRaw: string, botToken: string): InitData | null {
  try {
    const params = new URLSearchParams(initDataRaw);
    const hash = params.get('hash');
    if (!hash) return null;

    params.delete('hash');

    // Sort params alphabetically and create data check string
    const checkString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key: HMAC-SHA256 of bot token using "WebAppData" as key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Compute HMAC-SHA256 of data check string using secret key
    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex');

    if (computedHash !== hash) return null;

    // Check auth_date is not too old (5 minutes)
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 300) return null;

    const result: InitData = {
      auth_date: authDate,
      hash,
    };

    const queryId = params.get('query_id');
    if (queryId) result.query_id = queryId;

    const startParam = params.get('start_param');
    if (startParam) result.start_param = startParam;

    const userStr = params.get('user');
    if (userStr) {
      result.user = JSON.parse(userStr) as TelegramUser;
    }

    return result;
  } catch {
    return null;
  }
}

export function parseInitData(initDataRaw: string): InitData | null {
  try {
    const params = new URLSearchParams(initDataRaw);
    const hash = params.get('hash');
    if (!hash) return null;

    const result: InitData = {
      auth_date: parseInt(params.get('auth_date') || '0', 10),
      hash,
    };

    const userStr = params.get('user');
    if (userStr) result.user = JSON.parse(userStr) as TelegramUser;

    return result;
  } catch {
    return null;
  }
}
