/** One in-flight AI forecast per Telegram user (prevents double taps and webhook retries). */
const activeByTelegramId = new Set<number>();

export function tryBeginForecastJob(telegramId: number): boolean {
  if (activeByTelegramId.has(telegramId)) return false;
  activeByTelegramId.add(telegramId);
  return true;
}

export function endForecastJob(telegramId: number): void {
  activeByTelegramId.delete(telegramId);
}

export async function withForecastJobLock(
  telegramId: number,
  fn: () => Promise<void>
): Promise<boolean> {
  if (!tryBeginForecastJob(telegramId)) return false;
  try {
    await fn();
  } finally {
    endForecastJob(telegramId);
  }
  return true;
}
