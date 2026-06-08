import { DateTime } from 'luxon';

export function localBirthToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezone = 'Europe/Moscow'
): { year: number; month: number; day: number; hour: number; minute: number } {
  const local = DateTime.fromObject(
    { year, month, day, hour, minute },
    { zone: timezone || 'Europe/Moscow' }
  );
  const utc = local.toUTC();
  return {
    year: utc.year,
    month: utc.month,
    day: utc.day,
    hour: utc.hour,
    minute: utc.minute,
  };
}

export function getLocalDateKey(timezone = 'Europe/Moscow'): string {
  return DateTime.now().setZone(timezone || 'Europe/Moscow').toISODate() || new Date().toISOString().split('T')[0];
}

export function isNineAmInTimezone(timezone = 'Europe/Moscow'): boolean {
  const now = DateTime.now().setZone(timezone || 'Europe/Moscow');
  return now.hour === 9;
}

export function getCurrentMonthKey(timezone = 'Europe/Moscow'): string {
  const now = DateTime.now().setZone(timezone || 'Europe/Moscow');
  return `${now.year}-${String(now.month).padStart(2, '0')}`;
}
