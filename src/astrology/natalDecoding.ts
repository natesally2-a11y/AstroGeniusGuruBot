import {
  Aspect, NatalChartData, PlanetPosition, ZODIAC_SIGNS,
} from './engine';
import { LangCode, normalizeLangCode } from '../i18n/languages';
import { translatePlanet, translateSign } from '../i18n/astro';
import {
  describeHouses, getNatalFooter,
} from '../i18n/natalContent';

export interface DecodingItem {
  id: string;
  heading: string;
  text: string;
}

export interface NatalDecoding {
  summary: string;
  elements: { fire: number; earth: number; air: number; water: number };
  qualities: { cardinal: number; fixed: number; mutable: number };
  tabLabels: {
    planetsInSigns: string;
    housesInSigns: string;
    planetsInHouses: string;
    aspects: string;
    info: string;
  };
  tabs: {
    planetsInSigns: DecodingItem[];
    housesInSigns: DecodingItem[];
    planetsInHouses: DecodingItem[];
    aspects: DecodingItem[];
    info: DecodingItem[];
  };
}

const ELEMENT_BY_SIGN = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3]; // fire earth air water
const QUALITY_BY_SIGN = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2]; // cardinal fixed mutable

const PLANET_KEYS = [
  'sun', 'moon', 'mercury', 'venus', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
] as const;

const LABELS: Record<LangCode, NatalDecoding['tabLabels']> = {
  ru: {
    planetsInSigns: 'Планеты в знаках',
    housesInSigns: 'Дома в знаках',
    planetsInHouses: 'Планеты в домах',
    aspects: 'Аспекты',
    info: 'Информация',
  },
  en: {
    planetsInSigns: 'Planets in signs',
    housesInSigns: 'Houses in signs',
    planetsInHouses: 'Planets in houses',
    aspects: 'Aspects',
    info: 'Information',
  },
  es: {
    planetsInSigns: 'Planetas en signos',
    housesInSigns: 'Casas en signos',
    planetsInHouses: 'Planetas en casas',
    aspects: 'Aspectos',
    info: 'Información',
  },
  ar: {
    planetsInSigns: 'الكواكب في الأبراج',
    housesInSigns: 'البيوت في الأبراج',
    planetsInHouses: 'الكواكب في البيوت',
    aspects: 'الجوانب',
    info: 'معلومات',
  },
};

const PLANET_IN_SIGN_HINT: Record<LangCode, Record<string, string>> = {
  ru: {
    sun: 'Солнце описывает вашу сущность, жизненную силу и то, как вы сияете в мире.',
    moon: 'Луна отражает эмоции, подсознание, потребность в безопасности и привычки.',
    mercury: 'Меркурий — мышление, речь, обучение и способ обрабатывать информацию.',
    venus: 'Венера — любовь, ценности, эстетика и то, что вам приносит удовольствие.',
    mars: 'Марс — энергия действия, инициатива, страсть и способ отстаивать себя.',
    jupiter: 'Юпитер — рост, удача, мировоззрение и стремление к расширению.',
    saturn: 'Сатурн — дисциплина, ответственность, границы и уроки зрелости.',
    uranus: 'Уран — оригинальность, свобода, неожиданные перемены и инновации.',
    neptune: 'Нептун — интуиция, мечты, духовность и творческое воображение.',
    pluto: 'Плутон — глубинная трансформация, сила воли и перерождение.',
    ascendant: 'Асцендент — ваш образ, первое впечатление и маска личности.',
  },
  en: {
    sun: 'The Sun is your core identity, vitality and how you shine in the world.',
    moon: 'The Moon reflects emotions, subconscious needs, habits and inner security.',
    mercury: 'Mercury is thinking, speech, learning and how you process information.',
    venus: 'Venus is love, values, aesthetics and what brings you pleasure.',
    mars: 'Mars is drive, initiative, passion and how you assert yourself.',
    jupiter: 'Jupiter is growth, luck, worldview and expansion.',
    saturn: 'Saturn is discipline, responsibility, limits and maturity lessons.',
    uranus: 'Uranus is originality, freedom, sudden change and innovation.',
    neptune: 'Neptune is intuition, dreams, spirituality and imagination.',
    pluto: 'Pluto is deep transformation, willpower and rebirth.',
    ascendant: 'The Ascendant is your appearance, first impression and social mask.',
  },
  es: {
    sun: 'El Sol es tu identidad central, vitalidad y cómo brillas en el mundo.',
    moon: 'La Luna refleja emociones, hábitos y necesidad de seguridad interior.',
    mercury: 'Mercurio es el pensamiento, la comunicación y el aprendizaje.',
    venus: 'Venus es el amor, los valores, la estética y el placer.',
    mars: 'Marte es la energía de acción, la iniciativa y la pasión.',
    jupiter: 'Júpiter es crecimiento, suerte y expansión de horizontes.',
    saturn: 'Saturno es disciplina, responsabilidad y lecciones de madurez.',
    uranus: 'Urano es originalidad, libertad e innovación.',
    neptune: 'Neptuno es intuición, espiritualidad e imaginación.',
    pluto: 'Plutón es transformación profunda y renacimiento.',
    ascendant: 'El Ascendente es tu imagen y la primera impresión que causas.',
  },
  ar: {
    sun: 'الشمس هي جوهرك، حيويتك وكيف تظهر في العالم.',
    moon: 'القمر يعكس العواطف والعادات والحاجة للأمان الداخلي.',
    mercury: 'عطارد هو التفكير والتواصل والتعلّم.',
    venus: 'الزهرة هي الحب والقيم والجمال والمتعة.',
    mars: 'المريخ هو طاقة الفعل والمبادرة والشغف.',
    jupiter: 'المشتري هو النمو والحظ وتوسيع الآفاق.',
    saturn: 'زحل هو الانضباط والمسؤولية ودروس النضج.',
    uranus: 'أورانوس هو الأصالة والحرية والابتكار.',
    neptune: 'نبتون هو الحدس والروحانية والخيال.',
    pluto: 'بلوتو هو التحول العميق والولادة الجديدة.',
    ascendant: 'الطالع هو صورتك والانطباع الأول عنك.',
  },
};

const HOUSE_IN_SIGN_INTRO: Record<LangCode, string> = {
  ru: 'Куспид этого дома в знаке показывает, через какие качества проявляется сфера жизни:',
  en: 'The cusp sign shows how this life area expresses itself through these qualities:',
  es: 'La cúspide en este signo muestra cómo se expresa esta área de la vida:',
  ar: 'برج الحد يوضح كيف تتجلّى هذه المنطقة من الحياة:',
};

const PLANET_IN_HOUSE_INTRO: Record<LangCode, string> = {
  ru: 'Планета в этом доме активирует соответствующую сферу жизни:',
  en: 'This planet in the house activates the corresponding life area:',
  es: 'Este planeta en la casa activa el área de vida correspondiente:',
  ar: 'هذا الكوكب في البيت ينشّط مجال الحياة المرتبط به:',
};

const ASPECT_TYPE_LABEL: Record<LangCode, Record<string, string>> = {
  ru: { conjunction: 'Соединение', opposition: 'Оппозиция', trine: 'Трин', square: 'Квадрат', sextile: 'Секстиль', quincunx: 'Квинконс', semisextile: 'Полусекстиль' },
  en: { conjunction: 'Conjunction', opposition: 'Opposition', trine: 'Trine', square: 'Square', sextile: 'Sextile', quincunx: 'Quincunx', semisextile: 'Semisextile' },
  es: { conjunction: 'Conjunción', opposition: 'Oposición', trine: 'Trígono', square: 'Cuadratura', sextile: 'Sextil', quincunx: 'Quincuncio', semisextile: 'Semisextil' },
  ar: { conjunction: 'اقتران', opposition: 'تقابل', trine: 'تثليث', square: 'تربيع', sextile: 'تسديس', quincunx: 'كوينكونس', semisextile: 'نصف تسديس' },
};

const ASPECT_HINT: Record<LangCode, Record<string, string>> = {
  ru: {
    conjunction: 'Планеты сливаются — их темы усиливают друг друга. Ключевая точка карты.',
    opposition: 'Полярность и баланс — важно интегрировать противоположные качества.',
    trine: 'Гармоничный поток — таланты даются легче, используйте их осознанно.',
    square: 'Внутреннее напряжение — стимул к росту через преодоление препятствий.',
    sextile: 'Благоприятные возможности — требуют небольших усилий для реализации.',
    quincunx: 'Необходимость адаптации и корректировки подхода.',
    semisextile: 'Тонкая связь, требующая внимания к деталям.',
  },
  en: {
    conjunction: 'Planets merge — their themes amplify each other. A key chart point.',
    opposition: 'Polarity and balance — integrate opposite qualities.',
    trine: 'Harmonious flow — talents come easily; use them consciously.',
    square: 'Inner tension — growth through overcoming obstacles.',
    sextile: 'Favorable opportunities — require small effort to realize.',
    quincunx: 'Need for adaptation and adjusting your approach.',
    semisextile: 'Subtle link requiring attention to detail.',
  },
  es: {
    conjunction: 'Los planetas se fusionan — sus temas se refuerzan mutuamente.',
    opposition: 'Polaridad y equilibrio — integra cualidades opuestas.',
    trine: 'Flujo armónico — los talentos llegan con facilidad.',
    square: 'Tensión interna — crecimiento superando obstáculos.',
    sextile: 'Oportunidades favorables — requieren poco esfuerzo.',
    quincunx: 'Necesidad de adaptación y ajuste del enfoque.',
    semisextile: 'Vínculo sutil que requiere atención al detalle.',
  },
  ar: {
    conjunction: 'الكواكب تندمج — مواضيعها تتعزز. نقطة محورية.',
    opposition: 'قطبية وتوازن — دمج الصفات المتعارضة.',
    trine: 'تدفق متناغم — المواهب تأتي بسهولة.',
    square: 'توتر داخلي — نمو عبر تجاوز العقبات.',
    sextile: 'فرص مواتية — تحتاج جهداً بسيطاً.',
    quincunx: 'حاجة للتكيف وتعديل النهج.',
    semisextile: 'رابط دقيق يحتاج انتباهاً للتفاصيل.',
  },
};

const ELEMENT_NAMES: Record<LangCode, string[]> = {
  ru: ['Огонь', 'Земля', 'Воздух', 'Вода'],
  en: ['Fire', 'Earth', 'Air', 'Water'],
  es: ['Fuego', 'Tierra', 'Aire', 'Agua'],
  ar: ['نار', 'أرض', 'هواء', 'ماء'],
};

const QUALITY_NAMES: Record<LangCode, string[]> = {
  ru: ['Кардинальный', 'Фиксированный', 'Подвижный'],
  en: ['Cardinal', 'Fixed', 'Mutable'],
  es: ['Cardinal', 'Fijo', 'Mutable'],
  ar: ['أساسي', 'ثابت', 'متغير'],
};

function L(lang?: string | null): LangCode {
  return normalizeLangCode(lang);
}

export function getPlanetHouseNumber(longitude: number, houseCusps: number[]): number {
  const lon = ((longitude % 360) + 360) % 360;
  for (let h = 0; h < 12; h++) {
    const start = ((houseCusps[h] % 360) + 360) % 360;
    const end = ((houseCusps[(h + 1) % 12] % 360) + 360) % 360;
    if (start <= end) {
      if (lon >= start && lon < end) return h + 1;
    } else if (lon >= start || lon < end) {
      return h + 1;
    }
  }
  return 1;
}

function computeBalance(chart: NatalChartData): {
  elements: NatalDecoding['elements'];
  qualities: NatalDecoding['qualities'];
} {
  const elements = { fire: 0, earth: 0, air: 0, water: 0 };
  const qualities = { cardinal: 0, fixed: 0, mutable: 0 };
  const bodies: PlanetPosition[] = [
    chart.sun, chart.moon, chart.mercury, chart.venus, chart.mars,
    chart.jupiter, chart.saturn, chart.ascendant,
  ];
  for (const pos of bodies) {
    const el = ELEMENT_BY_SIGN[pos.signIndex];
    const q = QUALITY_BY_SIGN[pos.signIndex];
    if (el === 0) elements.fire++;
    else if (el === 1) elements.earth++;
    else if (el === 2) elements.air++;
    else elements.water++;
    if (q === 0) qualities.cardinal++;
    else if (q === 1) qualities.fixed++;
    else qualities.mutable++;
  }
  return { elements, qualities };
}

function buildSummary(chart: NatalChartData, lang: LangCode): string {
  const { elements, qualities } = computeBalance(chart);
  const elNames = ELEMENT_NAMES[lang];
  const qNames = QUALITY_NAMES[lang];
  const elArr = [elements.fire, elements.earth, elements.air, elements.water];
  const qArr = [qualities.cardinal, qualities.fixed, qualities.mutable];
  const maxEl = elArr.indexOf(Math.max(...elArr));
  const maxQ = qArr.indexOf(Math.max(...qArr));
  const sun = translateSign(lang, chart.sun.sign);
  const moon = translateSign(lang, chart.moon.sign);
  const asc = translateSign(lang, chart.ascendant.sign);

  const templates: Record<LangCode, string> = {
    ru: `Ваш солнечный знак — *${sun}*, луна в *${moon}*, асцендент в *${asc}*. Доминирует стихия *${elNames[maxEl]}* (${elArr[maxEl]} баллов) и качество *${qNames[maxQ]}* (${qArr[maxQ]}). Ниже — подробная расшифровка каждой планеты, дома и аспекта вашей карты.`,
    en: `Your Sun is in *${sun}*, Moon in *${moon}*, Ascendant in *${asc}*. Dominant element: *${elNames[maxEl]}* (${elArr[maxEl]} pts), quality: *${qNames[maxQ]}* (${qArr[maxQ]}). Below is a detailed decoding of every planet, house and aspect in your chart.`,
    es: `Tu Sol está en *${sun}*, Luna en *${moon}*, Ascendente en *${asc}*. Elemento dominante: *${elNames[maxEl]}* (${elArr[maxEl]} pts), cualidad: *${qNames[maxQ]}* (${qArr[maxQ]}). Abajo encontrarás la interpretación detallada de planetas, casas y aspectos.`,
    ar: `شمسك في *${sun}*، قمرك في *${moon}*، طالعك في *${asc}*. العنصر السائد: *${elNames[maxEl]}* (${elArr[maxEl]})، الصفة: *${qNames[maxQ]}* (${qArr[maxQ]}). في الأسفل تفسير مفصّل للكواكب والبيوت والجوانب.`,
  };
  return templates[lang] || templates.en;
}

function planetPosition(chart: NatalChartData, key: string): PlanetPosition {
  return (chart as unknown as Record<string, PlanetPosition>)[key];
}

function buildPlanetsInSigns(chart: NatalChartData, lang: LangCode): DecodingItem[] {
  const hints = PLANET_IN_SIGN_HINT[lang] || PLANET_IN_SIGN_HINT.en;
  const items: DecodingItem[] = [];
  for (const key of [...PLANET_KEYS, 'ascendant'] as const) {
    const pos = planetPosition(chart, key);
    const sign = translateSign(lang, pos.sign);
    const planet = translatePlanet(lang, key);
    const retro = pos.retrograde
      ? (lang === 'ru' ? ' Ретроградное положение усиливает внутреннюю проработку темы.' :
        lang === 'es' ? ' Posición retrógrada: la energía se vive más hacia dentro.' :
        lang === 'ar' ? ' الوضع التراجعي يعمّق المعالجة الداخلية.' :
        ' Retrograde placement turns this energy inward for deeper processing.')
      : '';
    items.push({
      id: `pis-${key}`,
      heading: `${planet} ${lang === 'ru' ? 'в' : lang === 'es' ? 'en' : lang === 'ar' ? 'في' : 'in'} ${sign}`,
      text: `${hints[key] || ''} ${lang === 'ru' ? 'Положение' : lang === 'es' ? 'Posición' : lang === 'ar' ? 'الموقع' : 'Position'}: ${pos.degree}°${pos.minute}'.${retro}`,
    });
  }
  return items;
}

function buildHousesInSigns(chart: NatalChartData, lang: LangCode): DecodingItem[] {
  const intro = HOUSE_IN_SIGN_INTRO[lang] || HOUSE_IN_SIGN_INTRO.en;
  const items: DecodingItem[] = [];
  const houseTitles: Record<LangCode, string[]> = {
    ru: ['I дом', 'II дом', 'III дом', 'IV дом', 'V дом', 'VI дом', 'VII дом', 'VIII дом', 'IX дом', 'X дом', 'XI дом', 'XII дом'],
    en: ['1st house', '2nd house', '3rd house', '4th house', '5th house', '6th house', '7th house', '8th house', '9th house', '10th house', '11th house', '12th house'],
    es: ['Casa I', 'Casa II', 'Casa III', 'Casa IV', 'Casa V', 'Casa VI', 'Casa VII', 'Casa VIII', 'Casa IX', 'Casa X', 'Casa XI', 'Casa XII'],
    ar: ['البيت 1', 'البيت 2', 'البيت 3', 'البيت 4', 'البيت 5', 'البيت 6', 'البيت 7', 'البيت 8', 'البيت 9', 'البيت 10', 'البيت 11', 'البيت 12'],
  };
  const titles = houseTitles[lang] || houseTitles.en;
  for (let i = 0; i < 12; i++) {
    const signRu = ZODIAC_SIGNS[Math.floor(chart.houses[i] / 30)];
    const sign = translateSign(lang, signRu);
    const deg = Math.floor(chart.houses[i] % 30);
    items.push({
      id: `his-${i + 1}`,
      heading: `${titles[i]} ${lang === 'ru' ? 'в' : lang === 'es' ? 'en' : lang === 'ar' ? 'في' : 'in'} ${sign}`,
      text: `${intro} ${sign} (${deg}°).`,
    });
  }
  return items;
}

function buildPlanetsInHouses(chart: NatalChartData, lang: LangCode): DecodingItem[] {
  const intro = PLANET_IN_HOUSE_INTRO[lang] || PLANET_IN_HOUSE_INTRO.en;
  const items: DecodingItem[] = [];
  for (const key of PLANET_KEYS) {
    const pos = planetPosition(chart, key);
    const houseNum = getPlanetHouseNumber(pos.longitude, chart.houses);
    const planet = translatePlanet(lang, key);
    const houseLabel = lang === 'ru' ? `${houseNum}-м доме` :
      lang === 'es' ? `casa ${houseNum}` :
      lang === 'ar' ? `البيت ${houseNum}` :
      `${houseNum}${houseNum === 1 ? 'st' : houseNum === 2 ? 'nd' : houseNum === 3 ? 'rd' : 'th'} house`;
    items.push({
      id: `pih-${key}`,
      heading: `${planet} — ${houseLabel}`,
      text: `${intro} ${translateSign(lang, pos.sign)} ${pos.degree}°.`,
    });
  }
  return items;
}

function buildAspects(chart: NatalChartData, lang: LangCode): DecodingItem[] {
  const typeLabels = ASPECT_TYPE_LABEL[lang] || ASPECT_TYPE_LABEL.en;
  const hints = ASPECT_HINT[lang] || ASPECT_HINT.en;
  const aspects = calculateNatalAspects(chart).slice(0, 12);
  return aspects.map((a, i) => {
    const p1 = translatePlanet(lang, a.planet1);
    const p2 = translatePlanet(lang, a.planet2);
    const typeName = typeLabels[a.type] || a.type;
    return {
      id: `asp-${i}`,
      heading: `${typeName} ${p1} — ${p2}`,
      text: `${hints[a.type] || ''} (${lang === 'ru' ? 'орб' : lang === 'es' ? 'orbe' : lang === 'ar' ? 'مدار' : 'orb'} ${a.orb.toFixed(1)}°)`,
    };
  });
}

function buildInfo(
  chart: NatalChartData,
  lang: LangCode,
  birth?: { date?: string; time?: string; city?: string; timezone?: string }
): DecodingItem[] {
  const lines: Record<LangCode, string[]> = {
    ru: [
      birth?.date ? `📅 Дата рождения: ${birth.date}` : '',
      birth?.time ? `🕐 Время: ${birth.time}` : '',
      birth?.city ? `🏙️ Город: ${birth.city}` : '',
      birth?.timezone ? `🌍 Часовой пояс: ${birth.timezone}` : '',
      `☀️ Солнце: ${translateSign(lang, chart.sun.sign)} ${chart.sun.degree}°`,
      `🌙 Луна: ${translateSign(lang, chart.moon.sign)} ${chart.moon.degree}°`,
      `↑ Асцендент: ${translateSign(lang, chart.ascendant.sign)} ${chart.ascendant.degree}°`,
      'Система домов: равные дома от асцендента.',
    ],
    en: [
      birth?.date ? `📅 Birth date: ${birth.date}` : '',
      birth?.time ? `🕐 Time: ${birth.time}` : '',
      birth?.city ? `🏙️ City: ${birth.city}` : '',
      birth?.timezone ? `🌍 Timezone: ${birth.timezone}` : '',
      `☀️ Sun: ${translateSign(lang, chart.sun.sign)} ${chart.sun.degree}°`,
      `🌙 Moon: ${translateSign(lang, chart.moon.sign)} ${chart.moon.degree}°`,
      `↑ Ascendant: ${translateSign(lang, chart.ascendant.sign)} ${chart.ascendant.degree}°`,
      'House system: equal houses from Ascendant.',
    ],
    es: [
      birth?.date ? `📅 Fecha: ${birth.date}` : '',
      birth?.time ? `🕐 Hora: ${birth.time}` : '',
      birth?.city ? `🏙️ Ciudad: ${birth.city}` : '',
      birth?.timezone ? `🌍 Zona horaria: ${birth.timezone}` : '',
      `☀️ Sol: ${translateSign(lang, chart.sun.sign)} ${chart.sun.degree}°`,
      `🌙 Luna: ${translateSign(lang, chart.moon.sign)} ${chart.moon.degree}°`,
      `↑ Ascendente: ${translateSign(lang, chart.ascendant.sign)} ${chart.ascendant.degree}°`,
      'Sistema de casas: casas iguales desde el Ascendente.',
    ],
    ar: [
      birth?.date ? `📅 التاريخ: ${birth.date}` : '',
      birth?.time ? `🕐 الوقت: ${birth.time}` : '',
      birth?.city ? `🏙️ المدينة: ${birth.city}` : '',
      birth?.timezone ? `🌍 المنطقة الزمنية: ${birth.timezone}` : '',
      `☀️ الشمس: ${translateSign(lang, chart.sun.sign)} ${chart.sun.degree}°`,
      `🌙 القمر: ${translateSign(lang, chart.moon.sign)} ${chart.moon.degree}°`,
      `↑ الطالع: ${translateSign(lang, chart.ascendant.sign)} ${chart.ascendant.degree}°`,
      'نظام البيوت: بيوت متساوية من الطالع.',
    ],
  };
  const text = (lines[lang] || lines.en).filter(Boolean).join('\n');
  return [{ id: 'info-main', heading: lang === 'ru' ? 'Данные карты' : lang === 'es' ? 'Datos de la carta' : lang === 'ar' ? 'بيانات الخريطة' : 'Chart data', text }];
}

/** Extended aspects including outer planets and Ascendant */
export function calculateNatalAspects(chart: NatalChartData): Aspect[] {
  const planets = [
    'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
    'uranus', 'neptune', 'pluto', 'ascendant',
  ];
  const aspects: Aspect[] = [];
  for (let i = 0; i < planets.length - 1; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const pos1 = planetPosition(chart, planets[i]).longitude;
      const pos2 = planetPosition(chart, planets[j]).longitude;
      let diff = Math.abs(pos1 - pos2);
      if (diff > 180) diff = 360 - diff;
      for (const asp of [
        { angle: 0, orb: 8, type: 'conjunction' },
        { angle: 180, orb: 8, type: 'opposition' },
        { angle: 120, orb: 8, type: 'trine' },
        { angle: 90, orb: 7, type: 'square' },
        { angle: 60, orb: 5, type: 'sextile' },
        { angle: 150, orb: 3, type: 'quincunx' },
        { angle: 30, orb: 2, type: 'semisextile' },
      ]) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= asp.orb) {
          aspects.push({
            planet1: planets[i], planet2: planets[j],
            angle: asp.angle, type: asp.type, orb,
            applying: pos1 < pos2,
          });
        }
      }
    }
  }
  return aspects.sort((a, b) => a.orb - b.orb);
}

/** Parse AI sections marked with [SECTION_NAME] and ### headings */
export function parseAiDecodingSections(aiText: string): Map<string, Map<string, string>> {
  const result = new Map<string, Map<string, string>>();
  if (!aiText) return result;
  const sectionNames = [
    'SUMMARY', 'PLANETS_IN_SIGNS', 'HOUSES_IN_SIGNS',
    'PLANETS_IN_HOUSES', 'ASPECTS',
  ];
  for (const name of sectionNames) {
    const re = new RegExp(`\\[${name}\\]([\\s\\S]*?)(?=\\[${sectionNames.join('\\]|\\[')}\\]|$)`, 'i');
    const m = aiText.match(re);
    if (!m) continue;
    const block = m[1].trim();
    const items = new Map<string, string>();
    const parts = block.split(/^###\s+/m).filter(Boolean);
    for (const part of parts) {
      const nl = part.indexOf('\n');
      if (nl < 0) continue;
      const heading = part.slice(0, nl).trim().toLowerCase();
      const text = part.slice(nl + 1).trim();
      if (heading && text) items.set(heading, text);
    }
    if (parts.length === 0 && block.length > 20 && name === 'SUMMARY') {
      items.set('summary', block);
    }
    result.set(name, items);
  }
  return result;
}

function mergeAiIntoItems(
  items: DecodingItem[],
  aiMap: Map<string, string> | undefined,
): DecodingItem[] {
  if (!aiMap || aiMap.size === 0) return items;
  return items.map(item => {
    const key = item.heading.toLowerCase();
    for (const [aiKey, aiText] of aiMap) {
      if (key.includes(aiKey) || aiKey.includes(key.slice(0, 12))) {
        return { ...item, text: aiText };
      }
    }
    return item;
  });
}

export function buildNatalDecoding(
  chart: NatalChartData,
  langCode?: string | null,
  aiText?: string | null,
  birth?: { date?: string; time?: string; city?: string; timezone?: string }
): NatalDecoding {
  const lang = L(langCode);
  const parsed = parseAiDecodingSections(aiText || '');
  const balance = computeBalance(chart);

  let summary = buildSummary(chart, lang);
  const summaryAi = parsed.get('SUMMARY')?.get('summary');
  if (summaryAi) summary = summaryAi;

  return {
    summary,
    elements: balance.elements,
    qualities: balance.qualities,
    tabLabels: LABELS[lang] || LABELS.en,
    tabs: {
      planetsInSigns: mergeAiIntoItems(buildPlanetsInSigns(chart, lang), parsed.get('PLANETS_IN_SIGNS')),
      housesInSigns: mergeAiIntoItems(buildHousesInSigns(chart, lang), parsed.get('HOUSES_IN_SIGNS')),
      planetsInHouses: mergeAiIntoItems(buildPlanetsInHouses(chart, lang), parsed.get('PLANETS_IN_HOUSES')),
      aspects: mergeAiIntoItems(buildAspects(chart, lang), parsed.get('ASPECTS')),
      info: buildInfo(chart, lang, birth),
    },
  };
}

export function buildDecodingFallbackMarkdown(
  chart: NatalChartData,
  monthKey: string,
  langCode?: string | null
): string {
  const lang = L(langCode);
  const decoding = buildNatalDecoding(chart, lang);
  const lines: string[] = [
    decoding.summary,
    '',
    `*${decoding.tabLabels.planetsInSigns}*`,
    ...decoding.tabs.planetsInSigns.map(i => `*${i.heading}*\n${i.text}`),
    '',
    describeHouses(chart, lang),
    '',
    getNatalFooter(lang),
  ];
  return lines.join('\n\n');
}
