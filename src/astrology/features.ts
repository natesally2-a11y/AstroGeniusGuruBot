import { toJulianDay, calculateMoonPosition, ZODIAC_SIGNS, ZODIAC_EMOJI } from './engine';

const MOON_PHASES = [
  { name: 'Новолуние', emoji: '🌑', range: [0, 45] },
  { name: 'Растущий серп', emoji: '🌒', range: [45, 90] },
  { name: 'Первая четверть', emoji: '🌓', range: [90, 135] },
  { name: 'Растущая луна', emoji: '🌔', range: [135, 180] },
  { name: 'Полнолуние', emoji: '🌕', range: [180, 225] },
  { name: 'Убывающая луна', emoji: '🌖', range: [225, 270] },
  { name: 'Последняя четверть', emoji: '🌗', range: [270, 315] },
  { name: 'Убывающий серп', emoji: '🌘', range: [315, 360] },
];

const LUCKY_COLORS = [
  'фиолетовый', 'золотой', 'изумрудный', 'сапфировый',
  'алый', 'бирюзовый', 'янтарный', 'серебряный',
];

export function getMoonPhase(date = new Date()) {
  const jd = toJulianDay(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes()
  );
  const moon = calculateMoonPosition(jd);
  const sunLon = (jd - 2451545) * 0.9856 % 360;
  const moonLon = moon.longitude;
  let phaseAngle = moonLon - sunLon;
  if (phaseAngle < 0) phaseAngle += 360;

  const phase = MOON_PHASES.find(p => phaseAngle >= p.range[0] && phaseAngle < p.range[1]) || MOON_PHASES[0];
  const illumination = Math.round((1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2 * 100);

  return {
    phase: phase.name,
    emoji: phase.emoji,
    sign: moon.sign,
    signEmoji: ZODIAC_EMOJI[moon.signIndex],
    illumination,
    advice: getMoonAdvice(phase.name, moon.sign),
  };
}

function getMoonAdvice(phase: string, sign: string): string {
  const map: Record<string, string> = {
    'Новолуние': 'Время загадывать намерения и начинать новые циклы.',
    'Растущий серп': 'Энергия нарастает — планируйте и готовьтесь к действиям.',
    'Первая четверть': 'Преодолевайте препятствия, проявляйте решительность.',
    'Растущая луна': 'Благоприятный период для роста и развития проектов.',
    'Полнолуние': 'Эмоции на пике — завершайте дела и осознавайте результаты.',
    'Убывающая луна': 'Время анализа, благодарности и отпускания лишнего.',
    'Последняя четверть': 'Подведите итоги, избавьтесь от того, что мешает.',
    'Убывающий серп': 'Отдых и восстановление важнее активных действий.',
  };
  return `${map[phase] || 'Следуйте интуиции.'} Луна в ${sign} усиливает соответствующие темы этого знака.`;
}

export function getLuckyDay(signIndex: number, date = new Date()) {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate() + signIndex * 7;
  const numbers = [
    (seed % 9) + 1,
    ((seed * 3) % 20) + 10,
    ((seed * 7) % 30) + 20,
  ];
  const color = LUCKY_COLORS[seed % LUCKY_COLORS.length];
  const hours = ['утро', 'день', 'вечер'][seed % 3];

  return {
    sign: ZODIAC_SIGNS[signIndex],
    numbers: [...new Set(numbers)].sort((a, b) => a - b),
    color,
    bestTime: hours,
    stone: ['аметист', 'гранат', 'лазурит', 'янтарь', 'лунный камень'][seed % 5],
  };
}
