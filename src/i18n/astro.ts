import { ZODIAC_SIGNS } from '../astrology/engine';
import { LangCode, normalizeLangCode } from './languages';

const ZODIAC_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const ZODIAC_LOCALIZED: Record<LangCode, string[]> = {
  ru: [...ZODIAC_SIGNS],
  en: ZODIAC_EN,
  es: ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'],
  ar: ['الحمل', 'الثور', 'الجوزاء', 'السرطان', 'الأسد', 'العذراء', 'الميزان', 'العقرب', 'القوس', 'الجدي', 'الدلو', 'الحوت'],
};

const PLANET_KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'ascendant'] as const;
type PlanetKey = typeof PLANET_KEYS[number];

const PLANETS: Record<LangCode, Record<PlanetKey, string>> = {
  ru: { sun: 'Солнце', moon: 'Луна', mercury: 'Меркурий', venus: 'Венера', mars: 'Марс', jupiter: 'Юпитер', saturn: 'Сатурн', uranus: 'Уран', neptune: 'Нептун', pluto: 'Плутон', ascendant: 'Асцендент' },
  en: { sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto', ascendant: 'Ascendant' },
  es: { sun: 'Sol', moon: 'Luna', mercury: 'Mercurio', venus: 'Venus', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Neptuno', pluto: 'Plutón', ascendant: 'Ascendente' },
  ar: { sun: 'الشمس', moon: 'القمر', mercury: 'عطارد', venus: 'الزهرة', mars: 'المريخ', jupiter: 'المشتري', saturn: 'زحل', uranus: 'أورانوس', neptune: 'نبتون', pluto: 'بلوتو', ascendant: 'الطالع' },
};

const MOON_PHASES: Record<string, Record<string, string>> = {
  ru: { 'Новолуние': 'Новолуние', 'Растущий серп': 'Растущий серп', 'Первая четверть': 'Первая четверть', 'Растущая луна': 'Растущая луна', 'Полнолуние': 'Полнолуние', 'Убывающая луна': 'Убывающая луна', 'Последняя четверть': 'Последняя четверть', 'Убывающий серп': 'Убывающий серп' },
  en: { 'Новолуние': 'New Moon', 'Растущий серп': 'Waxing Crescent', 'Первая четверть': 'First Quarter', 'Растущая луна': 'Waxing Gibbous', 'Полнолуние': 'Full Moon', 'Убывающая луна': 'Waning Gibbous', 'Последняя четверть': 'Last Quarter', 'Убывающий серп': 'Waning Crescent' },
  es: { 'Новолуние': 'Luna nueva', 'Растущий серп': 'Creciente', 'Первая четверть': 'Cuarto creciente', 'Растущая луна': 'Gibosa creciente', 'Полнолуние': 'Luna llena', 'Убывающая луна': 'Gibosa menguante', 'Последняя четверть': 'Cuarto menguante', 'Убывающий серп': 'Menguante' },
  ar: { 'Новолуние': 'محاق', 'Растущий серп': 'هلال متزايد', 'Первая четверть': 'تربيع أول', 'Растущая луна': 'أحدب متزايد', 'Полнолуние': 'بدر', 'Убывающая луна': 'أحدب متناقص', 'Последняя четверть': 'تربيع أخير', 'Убывающий серп': 'هلال متناقص' },
};

const MOON_IN_LABEL: Record<LangCode, string> = {
  ru: 'Луна в', en: 'Moon in', es: 'Luna en', ar: 'القمر في',
};

const MOON_ADVICE: Record<string, Partial<Record<LangCode, string>>> = {
  'Новолуние': { ru: 'Время загадывать намерения и начинать новые циклы.', en: 'Time to set intentions and start new cycles.', es: 'Momento de fijar intenciones e iniciar nuevos ciclos.', ar: 'وقت لتصفية النوايا وبدء دورات جديدة.' },
  'Растущий серп': { ru: 'Энергия нарастает — планируйте и готовьтесь к действиям.', en: 'Energy is building — plan and prepare for action.', es: 'La energía crece — planifica y prepárate para actuar.', ar: 'الطاقة تتزايد — خطّط واستعد للعمل.' },
  'Первая четверть': { ru: 'Преодолевайте препятствия, проявляйте решительность.', en: 'Overcome obstacles and show determination.', es: 'Supera obstáculos y muestra determinación.', ar: 'تجاوز العقبات وأظهر الحزم.' },
  'Растущая луна': { ru: 'Благоприятный период для роста и развития проектов.', en: 'Favorable period for growth and developing projects.', es: 'Período favorable para crecer y desarrollar proyectos.', ar: 'فترة مواتية للنمو وتطوير المشاريع.' },
  'Полнолуние': { ru: 'Эмоции на пике — завершайте дела и осознавайте результаты.', en: 'Emotions peak — finish tasks and recognize results.', es: 'Las emociones al máximo — termina tareas y reconoce resultados.', ar: 'العواطف في ذروتها — أنهِ المهام واستوعب النتائج.' },
  'Убывающая луна': { ru: 'Время анализа, благодарности и отпускания лишнего.', en: 'Time for analysis, gratitude and letting go.', es: 'Tiempo de análisis, gratitud y soltar lo innecesario.', ar: 'وقت للتحليل والامتنان والتخلي عما لا يلزم.' },
  'Последняя четверть': { ru: 'Подведите итоги, избавьтесь от того, что мешает.', en: 'Summarize results and release what holds you back.', es: 'Resume resultados y suelta lo que te frena.', ar: 'لخّص النتائج وتخلّص مما يعيقك.' },
  'Убывающий серп': { ru: 'Отдых и восстановление важнее активных действий.', en: 'Rest and recovery matter more than active action.', es: 'El descanso importa más que la acción activa.', ar: 'الراحة أهم من العمل النشط.' },
};

function moonAdviceTail(lang: LangCode, sign: string): string {
  const tails: Partial<Record<LangCode, string>> = {
    ru: `Луна в ${sign} усиливает соответствующие темы этого знака.`,
    en: `Moon in ${sign} amplifies this sign's themes.`,
    es: `La Luna en ${sign} intensifica los temas de este signo.`,
    ar: `القمر في ${sign} يعزز مواضيع هذا البرج.`,
  };
  return tails[lang] || tails.en || '';
}

function langCode(lang?: string | null): LangCode {
  return normalizeLangCode(lang);
}

function signIndex(ruSign: string): number {
  return ZODIAC_SIGNS.indexOf(ruSign.trim() as typeof ZODIAC_SIGNS[number]);
}

export function translateSign(lang: string | undefined, ruSign: string): string {
  const i = signIndex(ruSign);
  if (i < 0) return ruSign;
  const L = langCode(lang);
  const list = ZODIAC_LOCALIZED[L] || ZODIAC_EN;
  return list[i] || ruSign;
}

export function translatePlanet(lang: string | undefined, key: string): string {
  const L = langCode(lang);
  const planets = PLANETS[L] || PLANETS.en;
  return planets[key as PlanetKey] || key;
}

export function translateMoonPhase(lang: string | undefined, ruPhase: string): string {
  const L = langCode(lang);
  return (MOON_PHASES[L] || MOON_PHASES.en)[ruPhase] || ruPhase;
}

export function localizeMoonAdvice(phaseRu: string, signRu: string, lang: string): string {
  const L = langCode(lang);
  const phaseAdvice = MOON_ADVICE[phaseRu]?.[L] || MOON_ADVICE[phaseRu]?.en || 'Follow your intuition.';
  const sign = translateSign(lang, signRu);
  return `${phaseAdvice} ${moonAdviceTail(L, sign)}`.trim();
}

export function localizeMoon(moon: { phase: string; sign: string; emoji: string; illumination: number; advice?: string }, lang: string) {
  const L = langCode(lang);
  return {
    ...moon,
    phase: translateMoonPhase(lang, moon.phase),
    sign: translateSign(lang, moon.sign),
    moonInLabel: MOON_IN_LABEL[L] || MOON_IN_LABEL.en,
    advice: localizeMoonAdvice(moon.phase, moon.sign, lang),
  };
}

const LUCKY_COLOR_VALUES: Record<string, Partial<Record<LangCode, string>>> = {
  'фиолетовый': { ru: 'фиолетовый', en: 'purple', es: 'violeta', ar: 'بنفسجي' },
  'золотой': { ru: 'золотой', en: 'gold', es: 'dorado', ar: 'ذهبي' },
  'изумрудный': { ru: 'изумрудный', en: 'emerald', es: 'esmeralda', ar: 'زمردي' },
  'сапфировый': { ru: 'сапфировый', en: 'sapphire', es: 'zafiro', ar: 'ياقوتي' },
  'алый': { ru: 'алый', en: 'scarlet', es: 'escarlata', ar: 'قرمزي' },
  'бирюзовый': { ru: 'бирюзовый', en: 'turquoise', es: 'turquesa', ar: 'فيروزي' },
  'янтарный': { ru: 'янтарный', en: 'amber', es: 'ámbar', ar: 'كهرماني' },
  'серебряный': { ru: 'серебряный', en: 'silver', es: 'plateado', ar: 'فضي' },
};

const LUCKY_STONE_VALUES: Record<string, Partial<Record<LangCode, string>>> = {
  'аметист': { ru: 'аметист', en: 'amethyst', es: 'amatista', ar: 'جمشت' },
  'гранат': { ru: 'гранат', en: 'garnet', es: 'granate', ar: 'عقيق' },
  'лазурит': { ru: 'лазурит', en: 'lapis lazuli', es: 'lapislázuli', ar: 'لازورد' },
  'янтарь': { ru: 'янтарь', en: 'amber', es: 'ámbar', ar: 'كهرمان' },
  'лунный камень': { ru: 'лунный камень', en: 'moonstone', es: 'piedra lunar', ar: 'حجر القمر' },
};

const LUCKY_TIME_VALUES: Record<string, Partial<Record<LangCode, string>>> = {
  'утро': { ru: 'утро', en: 'morning', es: 'mañana', ar: 'صباح' },
  'день': { ru: 'день', en: 'afternoon', es: 'tarde', ar: 'نهار' },
  'вечер': { ru: 'вечер', en: 'evening', es: 'noche', ar: 'مساء' },
};

function pickLocalized(map: Record<string, Partial<Record<LangCode, string>>>, lang: LangCode, key: string): string {
  const entry = map[key];
  if (!entry) return key;
  return entry[lang] || entry.en || key;
}

export function translateLuckyColor(lang: string | undefined, ruColor: string): string {
  return pickLocalized(LUCKY_COLOR_VALUES, langCode(lang), ruColor);
}

export function translateLuckyStone(lang: string | undefined, ruStone: string): string {
  return pickLocalized(LUCKY_STONE_VALUES, langCode(lang), ruStone);
}

export function translateLuckyTime(lang: string | undefined, ruTime: string): string {
  return pickLocalized(LUCKY_TIME_VALUES, langCode(lang), ruTime);
}
