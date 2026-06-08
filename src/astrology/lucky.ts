import { getLuckyDay } from './features';
import { parseBirthDate, toJulianDay, calculateSunPosition } from './engine';
import { User } from '../database/queries';

export function formatLuckyDayMessage(user?: User | null): string {
  let signIdx = 0;
  let signName = 'Овен';
  if (user?.birth_date) {
    const { year, month, day } = parseBirthDate(user.birth_date);
    const sun = calculateSunPosition(toJulianDay(year, month, day, 12, 0));
    signIdx = sun.signIndex;
    signName = sun.sign;
  }
  const lucky = getLuckyDay(signIdx);
  return (
    `🍀 *Счастливый день — ${lucky.sign}*\n\n` +
    `🔢 *Числа:* ${lucky.numbers.join(', ')}\n` +
    `🎨 *Цвет дня:* ${lucky.color}\n` +
    `💎 *Камень:* ${lucky.stone}\n` +
    `⏰ *Лучшее время:* ${lucky.bestTime}\n\n` +
    `_Используйте эти символы для важных дел сегодня._`
  );
}
