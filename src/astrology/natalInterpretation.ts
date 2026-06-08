import { NatalChartData, PlanetPosition, calculateAspects, ZODIAC_SIGNS, Aspect } from './engine';
import { generateAstrologyText } from '../ai/llm';
import { getCurrentMonthKey } from './timezone';

const PLANET_LABELS: Record<string, string> = {
  sun: 'Солнце', moon: 'Луна', mercury: 'Меркурий', venus: 'Венера',
  mars: 'Марс', jupiter: 'Юпитер', saturn: 'Сатурн', uranus: 'Уран',
  neptune: 'Нептун', pluto: 'Плутон', ascendant: 'Асцендент',
};

const SIGN_TRAITS: Record<string, string> = {
  'Овен': 'инициатива, смелость, прямота',
  'Телец': 'стабильность, чувственность, практичность',
  'Близнецы': 'общение, любознательность, гибкость',
  'Рак': 'забота, интуиция, эмоциональная глубина',
  'Лев': 'харизма, творчество, лидерство',
  'Дева': 'анализ, порядок, служение',
  'Весы': 'гармония, партнёрство, эстетика',
  'Скорпион': 'трансформация, страсть, глубина',
  'Стрелец': 'свобода, философия, оптимизм',
  'Козерог': 'дисциплина, амбиции, структура',
  'Водолей': 'новаторство, независимость, идеи',
  'Рыбы': 'интуиция, сострадание, воображение',
};

const HOUSE_MEANINGS: Record<number, { title: string; description: string }> = {
  1: { title: 'Дом личности (Асцендент)', description: 'Внешность, первое впечатление, манера поведения, жизненная энергия и путь самовыражения.' },
  2: { title: 'Дом финансов и ценностей', description: 'Деньги, материальные ресурсы, отношение к собственности, таланты и то, что вы цените.' },
  3: { title: 'Дом общения', description: 'Речь, обучение, ближайшее окружение, братья и сёстры, короткие поездки, повседневные контакты.' },
  4: { title: 'Дом семьи и корней', description: 'Дом, семья, эмоциональная база, происхождение, внутренний мир и чувство безопасности.' },
  5: { title: 'Дом творчества и любви', description: 'Романтика, дети, хобби, самовыражение, радость, риск и творческие проекты.' },
  6: { title: 'Дом здоровья и работы', description: 'Рутина, служба, здоровье, привычки, отношения с коллегами и повседневная дисциплина.' },
  7: { title: 'Дом партнёрства', description: 'Брак, деловые союзы, открытые враги, зеркало отношений — кого вы притягиваете.' },
  8: { title: 'Дом трансформации', description: 'Кризисы, наследство, совместные финансы, глубинная психология, сексуальность, возрождение.' },
  9: { title: 'Дом мировоззрения', description: 'Философия, высшее образование, дальние путешествия, вера, поиск смысла и расширение горизонтов.' },
  10: { title: 'Дом карьеры (MC)', description: 'Профессия, статус, репутация, амбиции, призвание и то, как вас видит общество.' },
  11: { title: 'Дом друзей и целей', description: 'Друзья, сообщества, мечты, социальные проекты, надежды и коллективные идеи.' },
  12: { title: 'Дом подсознания', description: 'Тайны, уединение, духовность, карма, скрытые страхи, интуиция и внутренняя работа.' },
};

const ASPECT_TYPE_RU: Record<string, string> = {
  conjunction: 'Соединение',
  opposition: 'Оппозиция',
  trine: 'Трин',
  square: 'Квадрат',
  sextile: 'Секстиль',
  quincunx: 'Квинконс',
  semisextile: 'Полусекстиль',
};

const ASPECT_MEANINGS: Record<string, string> = {
  conjunction: 'Планеты сливаются — их темы усиливают друг друга. Ключевая точка карты.',
  opposition: 'Полярность и баланс. Важно интегрировать противоположные качества.',
  trine: 'Гармоничный поток энергии. Таланты даются легко, используйте их осознанно.',
  square: 'Внутреннее напряжение и вызов. Стимул к росту через преодоление препятствий.',
  sextile: 'Благоприятные возможности. Требуют небольших усилий для реализации.',
  quincunx: 'Необходимость адаптации и корректировки подхода.',
  semisextile: 'Тонкая связь, требующая внимания к деталям.',
};

function formatPlanet(pos: PlanetPosition, name: string): string {
  return `${name}: ${pos.sign} ${pos.degree}°${pos.minute}'${pos.retrograde ? ' (ретроград)' : ''}`;
}

function describeAspect(a: Aspect): string {
  const p1 = PLANET_LABELS[a.planet1] || a.planet1;
  const p2 = PLANET_LABELS[a.planet2] || a.planet2;
  const typeRu = ASPECT_TYPE_RU[a.type] || a.type;
  const meaning = ASPECT_MEANINGS[a.type] || '';
  const energy = a.orb < 3 ? ' *(сильный аспект)*' : '';
  return `• *${p1} ${typeRu} ${p2}* (орб ${a.orb.toFixed(1)}°)${energy}\n  ${meaning}`;
}

function describeHouses(chart: NatalChartData): string {
  const lines: string[] = ['', '🏠 *Дома гороскопа (подробно):*', ''];
  for (let i = 0; i < 12; i++) {
    const house = HOUSE_MEANINGS[i + 1];
    const signIdx = Math.floor(chart.houses[i] / 30);
    const sign = ZODIAC_SIGNS[signIdx];
    const degree = Math.floor(chart.houses[i] % 30);
    lines.push(
      `*${i + 1}. ${house.title}* — кусп в *${sign}* ${degree}°\n` +
      `${house.description}\n` +
      `_В этом доме проявляются качества ${sign}: ${SIGN_TRAITS[sign]}._`
    );
  }
  return lines.join('\n\n');
}

function buildFallbackInterpretation(chart: NatalChartData, monthKey: string): string {
  const aspects = calculateAspects(chart).slice(0, 8);
  const lines: string[] = [
    `🌟 *Натальная карта — ${monthKey}*`,
    '',
    '━━ *Триада личности* ━━',
    `☀️ *Солнце в ${chart.sun.sign}* — ядро личности, воля, жизненная цель.\n${SIGN_TRAITS[chart.sun.sign]}.`,
    `🌙 *Луна в ${chart.moon.sign}* — эмоции, потребности, привычные реакции.\nВ безопасности вы проявляете качества ${chart.moon.sign}.`,
    `↑ *Асцендент в ${chart.ascendant.sign}* — маска, первое впечатление.\nОкружающие видят вас как: ${SIGN_TRAITS[chart.ascendant.sign]}.`,
    '',
    '━━ *Планеты в знаках* ━━',
    formatPlanet(chart.mercury, '☿ Меркурий (мышление)'),
    formatPlanet(chart.venus, '♀ Венера (любовь, ценности)'),
    formatPlanet(chart.mars, '♂ Марс (энергия, действие)'),
    formatPlanet(chart.jupiter, '♃ Юпитер (рост, удача)'),
    formatPlanet(chart.saturn, '♄ Сатурн (уроки, дисциплина)'),
    formatPlanet(chart.uranus, '⛢ Уран (перемены)'),
    formatPlanet(chart.neptune, '♆ Нептун (интуиция)'),
    formatPlanet(chart.pluto, '♇ Плутон (трансформация)'),
    '',
    '━━ *Ключевые аспекты* ━━',
    '_Аспекты — угловые связи между планетами, показывающие, как энергии взаимодействуют._',
    '',
  ];

  if (aspects.length === 0) {
    lines.push('Гармоничная карта без выраженных напряжений — энергии текут ровно.');
  } else {
    for (const a of aspects) {
      lines.push(describeAspect(a));
    }
  }

  lines.push(describeHouses(chart));
  lines.push('', '_Обновляется ежемесячно. Данные рассчитаны по дате, времени и месту рождения._');
  return lines.join('\n');
}

export async function generateNatalInterpretation(
  chart: NatalChartData,
  timezone = 'Europe/Moscow',
  userName?: string
): Promise<string> {
  const monthKey = getCurrentMonthKey(timezone) + '-v2';
  const aspects = calculateAspects(chart).slice(0, 10);
  const fallback = buildFallbackInterpretation(chart, monthKey);

  const chartSummary = [
    formatPlanet(chart.sun, 'Солнце'),
    formatPlanet(chart.moon, 'Луна'),
    formatPlanet(chart.ascendant, 'Асцендент'),
    ...aspects.map(a => `Аспект: ${a.planet1}-${a.planet2} ${a.type} орб${a.orb.toFixed(1)}`),
    ...chart.houses.map((h, i) => {
      const sign = ZODIAC_SIGNS[Math.floor(h / 30)];
      return `Дом ${i + 1} (${HOUSE_MEANINGS[i + 1].title}): кусп ${sign}`;
    }),
  ].join('\n');

  return generateAstrologyText(
    'Дай подробную натальную интерпретацию на русском. Обязательно включи:\n' +
      '1) Солнце, Луна, Асцендент\n' +
      '2) Раздел "Ключевые аспекты" — минимум 5 аспектов с объяснением\n' +
      '3) Раздел "Дома" — все 12 домов с описанием сферы жизни и знака на куспе\n' +
      'Используй Markdown. Будь конкретным и астрологически точным.',
    `Месяц: ${monthKey}\nИмя: ${userName || 'Пользователь'}\n\n${chartSummary}`,
    fallback
  );
}
