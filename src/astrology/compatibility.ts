import { ZodiacSign, ZODIAC_SIGNS, ZODIAC_EMOJI } from './engine';

// ─── Compatibility Matrix ─────────────────────────────────────────────────────
// Values: 0-100 compatibility percentage

const COMPATIBILITY_MATRIX: Record<string, Record<string, number>> = {
  'Овен':     { 'Овен':90,'Телец':50,'Близнецы':75,'Рак':55,'Лев':95,'Дева':40,'Весы':70,'Скорпион':55,'Стрелец':90,'Козерог':50,'Водолей':75,'Рыбы':55 },
  'Телец':    { 'Овен':50,'Телец':85,'Близнецы':45,'Рак':90,'Лев':60,'Дева':95,'Весы':65,'Скорпион':80,'Стрелец':45,'Козерог':95,'Водолей':45,'Рыбы':80 },
  'Близнецы': { 'Овен':75,'Телец':45,'Близнецы':80,'Рак':50,'Лев':80,'Дева':60,'Весы':90,'Скорпион':40,'Стрелец':75,'Козерог':40,'Водолей':90,'Рыбы':55 },
  'Рак':      { 'Овен':55,'Телец':90,'Близнецы':50,'Рак':85,'Лев':50,'Дева':80,'Весы':55,'Скорпион':95,'Стрелец':45,'Козерог':75,'Водолей':45,'Рыбы':95 },
  'Лев':      { 'Овен':95,'Телец':60,'Близнецы':80,'Рак':50,'Лев':85,'Дева':50,'Весы':80,'Скорпион':55,'Стрелец':95,'Козерог':50,'Водолей':75,'Рыбы':50 },
  'Дева':     { 'Овен':40,'Телец':95,'Близнецы':60,'Рак':80,'Лев':50,'Дева':80,'Весы':70,'Скорпион':90,'Стрелец':45,'Козерог':95,'Водолей':50,'Рыбы':75 },
  'Весы':     { 'Овен':70,'Телец':65,'Близнецы':90,'Рак':55,'Лев':80,'Дева':70,'Весы':80,'Скорпион':50,'Стрелец':80,'Козерог':55,'Водолей':90,'Рыбы':60 },
  'Скорпион': { 'Овен':55,'Телец':80,'Близнецы':40,'Рак':95,'Лев':55,'Дева':90,'Весы':50,'Скорпион':85,'Стрелец':50,'Козерог':85,'Водолей':45,'Рыбы':95 },
  'Стрелец':  { 'Овен':90,'Телец':45,'Близнецы':75,'Рак':45,'Лев':95,'Дева':45,'Весы':80,'Скорпион':50,'Стрелец':85,'Козерог':50,'Водолей':80,'Рыбы':55 },
  'Козерог':  { 'Овен':50,'Телец':95,'Близнецы':40,'Рак':75,'Лев':50,'Дева':95,'Весы':55,'Скорпион':85,'Стрелец':50,'Козерог':85,'Водолей':55,'Рыбы':80 },
  'Водолей':  { 'Овен':75,'Телец':45,'Близнецы':90,'Рак':45,'Лев':75,'Дева':50,'Весы':90,'Скорпион':45,'Стрелец':80,'Козерог':55,'Водолей':80,'Рыбы':60 },
  'Рыбы':     { 'Овен':55,'Телец':80,'Близнецы':55,'Рак':95,'Лев':50,'Дева':75,'Весы':60,'Скорпион':95,'Стрелец':55,'Козерог':80,'Водолей':60,'Рыбы':85 },
};

const COMPATIBILITY_DESCRIPTION: Record<string, string[]> = {
  high: [
    'Ваша пара — настоящее космическое совпадение! Между вами царит магнетическое притяжение и глубокое взаимопонимание.',
    'Эти знаки созданы друг для друга. Ваши стихии прекрасно дополняют друг друга, создавая гармоничный союз.',
    'Редкое сочетание — ваши энергии усиливают лучшие качества друг друга.',
  ],
  medium: [
    'Хорошая совместимость с некоторыми точками роста. Взаимопонимание требует усилий, но результат стоит того.',
    'Между вами есть и притяжение, и трение — именно это делает отношения интересными и развивающими.',
    'Ваш союз имеет большой потенциал при условии уважения к различиям друг друга.',
  ],
  low: [
    'Разные ценности и темпераменты создают вызовы. Однако именно противоположности могут дополнять друг друга.',
    'Эти знаки видят мир по-разному, но это может стать источником взаимного обогащения.',
    'Сложный союз, но астрология — не приговор. Любовь и понимание творят чудеса.',
  ],
};

export interface CompatibilityResult {
  sign1: ZodiacSign;
  sign2: ZodiacSign;
  percentage: number;
  level: 'high' | 'medium' | 'low';
  description: string;
  areas: {
    love: number;
    friendship: number;
    work: number;
    communication: number;
  };
}

export function calculateCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): CompatibilityResult {
  const percentage = COMPATIBILITY_MATRIX[sign1]?.[sign2] ?? 60;

  const level: 'high' | 'medium' | 'low' =
    percentage >= 80 ? 'high' : percentage >= 55 ? 'medium' : 'low';

  const descriptions = COMPATIBILITY_DESCRIPTION[level];
  const seed = (ZODIAC_SIGNS.indexOf(sign1) + ZODIAC_SIGNS.indexOf(sign2)) % descriptions.length;
  const description = descriptions[seed];

  // Generate area-specific scores with some variation
  const variation = (offset: number) => Math.min(100, Math.max(10, percentage + offset * 8));
  const seed2 = ZODIAC_SIGNS.indexOf(sign1) * 3 + ZODIAC_SIGNS.indexOf(sign2);

  return {
    sign1,
    sign2,
    percentage,
    level,
    description,
    areas: {
      love: variation((seed2 % 3) - 1),
      friendship: variation(((seed2 + 1) % 3) - 1),
      work: variation(((seed2 + 2) % 3) - 1),
      communication: variation((seed2 % 5) - 2),
    },
  };
}

export function formatCompatibilityMessage(result: CompatibilityResult): string {
  const emoji1 = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(result.sign1)];
  const emoji2 = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(result.sign2)];

  const stars = Math.round(result.percentage / 20);
  const starBar = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);

  const areaBar = (val: number) => {
    const filled = Math.round(val / 10);
    return '█'.repeat(filled) + '░'.repeat(10 - filled) + ` ${val}%`;
  };

  return `${emoji1} *${result.sign1}* и ${emoji2} *${result.sign2}*

${starBar} *${result.percentage}%* совместимости

${result.description}

*Детальный анализ:*
❤️ Любовь:       ${areaBar(result.areas.love)}
🤝 Дружба:       ${areaBar(result.areas.friendship)}
💼 Работа:       ${areaBar(result.areas.work)}
💬 Общение:      ${areaBar(result.areas.communication)}`;
}

export function getZodiacSignByIndex(index: number): ZodiacSign {
  return ZODIAC_SIGNS[((index % 12) + 12) % 12];
}
