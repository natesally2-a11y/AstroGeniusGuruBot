import { NatalChartData, PlanetPosition, calculateAspects, ZODIAC_SIGNS } from './engine';
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

function formatPlanet(pos: PlanetPosition, name: string): string {
  return `${name}: ${pos.sign} ${pos.degree}°${pos.minute}'${pos.retrograde ? ' (ретроград)' : ''}`;
}

function buildFallbackInterpretation(chart: NatalChartData, monthKey: string): string {
  const aspects = calculateAspects(chart).slice(0, 5);
  const lines: string[] = [
    `🌟 *Натальная карта — обновление ${monthKey}*`,
    '',
    `☀️ *Солнце в ${chart.sun.sign}* — ядро личности. Ключевые качества: ${SIGN_TRAITS[chart.sun.sign]}.`,
    `🌙 *Луна в ${chart.moon.sign}* — эмоциональный мир и потребности. Вы чувствуете себя в безопасности, когда проявляются качества знака ${chart.moon.sign}.`,
    `↑ *Асцендент в ${chart.ascendant.sign}* — то, как вас воспринимают. Первое впечатление: ${SIGN_TRAITS[chart.ascendant.sign]}.`,
    '',
    '*Планеты в знаках:*',
    formatPlanet(chart.mercury, '☿ Меркурий'),
    formatPlanet(chart.venus, '♀ Венера'),
    formatPlanet(chart.mars, '♂ Марс'),
    formatPlanet(chart.jupiter, '♃ Юпитер'),
    formatPlanet(chart.saturn, '♄ Сатурн'),
    '',
    '*Ключевые аспекты:*',
  ];

  if (aspects.length === 0) {
    lines.push('Гармоничная карта без сильных напряжений.');
  } else {
    for (const a of aspects) {
      lines.push(`• ${PLANET_LABELS[a.planet1] || a.planet1} — ${PLANET_LABELS[a.planet2] || a.planet2}: ${a.type} (орб ${a.orb.toFixed(1)}°)`);
    }
  }

  lines.push('', '*Дома (равнодомная система):*');
  for (let i = 0; i < 12; i++) {
    const cusp = chart.houses[i];
    const signIdx = Math.floor(cusp / 30);
    lines.push(`Дом ${i + 1}: ${ZODIAC_SIGNS[signIdx]}`);
  }

  lines.push('', '_Интерпретация обновляется ежемесячно с учётом текущих транзитов._');
  return lines.join('\n');
}

export async function generateNatalInterpretation(
  chart: NatalChartData,
  timezone = 'Europe/Moscow',
  userName?: string
): Promise<string> {
  const monthKey = getCurrentMonthKey(timezone);
  const aspects = calculateAspects(chart).slice(0, 8);
  const fallback = buildFallbackInterpretation(chart, monthKey);

  const chartSummary = [
    formatPlanet(chart.sun, 'Солнце'),
    formatPlanet(chart.moon, 'Луна'),
    formatPlanet(chart.ascendant, 'Асцендент'),
    formatPlanet(chart.mercury, 'Меркурий'),
    formatPlanet(chart.venus, 'Венера'),
    formatPlanet(chart.mars, 'Марс'),
    formatPlanet(chart.jupiter, 'Юпитер'),
    formatPlanet(chart.saturn, 'Сатурн'),
    ...aspects.map(a => `Аспект: ${a.planet1}-${a.planet2} ${a.type}`),
    ...chart.houses.map((h, i) => `Дом ${i + 1}: ${ZODIAC_SIGNS[Math.floor(h / 30)]}`),
  ].join('\n');

  return generateAstrologyText(
    'Дай подробную натальную интерпретацию: что означает каждая планета в знаке, асцендент, дома и аспекты. ' +
      'Структурируй ответ с заголовками. Упомяни, что это обновление за текущий месяц.',
    `Месяц: ${monthKey}\nИмя: ${userName || 'Пользователь'}\n\nДанные карты:\n${chartSummary}`,
    fallback
  );
}
