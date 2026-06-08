import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

const dbPath = process.env.DATABASE_PATH || './data/astroguru.db';

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase(): void {
  logger.info('Initializing database...');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id INTEGER UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT,
      username TEXT,
      birth_date TEXT,
      birth_time TEXT,
      birth_city TEXT,
      birth_lat REAL,
      birth_lon REAL,
      timezone TEXT DEFAULT 'UTC',
      subscription_status TEXT DEFAULT 'free' CHECK(subscription_status IN ('free', 'premium')),
      subscription_expires TEXT,
      language_code TEXT DEFAULT 'ru',
      daily_horoscope_enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS horoscopes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      type TEXT DEFAULT 'daily' CHECK(type IN ('daily', 'weekly', 'monthly')),
      content TEXT NOT NULL,
      planet_positions TEXT,
      sent_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      telegram_payment_charge_id TEXT UNIQUE,
      provider_payment_charge_id TEXT,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'XTR',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
      subscription_days INTEGER DEFAULT 30,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS natal_charts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      sun_sign TEXT,
      moon_sign TEXT,
      rising_sign TEXT,
      sun_degree REAL,
      moon_degree REAL,
      rising_degree REAL,
      mercury_sign TEXT,
      venus_sign TEXT,
      mars_sign TEXT,
      jupiter_sign TEXT,
      saturn_sign TEXT,
      uranus_sign TEXT,
      neptune_sign TEXT,
      pluto_sign TEXT,
      chart_data TEXT,
      calculated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chart_interpretations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      month_key TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, month_key)
    );

    CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
    CREATE INDEX IF NOT EXISTS idx_horoscopes_user_date ON horoscopes(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
  `);

  // Migrations for existing databases
  const migrations = [
    `ALTER TABLE users ADD COLUMN auto_renew INTEGER DEFAULT 1`,
    `ALTER TABLE users ADD COLUMN natal_chart_unlocked INTEGER DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN natal_chart_unlocked_until TEXT`,
    `ALTER TABLE payments ADD COLUMN payment_type TEXT DEFAULT 'subscription'`,
  ];
  for (const sql of migrations) {
    try { db.exec(sql); } catch { /* column exists */ }
  }

  logger.info('Database initialized successfully');
}
