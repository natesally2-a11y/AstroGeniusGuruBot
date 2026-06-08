import {
  NatalChartData, Transit, ZodiacSign, ZODIAC_SIGNS, ZODIAC_EMOJI,
  calculateNatalChart, calculateNatalChartForUser, calculateTransits,
  calculateSunPosition, parseBirthDate, toJulianDay,
} from './engine';
import { User } from '../database/queries';
import { isSubscriptionActive } from '../payments/stars';
import { generateAstrologyText } from '../ai/llm';
import { getMoonPhase } from './features';

// ─── Planet descriptions ──────────────────────────────────────────────────────

const PLANET_MEANINGS: Record<string, Record<string, string>> = {
  sun: {
    conjunction: 'Солнце усиливает вашу жизненную силу и самовыражение',
    trine: 'Солнечная энергия гармонично поддерживает ваши цели',
    sextile: 'Благоприятное время для творчества и лидерства',
    opposition: 'Возможен конфликт между личными желаниями и внешними обстоятельствами',
    square: 'Требуется усилие для преодоления препятствий',
  },
  moon: {
    conjunction: 'Эмоции обострены, интуиция на высоте',
    trine: 'Внутренняя гармония и эмоциональный баланс',
    sextile: 'Хорошее время для семейных дел и общения',
    opposition: 'Эмоциональные качели, возможны недопонимания',
    square: 'Эмоциональная напряжённость требует осторожности',
  },
  mercury: {
    conjunction: 'Ум обострён, общение и переговоры пройдут успешно',
    trine: 'Мысли ясны, документы и договоры благоприятны',
    sextile: 'Удачное время для обучения и коммуникаций',
    opposition: 'Возможны разногласия, дважды проверяйте информацию',
    square: 'Будьте внимательны в договорах и общении',
  },
  venus: {
    conjunction: 'Любовь и гармония в отношениях усилены',
    trine: 'Привлекательность и обаяние на высоте',
    sextile: 'Благоприятно для романтики и финансов',
    opposition: 'Возможны разочарования в отношениях',
    square: 'Финансовые вопросы требуют осторожности',
  },
  mars: {
    conjunction: 'Энергия и амбиции на пике, действуйте решительно',
    trine: 'Физические усилия вознаграждаются, спорт благоприятен',
    sextile: 'Хороший день для активных действий и инициативы',
    opposition: 'Избегайте конфликтов, контролируйте агрессию',
    square: 'Будьте осторожны с импульсивными решениями',
  },
  jupiter: {
    conjunction: 'Удача улыбается, благоприятно для расширения и роста',
    trine: 'Великолепное время для новых начинаний и путешествий',
    sextile: 'Возможности для роста и процветания открыты',
    opposition: 'Не переоценивайте свои силы',
    square: 'Избегайте чрезмерного оптимизма',
  },
  saturn: {
    conjunction: 'Время работы и ответственности, будьте дисциплинированы',
    trine: 'Структура и порядок помогают достичь целей',
    sextile: 'Практические усилия принесут плоды',
    opposition: 'Возможны задержки и ограничения',
    square: 'Терпение и настойчивость — ваши союзники',
  },
};

const SIGN_DAILY_THEMES: Record<ZodiacSign, string[]> = {
  'Овен': [
    'Ваша энергия неукротима — направьте её в нужное русло',
    'День для смелых решений и новых начинаний',
    'Лидерские качества помогут вам сегодня',
    'Действуйте интуитивно, не раздумывая слишком долго',
  ],
  'Телец': [
    'Стабильность и комфорт — ваши главные союзники',
    'День благоприятен для финансовых решений',
    'Наслаждайтесь красотой жизни и маленькими радостями',
    'Терпение принесёт долгожданные результаты',
  ],
  'Близнецы': [
    'Общительность и остроумие открывают двери',
    'Информация — ваш ресурс сегодня',
    'Не распыляйтесь — сфокусируйтесь на главном',
    'Лёгкость в общении поможет решить трудные вопросы',
  ],
  'Рак': [
    'Интуиция сильна, доверяйте своим ощущениям',
    'Дом и семья приносят особую радость сегодня',
    'Эмоциональная поддержка близких укрепляет вас',
    'Прислушайтесь к снам и внутренним сигналам',
  ],
  'Лев': [
    'Сияйте — сегодня ваш день для самовыражения',
    'Творчество и искусство вдохновляют вас',
    'Признание заслуг не заставит себя ждать',
    'Щедрость и великодушие привлекают удачу',
  ],
  'Дева': [
    'Внимание к деталям принесёт отличные результаты',
    'Анализ и планирование — ваши сильные стороны',
    'День для наведения порядка и систематизации',
    'Здоровье и рутина требуют внимания',
  ],
  'Весы': [
    'Гармония и баланс — ключ к успеху дня',
    'Переговоры и дипломатия в вашу пользу',
    'Красота и искусство наполняют душу',
    'Справедливое решение найдётся само',
  ],
  'Скорпион': [
    'Глубина восприятия помогает раскрыть тайны',
    'Трансформация открывает новые возможности',
    'Интуиция на высоте — доверяйте ей',
    'Страсть и целеустремлённость ведут к победе',
  ],
  'Стрелец': [
    'Оптимизм и открытость привлекают удачу',
    'День для путешествий и новых открытий',
    'Философские размышления обогащают мировоззрение',
    'Расширяйте горизонты — возможности безграничны',
  ],
  'Козерог': [
    'Дисциплина и амбиции ведут к вершинам',
    'Практичный подход принесёт стабильный результат',
    'Карьерные вопросы решаются успешно',
    'Терпение и упорство — ваши лучшие качества',
  ],
  'Водолей': [
    'Оригинальность мышления удивляет окружающих',
    'День для инноваций и нестандартных решений',
    'Дружба и командная работа усиливают вас',
    'Следуйте своей уникальной дороге',
  ],
  'Рыбы': [
    'Чуткость и сострадание открывают сердца',
    'Творческое вдохновение достигает пика',
    'Медитация и уединение восстанавливают силы',
    'Мечты подсказывают правильный путь',
  ],
};

const LUCKY_NUMBERS: Record<ZodiacSign, number[]> = {
  'Овен': [1, 9, 17], 'Телец': [2, 6, 24], 'Близнецы': [3, 12, 21],
  'Рак': [4, 13, 22], 'Лев': [5, 14, 23], 'Дева': [6, 15, 27],
  'Весы': [7, 16, 24], 'Скорпион': [8, 11, 22], 'Стрелец': [9, 18, 27],
  'Козерог': [2, 8, 26], 'Водолей': [4, 11, 22], 'Рыбы': [3, 9, 12],
};

const LUCKY_COLORS: Record<ZodiacSign, string> = {
  'Овен': 'красный', 'Телец': 'зелёный', 'Близнецы': 'жёлтый',
  'Рак': 'серебристый', 'Лев': 'золотой', 'Дева': 'бежевый',
  'Весы': 'голубой', 'Скорпион': 'тёмно-красный', 'Стрелец': 'фиолетовый',
  'Козерог': 'тёмно-синий', 'Водолей': 'бирюзовый', 'Рыбы': 'морской',
};

// ─── Free horoscope (sun sign only) ──────────────────────────────────────────

export function generateFreeHoroscope(sunSign: ZodiacSign, date: Date): string {
  const themes = SIGN_DAILY_THEMES[sunSign];
  // Use date as seed for pseudo-random but deterministic selection
  const seed = date.getDate() + date.getMonth() * 31;
  const theme = themes[seed % themes.length];
  const numbers = LUCKY_NUMBERS[sunSign];
  const color = LUCKY_COLORS[sunSign];
  const emoji = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(sunSign)];

  const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  return `${emoji} *Гороскоп для ${sunSign}*
📅 ${dateStr}

${theme}

🍀 *Счастливые числа:* ${numbers.join(', ')}
🎨 *Благоприятный цвет:* ${color}

_Для персонализированного гороскопа на основе вашей натальной карты оформите подписку Premium!_ ✨`;
}

// ─── Premium personalized horoscope ──────────────────────────────────────────

export function generatePremiumHoroscope(
  user: User,
  natalChart: NatalChartData,
  transits: Transit[],
  date: Date
): string {
  const sunSign = natalChart.sun.sign;
  const moonSign = natalChart.moon.sign;
  const risingSign = natalChart.ascendant.sign;
  const sunEmoji = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(sunSign)];
  const moonEmoji = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(moonSign)];
  const risingEmoji = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(risingSign)];

  const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  // Get top 3 most significant transits
  const harmonious = transits.filter(t => t.energy === 'harmonious').slice(0, 2);
  const challenging = transits.filter(t => t.energy === 'challenging').slice(0, 1);

  let transitText = '';
  for (const t of harmonious) {
    const meaning = PLANET_MEANINGS[t.transitPlanet]?.[t.aspectType] || '';
    if (meaning) transitText += `✅ ${meaning}\n`;
  }
  for (const t of challenging) {
    const meaning = PLANET_MEANINGS[t.transitPlanet]?.[t.aspectType] || '';
    if (meaning) transitText += `⚠️ ${meaning}\n`;
  }

  if (!transitText) {
    const themes = SIGN_DAILY_THEMES[sunSign];
    const seed = date.getDate() + date.getMonth() * 31;
    transitText = `✨ ${themes[seed % themes.length]}\n`;
  }

  const numbers = LUCKY_NUMBERS[sunSign];
  const color = LUCKY_COLORS[sunSign];

  // Overall energy score (1-10)
  const harmoniousCount = transits.filter(t => t.energy === 'harmonious').length;
  const challengingCount = transits.filter(t => t.energy === 'challenging').length;
  const energyScore = Math.min(10, Math.max(1, 5 + harmoniousCount - challengingCount));
  const energyBar = '⭐'.repeat(energyScore) + '☆'.repeat(10 - energyScore);

  return `🌟 *Персональный гороскоп*
📅 ${dateStr}

${sunEmoji} Солнце в *${sunSign}* · ${moonEmoji} Луна в *${moonSign}* · ${risingEmoji} Асцендент *${risingSign}*

*Энергетика дня:*
${energyBar}

*Планетарные влияния:*
${transitText.trim()}

🍀 *Счастливые числа:* ${numbers.join(', ')}
🎨 *Благоприятный цвет:* ${color}

💫 _Полная натальная карта и совместимость доступны в Mini App_`;
}

// ─── Generate horoscope for user ──────────────────────────────────────────────

export async function generateDailyHoroscope(
  user: User,
  date?: Date,
  useAi = true
): Promise<string> {
  const today = date || new Date();

  if (!user.birth_date) {
    return '🔮 Для получения персонального гороскопа введите дату рождения командой /settings';
  }

  const { year, month, day } = parseBirthDate(user.birth_date);
  const lat = user.birth_lat || 0;
  const lon = user.birth_lon || 0;
  const tz = user.timezone || 'Europe/Moscow';

  if (!isSubscriptionActive(user)) {
    const jd = toJulianDay(year, month, day, 12, 0);
    const sunPos = calculateSunPosition(jd);
    const free = generateFreeHoroscope(sunPos.sign, today);
    const moon = getMoonPhase(today);
    if (!useAi) return free + `\n\n${moon.emoji} *Луна:* ${moon.phase} в ${moon.sign}`;
    return generateAstrologyText(
      'Дополни бесплатный гороскоп по солнечному знаку. Кратко, 3-4 предложения.',
      `Знак: ${sunPos.sign}\nФаза луны: ${moon.phase} в ${moon.sign}\nБазовый текст:\n${free}`,
      free + `\n\n${moon.emoji} *Луна:* ${moon.phase} в ${moon.sign}`
    );
  }

  const natalChart = calculateNatalChartForUser(user.birth_date, user.birth_time, lat, lon, tz);
  const transitChart = calculateNatalChart(
    today.getFullYear(), today.getMonth() + 1, today.getDate(), 12, 0, 0, 0
  );
  const transits = calculateTransits(natalChart, transitChart);
  const fallback = generatePremiumHoroscope(user, natalChart, transits, today);
  const moon = getMoonPhase(today);

  if (!useAi) return fallback;

  const transitSummary = transits.slice(0, 5).map(t =>
    `${t.transitPlanet} ${t.aspectType} ${t.natalPlanet} (${t.energy})`
  ).join(', ');

  return generateAstrologyText(
    'Создай персональный ежедневный гороскоп на основе натальной карты и транзитов. ' +
      'Используй Markdown: *жирный*, эмодзи. Структура: энергия дня, транзиты, совет, числа.',
    `Имя: ${user.first_name}\nСолнце: ${natalChart.sun.sign}, Луна: ${natalChart.moon.sign}, ` +
      `Асцендент: ${natalChart.ascendant.sign}\nТранзиты: ${transitSummary}\n` +
      `Луна сегодня: ${moon.phase} в ${moon.sign}\nДата: ${today.toLocaleDateString('ru-RU')}`,
    fallback
  );
}

// ─── Weekly horoscope ─────────────────────────────────────────────────────────

export async function generateWeeklyHoroscope(user: User, useAi = true): Promise<string> {
  if (!user.birth_date) {
    return '🔮 Для получения гороскопа введите дату рождения командой /settings';
  }

  const lat = user.birth_lat || 0;
  const lon = user.birth_lon || 0;
  const tz = user.timezone || 'Europe/Moscow';
  const natalChart = calculateNatalChartForUser(user.birth_date, user.birth_time, lat, lon, tz);
  const sunSign = natalChart.sun.sign;
  const moonSign = natalChart.moon.sign;
  const sunEmoji = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(sunSign)];

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const formatDate = (d: Date) => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  const areas = ['💼 Карьера', '❤️ Отношения', '💰 Финансы', '🌿 Здоровье', '🌟 Личный рост'];
  const forecasts = areas.map(area => {
    const themes = SIGN_DAILY_THEMES[sunSign];
    const seed = area.length + today.getMonth();
    return `${area}: ${themes[seed % themes.length]}`;
  });

  const numbers = LUCKY_NUMBERS[sunSign];
  const color = LUCKY_COLORS[sunSign];

  const fallback = `${sunEmoji} *Недельный гороскоп*
📅 ${formatDate(weekStart)} – ${formatDate(weekEnd)}

${forecasts.join('\n\n')}

🍀 *Числа недели:* ${numbers.join(', ')}
🎨 *Цвет недели:* ${color}

_Ваше Солнце в ${sunSign}, Луна в ${moonSign}_`;

  if (!useAi) return fallback;

  return generateAstrologyText(
    'Создай недельный астрологический прогноз. Разбей по сферам: карьера, любовь, финансы, здоровье.',
    `Солнце: ${sunSign}, Луна: ${moonSign}, Асцендент: ${natalChart.ascendant.sign}\n` +
      `Неделя: ${formatDate(weekStart)} – ${formatDate(weekEnd)}`,
    fallback
  );
}

export async function generateMonthlyHoroscope(user: User): Promise<string> {
  if (!user.birth_date) {
    return '🔮 Укажите дату рождения в /settings';
  }
  const tz = user.timezone || 'Europe/Moscow';
  const natalChart = calculateNatalChartForUser(
    user.birth_date, user.birth_time, user.birth_lat || 0, user.birth_lon || 0, tz
  );
  const now = new Date();
  const monthName = now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const fallback = `🌙 *Прогноз на ${monthName}*\n\n` +
    `Солнце в ${natalChart.sun.sign}, Луна в ${natalChart.moon.sign}.\n` +
    `Месяц благоприятен для развития качеств знака ${natalChart.sun.sign}.`;

  return generateAstrologyText(
    'Создай месячный астрологический прогноз с ключевыми датами и рекомендациями.',
    `Месяц: ${monthName}\nКарта: Солнце ${natalChart.sun.sign}, Луна ${natalChart.moon.sign}, ` +
      `Асцендент ${natalChart.ascendant.sign}`,
    fallback
  );
}
