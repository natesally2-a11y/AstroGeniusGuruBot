import { db } from './setup';

export interface User {
  id: number;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  birth_date?: string;
  birth_time?: string;
  birth_city?: string;
  birth_lat?: number;
  birth_lon?: number;
  timezone: string;
  subscription_status: 'free' | 'premium';
  subscription_expires?: string;
  language_code: string;
  daily_horoscope_enabled: number;
  auto_renew?: number;
  natal_chart_unlocked?: number;
  natal_chart_unlocked_until?: string;
  created_at: string;
  updated_at: string;
}

export interface Horoscope {
  id: number;
  user_id: number;
  date: string;
  type: 'daily' | 'weekly' | 'monthly';
  content: string;
  planet_positions?: string;
  sent_at?: string;
  created_at: string;
}

export interface Payment {
  id: number;
  user_id: number;
  telegram_payment_charge_id?: string;
  provider_payment_charge_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  subscription_days: number;
  payment_type?: string;
  created_at: string;
}

export interface NatalChart {
  id: number;
  user_id: number;
  sun_sign: string;
  moon_sign: string;
  rising_sign: string;
  sun_degree: number;
  moon_degree: number;
  rising_degree: number;
  mercury_sign: string;
  venus_sign: string;
  mars_sign: string;
  jupiter_sign: string;
  saturn_sign: string;
  uranus_sign: string;
  neptune_sign: string;
  pluto_sign: string;
  chart_data: string;
  calculated_at: string;
}

// ─── User Queries ────────────────────────────────────────────────────────────

export function getUserByTelegramId(telegramId: number): User | undefined {
  return db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId) as User | undefined;
}

export function getUserById(id: number): User | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function createUser(data: {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}): User {
  const stmt = db.prepare(`
    INSERT INTO users (telegram_id, first_name, last_name, username, language_code)
    VALUES (@telegram_id, @first_name, @last_name, @username, @language_code)
  `);
  stmt.run(data);
  return getUserByTelegramId(data.telegram_id) as User;
}

export function updateUserBirthData(telegramId: number, data: {
  birth_date: string;
  birth_time?: string;
  birth_city?: string;
  birth_lat?: number;
  birth_lon?: number;
  timezone?: string;
}): void {
  db.prepare(`
    UPDATE users SET
      birth_date = @birth_date,
      birth_time = @birth_time,
      birth_city = @birth_city,
      birth_lat = @birth_lat,
      birth_lon = @birth_lon,
      timezone = COALESCE(@timezone, timezone),
      updated_at = datetime('now')
    WHERE telegram_id = @telegram_id
  `).run({ ...data, telegram_id: telegramId });
}

export function updateSubscription(telegramId: number, status: 'free' | 'premium', expiresAt?: string): void {
  db.prepare(`
    UPDATE users SET
      subscription_status = @status,
      subscription_expires = @expires,
      updated_at = datetime('now')
    WHERE telegram_id = @telegram_id
  `).run({ status, expires: expiresAt || null, telegram_id: telegramId });
}

export function setAutoRenew(telegramId: number, autoRenew: boolean): void {
  db.prepare(`
    UPDATE users SET auto_renew = @autoRenew, updated_at = datetime('now')
    WHERE telegram_id = @telegram_id
  `).run({ autoRenew: autoRenew ? 1 : 0, telegram_id: telegramId });
}

export function unlockNatalChart(telegramId: number, until?: string): void {
  db.prepare(`
    UPDATE users SET
      natal_chart_unlocked = 1,
      natal_chart_unlocked_until = @until,
      updated_at = datetime('now')
    WHERE telegram_id = @telegram_id
  `).run({ until: until || null, telegram_id: telegramId });
}

export function downgradeExpiredSubscriptions(adminTelegramIds: number[] = []): number {
  // Only downgrade when user explicitly cancelled (auto_renew = 0).
  // NULL = legacy subscriber, keep status until they cancel manually.
  // Never touch lifetime premium (subscription_expires IS NULL) or admins.
  if (adminTelegramIds.length > 0) {
    const placeholders = adminTelegramIds.map(() => '?').join(',');
    const result = db.prepare(`
      UPDATE users SET subscription_status = 'free'
      WHERE subscription_status = 'premium'
      AND subscription_expires IS NOT NULL
      AND subscription_expires <= datetime('now')
      AND auto_renew = 0
      AND telegram_id NOT IN (${placeholders})
    `).run(...adminTelegramIds);
    return result.changes;
  }
  const result = db.prepare(`
    UPDATE users SET subscription_status = 'free'
    WHERE subscription_status = 'premium'
    AND subscription_expires IS NOT NULL
    AND subscription_expires <= datetime('now')
    AND auto_renew = 0
  `).run();
  return result.changes;
}

/** Fix legacy premium users after migrations — set auto_renew=1 if still active */
export function migrateLegacyPremiumUsers(): number {
  const result = db.prepare(`
    UPDATE users SET auto_renew = 1
    WHERE subscription_status = 'premium'
    AND auto_renew IS NULL
    AND (subscription_expires IS NULL OR subscription_expires > datetime('now'))
  `).run();
  return result.changes;
}

export function getAllActiveSubscribers(): User[] {
  return db.prepare(`
    SELECT * FROM users
    WHERE subscription_status = 'premium'
    AND (subscription_expires IS NULL OR subscription_expires > datetime('now'))
    AND daily_horoscope_enabled = 1
    AND birth_date IS NOT NULL
  `).all() as User[];
}

export function getAllUsersWithBirthData(): User[] {
  return db.prepare(`
    SELECT * FROM users
    WHERE birth_date IS NOT NULL
    AND daily_horoscope_enabled = 1
  `).all() as User[];
}

export function getUsersForDailyHoroscope(hour: number): User[] {
  return db.prepare(`
    SELECT * FROM users
    WHERE daily_horoscope_enabled = 1
    AND birth_date IS NOT NULL
  `).all() as User[];
}

// ─── Horoscope Queries ────────────────────────────────────────────────────────

export function getHoroscope(userId: number, date: string, type: string = 'daily'): Horoscope | undefined {
  return db.prepare(`
    SELECT * FROM horoscopes WHERE user_id = ? AND date = ? AND type = ?
  `).get(userId, date, type) as Horoscope | undefined;
}

export function saveHoroscope(data: {
  user_id: number;
  date: string;
  type?: string;
  content: string;
  planet_positions?: string;
}): void {
  db.prepare(`
    INSERT OR REPLACE INTO horoscopes (user_id, date, type, content, planet_positions)
    VALUES (@user_id, @date, @type, @content, @planet_positions)
  `).run({
    type: 'daily',
    planet_positions: null,
    ...data,
  });
}

export function markHoroscopeSent(userId: number, date: string): void {
  db.prepare(`
    UPDATE horoscopes SET sent_at = datetime('now')
    WHERE user_id = ? AND date = ?
  `).run(userId, date);
}

// ─── Payment Queries ──────────────────────────────────────────────────────────

export function createPayment(data: {
  user_id: number;
  amount: number;
  subscription_days?: number;
  payment_type?: string;
}): number {
  const result = db.prepare(`
    INSERT INTO payments (user_id, amount, subscription_days, payment_type)
    VALUES (@user_id, @amount, @subscription_days, @payment_type)
  `).run({ subscription_days: 30, payment_type: 'subscription', ...data });
  return result.lastInsertRowid as number;
}

export function getChartInterpretation(userId: number, monthKey: string): { content: string } | undefined {
  return db.prepare(`
    SELECT content FROM chart_interpretations WHERE user_id = ? AND month_key = ?
  `).get(userId, monthKey) as { content: string } | undefined;
}

export function saveChartInterpretation(userId: number, monthKey: string, content: string): void {
  db.prepare(`
    INSERT OR REPLACE INTO chart_interpretations (user_id, month_key, content)
    VALUES (@userId, @monthKey, @content)
  `).run({ userId, monthKey, content });
}

export function getLastPaymentChargeId(userId: number): string | undefined {
  const row = db.prepare(`
    SELECT telegram_payment_charge_id FROM payments
    WHERE user_id = ? AND status = 'completed' AND telegram_payment_charge_id IS NOT NULL
    ORDER BY created_at DESC LIMIT 1
  `).get(userId) as { telegram_payment_charge_id: string } | undefined;
  return row?.telegram_payment_charge_id;
}

export function completePayment(paymentId: number, chargeId: string, providerChargeId?: string): void {
  db.prepare(`
    UPDATE payments SET
      status = 'completed',
      telegram_payment_charge_id = @chargeId,
      provider_payment_charge_id = @providerChargeId
    WHERE id = @id
  `).run({ id: paymentId, chargeId, providerChargeId: providerChargeId || null });
}

export function getPaymentHistory(userId: number): Payment[] {
  return db.prepare(`
    SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 10
  `).all(userId) as Payment[];
}

// ─── Natal Chart Queries ──────────────────────────────────────────────────────

export function getNatalChart(userId: number): NatalChart | undefined {
  return db.prepare('SELECT * FROM natal_charts WHERE user_id = ?').get(userId) as NatalChart | undefined;
}

export function saveNatalChart(data: Omit<NatalChart, 'id' | 'calculated_at'>): void {
  db.prepare(`
    INSERT OR REPLACE INTO natal_charts (
      user_id, sun_sign, moon_sign, rising_sign,
      sun_degree, moon_degree, rising_degree,
      mercury_sign, venus_sign, mars_sign,
      jupiter_sign, saturn_sign, uranus_sign, neptune_sign, pluto_sign,
      chart_data
    ) VALUES (
      @user_id, @sun_sign, @moon_sign, @rising_sign,
      @sun_degree, @moon_degree, @rising_degree,
      @mercury_sign, @venus_sign, @mars_sign,
      @jupiter_sign, @saturn_sign, @uranus_sign, @neptune_sign, @pluto_sign,
      @chart_data
    )
  `).run(data);
}
