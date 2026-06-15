import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

const dbPath = process.env.DATABASE_PATH ||
  (process.env.NODE_ENV === 'production' ? '/app/data/astroguru.db' : './data/astroguru.db');

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
    `ALTER TABLE users ADD COLUMN last_renewal_notice TEXT`,
    `ALTER TABLE users ADD COLUMN referral_source TEXT`,
    `CREATE TABLE IF NOT EXISTS ai_generations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      kind TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE INDEX IF NOT EXISTS idx_ai_generations_user_created ON ai_generations(user_id, created_at)`,
  ];
  for (const sql of migrations) {
    try { db.exec(sql); } catch { /* column exists */ }
  }

  importLegacyDatabaseIfEmpty();

  logger.info('Database initialized successfully');
}

/** Recover users from pre-volume DB path after Railway migration */
function importLegacyDatabaseIfEmpty(): void {
  const withBirth = db.prepare(
    'SELECT COUNT(*) as c FROM users WHERE birth_date IS NOT NULL AND birth_date != \'\''
  ).get() as { c: number };
  if (withBirth.c > 0) return;

  const legacyPaths = [
    path.resolve(process.cwd(), 'data', 'astroguru.db'),
    path.resolve('/app', 'data', 'astroguru-legacy.db'),
  ];

  const currentResolved = path.resolve(dbPath);
  for (const legacyPath of legacyPaths) {
    if (!fs.existsSync(legacyPath) || path.resolve(legacyPath) === currentResolved) continue;
    try {
      db.exec(`ATTACH DATABASE '${legacyPath.replace(/'/g, "''")}' AS legacy`);
      const legacyCount = db.prepare(
        'SELECT COUNT(*) as c FROM legacy.users WHERE birth_date IS NOT NULL'
      ).get() as { c: number };
      if (legacyCount.c === 0) {
        db.exec('DETACH DATABASE legacy');
        continue;
      }
      db.exec(`
        INSERT OR IGNORE INTO users (
          telegram_id, first_name, last_name, username, birth_date, birth_time,
          birth_city, birth_lat, birth_lon, timezone, subscription_status,
          subscription_expires, language_code, daily_horoscope_enabled,
          auto_renew, natal_chart_unlocked, natal_chart_unlocked_until, created_at, updated_at
        )
        SELECT
          telegram_id, first_name, last_name, username, birth_date, birth_time,
          birth_city, birth_lat, birth_lon, timezone, subscription_status,
          subscription_expires, language_code, daily_horoscope_enabled,
          auto_renew, natal_chart_unlocked, natal_chart_unlocked_until, created_at, updated_at
        FROM legacy.users
      `);
      db.exec('DETACH DATABASE legacy');
      logger.info(`Imported users from legacy database: ${legacyPath}`);
      return;
    } catch (error) {
      try { db.exec('DETACH DATABASE legacy'); } catch { /* ignore */ }
      logger.warn(`Legacy DB import failed for ${legacyPath}`, { error });
    }
  }
}
