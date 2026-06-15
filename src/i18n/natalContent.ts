import { Aspect, NatalChartData, PlanetPosition, ZODIAC_SIGNS, calculateAspects } from '../astrology/engine';
import { LangCode, normalizeLangCode } from './languages';
import { translatePlanet, translateSign } from './astro';

type HouseInfo = { title: string; description: string };

const HOUSES_RU: Record<number, HouseInfo> = {
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

const HOUSES_EN: Record<number, HouseInfo> = {
  1: { title: 'House of Self (Ascendant)', description: 'Appearance, first impression, behavior, life energy and self-expression.' },
  2: { title: 'House of Finances & Values', description: 'Money, material resources, possessions, talents and what you value.' },
  3: { title: 'House of Communication', description: 'Speech, learning, close environment, siblings, short trips, daily contacts.' },
  4: { title: 'House of Home & Roots', description: 'Home, family, emotional foundation, origins, inner world and security.' },
  5: { title: 'House of Creativity & Love', description: 'Romance, children, hobbies, self-expression, joy, risk and creative projects.' },
  6: { title: 'House of Health & Work', description: 'Routine, service, health, habits, colleagues and daily discipline.' },
  7: { title: 'House of Partnership', description: 'Marriage, business alliances, open enemies, relationship mirror — who you attract.' },
  8: { title: 'House of Transformation', description: 'Crises, inheritance, shared finances, deep psychology, sexuality, rebirth.' },
  9: { title: 'House of Worldview', description: 'Philosophy, higher education, long journeys, faith, meaning and expanding horizons.' },
  10: { title: 'House of Career (MC)', description: 'Profession, status, reputation, ambitions, calling and public image.' },
  11: { title: 'House of Friends & Goals', description: 'Friends, communities, dreams, social projects, hopes and collective ideas.' },
  12: { title: 'House of the Subconscious', description: 'Secrets, solitude, spirituality, karma, hidden fears, intuition and inner work.' },
};

const HOUSES_ES: Record<number, HouseInfo> = {
  1: { title: 'Casa de la personalidad (Ascendente)', description: 'Apariencia, primera impresión, comportamiento, energía vital y expresión personal.' },
  2: { title: 'Casa de finanzas y valores', description: 'Dinero, recursos materiales, posesiones, talentos y lo que valoras.' },
  3: { title: 'Casa de la comunicación', description: 'Habla, aprendizaje, entorno cercano, hermanos, viajes cortos y contactos diarios.' },
  4: { title: 'Casa del hogar y las raíces', description: 'Hogar, familia, base emocional, orígenes, mundo interior y seguridad.' },
  5: { title: 'Casa de la creatividad y el amor', description: 'Romance, hijos, aficiones, expresión, alegría, riesgo y proyectos creativos.' },
  6: { title: 'Casa de la salud y el trabajo', description: 'Rutina, servicio, salud, hábitos, colegas y disciplina cotidiana.' },
  7: { title: 'Casa de la pareja', description: 'Matrimonio, alianzas, enemigos abiertos, espejo relacional — a quién atraes.' },
  8: { title: 'Casa de la transformación', description: 'Crisis, herencia, finanzas compartidas, psicología profunda, sexualidad y renacimiento.' },
  9: { title: 'Casa de la filosofía', description: 'Filosofía, educación superior, viajes lejanos, fe, sentido y ampliación de horizontes.' },
  10: { title: 'Casa de la carrera (MC)', description: 'Profesión, estatus, reputación, ambiciones, vocación e imagen pública.' },
  11: { title: 'Casa de amigos y metas', description: 'Amigos, comunidades, sueños, proyectos sociales, esperanzas e ideas colectivas.' },
  12: { title: 'Casa del subconsciente', description: 'Secretos, soledad, espiritualidad, karma, miedos ocultos, intuición y trabajo interior.' },
};

const HOUSES_AR: Record<number, HouseInfo> = {
  1: { title: 'بيت الشخصية (الطالع)', description: 'المظهر، الانطباع الأول، السلوك، الطاقة الحياتية والتعبير عن الذات.' },
  2: { title: 'بيت المال والقيم', description: 'المال، الموارد المادية، الممتلكات، المواهب وما تقدّره.' },
  3: { title: 'بيت التواصل', description: 'الكلام، التعلّم، البيئة القريبة، الإخوة، الرحلات القصيرة والاتصالات اليومية.' },
  4: { title: 'بيت المنزل والجذور', description: 'المنزل، العائلة، القاعدة العاطفية، الأصول، العالم الداخلي والأمان.' },
  5: { title: 'بيت الإبداع والحب', description: 'الرومانسية، الأطفال، الهوايات، التعبير، الفرح، المخاطرة والمشاريع الإبداعية.' },
  6: { title: 'بيت الصحة والعمل', description: 'الروتين، الخدمة، الصحة، العادات، الزملاء والانضباط اليومي.' },
  7: { title: 'بيت الشراكة', description: 'الزواج، التحالفات، الأعداء الظاهرون، مرآة العلاقات — من تجذب إليك.' },
  8: { title: 'بيت التحول', description: 'الأزمات، الميراث، الأموال المشتركة، علم النفس العميق، الجنسانية والولادة الجديدة.' },
  9: { title: 'بيت الفلسفة', description: 'الفلسفة، التعليم العالي، السفر البعيد، الإيمان، المعنى وتوسيع الآفاق.' },
  10: { title: 'بيت المهنة (وسط السماء)', description: 'المهنة، المكانة، السمعة، الطموح، الدعوة والصورة العامة.' },
  11: { title: 'بيت الأصدقاء والأهداف', description: 'الأصدقاء، المجتمعات، الأحلام، المشاريع الاجتماعية، الآمال والأفكار الجماعية.' },
  12: { title: 'بيت اللاوعي', description: 'الأسرار، العزلة، الروحانية، الكارما، المخاوف الخفية، الحدس والعمل الداخلي.' },
};

const HOUSES_BY_LANG: Record<LangCode, Record<number, HouseInfo>> = {
  ru: HOUSES_RU,
  en: HOUSES_EN,
  es: HOUSES_ES,
  ar: HOUSES_AR,
};

const SIGN_TRAITS: Partial<Record<LangCode, Record<string, string>>> = {
  ru: {
    'Овен': 'инициатива, смелость, прямота', 'Телец': 'стабильность, чувственность, практичность',
    'Близнецы': 'общение, любознательность, гибкость', 'Рак': 'забота, интуиция, эмоциональная глубина',
    'Лев': 'харизма, творчество, лидерство', 'Дева': 'анализ, порядок, служение',
    'Весы': 'гармония, партнёрство, эстетика', 'Скорпион': 'трансформация, страсть, глубина',
    'Стрелец': 'свобода, философия, оптимизм', 'Козерог': 'дисциплина, амбиции, структура',
    'Водолей': 'новаторство, независимость, идеи', 'Рыбы': 'интуиция, сострадание, воображение',
  },
  en: {
    'Овен': 'initiative, courage, directness', 'Телец': 'stability, sensuality, practicality',
    'Близнецы': 'communication, curiosity, flexibility', 'Рак': 'care, intuition, emotional depth',
    'Лев': 'charisma, creativity, leadership', 'Дева': 'analysis, order, service',
    'Весы': 'harmony, partnership, aesthetics', 'Скорпион': 'transformation, passion, depth',
    'Стрелец': 'freedom, philosophy, optimism', 'Козерог': 'discipline, ambition, structure',
    'Водолей': 'innovation, independence, ideas', 'Рыбы': 'intuition, compassion, imagination',
  },
  es: {
    'Овен': 'iniciativa, valentía, franqueza', 'Телец': 'estabilidad, sensualidad, practicidad',
    'Близнецы': 'comunicación, curiosidad, flexibilidad', 'Рак': 'cuidado, intuición, profundidad emocional',
    'Лев': 'carisma, creatividad, liderazgo', 'Дева': 'análisis, orden, servicio',
    'Весы': 'armonía, pareja, estética', 'Скорпион': 'transformación, pasión, profundidad',
    'Стрелец': 'libertad, filosofía, optimismo', 'Козерог': 'disciplina, ambición, estructura',
    'Водолей': 'innovación, independencia, ideas', 'Рыбы': 'intuición, compasión, imaginación',
  },
  ar: {
    'Овен': 'المبادرة، الشجاعة، الصراحة', 'Телец': 'الاستقرار، الحسية، العملية',
    'Близнецы': 'التواصل، الفضول، المرونة', 'Рак': 'الرعاية، الحدس، العمق العاطفي',
    'Лев': 'الكاريزما، الإبداع، القيادة', 'Дева': 'التحليل، النظام، الخدمة',
    'Весы': 'الانسجام، الشراكة، الجمال', 'Скорпион': 'التحول، الشغف، العمق',
    'Стрелец': 'الحرية، الفلسفة، التفاؤل', 'Козерог': 'الانضباط، الطموح، البنية',
    'Водолей': 'الابتكار، الاستقلال، الأفكار', 'Рыбы': 'الحدس، التعاطف، الخيال',
  },
};

const HOUSE_HEADERS: Record<LangCode, string> = {
  ru: '🏠 *Дома гороскопа (все 12):*',
  en: '🏠 *Houses (all 12):*',
  es: '🏠 *Casas del horóscopo (las 12):*',
  ar: '🏠 *بيوت الخريطة (الاثنا عشر):*',
};

const HOUSE_CUSP: Record<LangCode, string> = {
  ru: 'кусп в', en: 'cusp in', es: 'cúspide en', ar: 'الحد في',
};

const HOUSE_TRAIT_LINE: Record<LangCode, (sign: string, traits: string) => string> = {
  ru: (sign, traits) => `_В этом доме проявляются качества ${sign}: ${traits}._`,
  en: (sign, traits) => `_In this house, ${sign} qualities manifest: ${traits}._`,
  es: (sign, traits) => `_En esta casa se manifiestan las cualidades de ${sign}: ${traits}._`,
  ar: (sign, traits) => `_في هذا البيت تتجلّى صفات ${sign}: ${traits}._`,
};

const NATAL_FOOTERS: Record<LangCode, string> = {
  ru: '_Обновляется ежемесячно. Данные рассчитаны по дате, времени и месту рождения._',
  en: '_Updated monthly. Calculated from your birth date, time and place._',
  es: '_Se actualiza mensualmente. Calculado según tu fecha, hora y lugar de nacimiento._',
  ar: '_يُحدَّث شهرياً. محسوب من تاريخ ومكان ووقت ميلادك._',
};

const NATAL_AI_PROMPT: Record<LangCode, string> = {
  ru: 'Создай подробную расшифровку натальной карты для пользователя. Используй ТОЧНО эти маркеры секций и заголовки ### для каждого пункта.\n\n[SUMMARY]\n2-3 предложения: доминирующие стихии, качества и сочетание Солнца, Луны, Асцендента.\n\n[PLANETS_IN_SIGNS]\nДля Солнца, Луны, Меркурия, Венеры, Марса, Юпитера, Сатурна, Урана, Нептуна, Плутона, Асцендента:\n### Название планеты в знаке\n2-4 предложения персональной интерпретации.\n\n[HOUSES_IN_SIGNS]\nДля каждого из 12 домов:\n### N дом в знаке\n1-2 предложения что это значит для жизни.\n\n[PLANETS_IN_HOUSES]\nДля каждой планеты:\n### Планета в N доме\n2-3 предложения как проявляется в жизни.\n\n[ASPECTS]\nДля 8-10 главных аспектов:\n### Тип аспекта Планета1 — Планета2\n2-3 предложения с практическим советом.\n\nФормат Telegram: *жирный*, _курсив_, без ** и ### в тексте (только как разделители секций выше). Пиши на русском.',
  en: 'Create a detailed natal chart decoding. Use EXACT section markers and ### headings per item.\n\n[SUMMARY]\n2-3 sentences: dominant elements, qualities, Sun/Moon/Asc blend.\n\n[PLANETS_IN_SIGNS]\nFor Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Ascendant:\n### Planet in Sign\n2-4 personalized sentences.\n\n[HOUSES_IN_SIGNS]\nFor all 12 houses:\n### Nth house in Sign\n1-2 sentences life meaning.\n\n[PLANETS_IN_HOUSES]\nFor each planet:\n### Planet in Nth house\n2-3 sentences life manifestation.\n\n[ASPECTS]\nFor 8-10 main aspects:\n### Aspect type Planet1 — Planet2\n2-3 sentences with practical advice.\n\nTelegram format: *bold*, _italic_, no ** or ### in body text. Write in English.',
  es: 'Crea una interpretación detallada de la carta natal. Usa EXACTAMENTE estos marcadores y encabezados ###.\n\n[SUMMARY]\n2-3 frases: elementos, cualidades, mezcla Sol/Luna/Asc.\n\n[PLANETS_IN_SIGNS]\nPara Sol, Luna, Mercurio, Venus, Marte, Júpiter, Saturno, Urano, Neptuno, Plutón, Ascendente:\n### Planeta en Signo\n2-4 frases personalizadas.\n\n[HOUSES_IN_SIGNS]\nPara las 12 casas:\n### Casa N en Signo\n1-2 frases de significado vital.\n\n[PLANETS_IN_HOUSES]\nPara cada planeta:\n### Planeta en casa N\n2-3 frases de manifestación.\n\n[ASPECTS]\nPara 8-10 aspectos principales:\n### Tipo Planeta1 — Planeta2\n2-3 frases con consejo práctico.\n\nFormato Telegram: *negrita*, _cursiva_. Escribe en español.',
  ar: 'أنشئ تفسيراً مفصّلاً لخريطة الميلاد. استخدم العلامات والعناوين ### بالضبط.\n\n[SUMMARY]\n2-3 جمل: العناصر والصفات ومزيج الشمس/القمر/الطالع.\n\n[PLANETS_IN_SIGNS]\nلكل كوكب:\n### الكوكب في البرج\n2-4 جمل شخصية.\n\n[HOUSES_IN_SIGNS]\nللاثني عشر بيتاً:\n### البيت N في البرج\n1-2 جملة.\n\n[PLANETS_IN_HOUSES]\nلكل كوكب:\n### الكوكب في البيت N\n2-3 جمل.\n\n[ASPECTS]\nلـ 8-10 جوانب:\n### نوع الكوكب1 — الكوكب2\n2-3 جمل مع نصيحة.\n\nتنسيق Telegram: *عريض*، _مائل_. اكتب بالعربية.',
};

const ASPECT_TYPE: Partial<Record<LangCode, Record<string, string>>> = {
  ru: { conjunction: 'Соединение', opposition: 'Оппозиция', trine: 'Трин', square: 'Квадрат', sextile: 'Секстиль', quincunx: 'Квинконс', semisextile: 'Полусекстиль' },
  en: { conjunction: 'Conjunction', opposition: 'Opposition', trine: 'Trine', square: 'Square', sextile: 'Sextile', quincunx: 'Quincunx', semisextile: 'Semisextile' },
  es: { conjunction: 'Conjunción', opposition: 'Oposición', trine: 'Trígono', square: 'Cuadratura', sextile: 'Sextil', quincunx: 'Quincuncio', semisextile: 'Semisextil' },
  ar: { conjunction: 'اقتران', opposition: 'تقابل', trine: 'تثليث', square: 'تربيع', sextile: 'تسديس', quincunx: 'كوينكونس', semisextile: 'نصف تسديس' },
};

const ASPECT_MEANING: Partial<Record<LangCode, Record<string, string>>> = {
  ru: {
    conjunction: 'Планеты сливаются — их темы усиливают друг друга. Ключевая точка карты.',
    opposition: 'Полярность и баланс. Важно интегрировать противоположные качества.',
    trine: 'Гармоничный поток энергии. Таланты даются легко, используйте их осознанно.',
    square: 'Внутреннее напряжение и вызов. Стимул к росту через преодоление препятствий.',
    sextile: 'Благоприятные возможности. Требуют небольших усилий для реализации.',
    quincunx: 'Необходимость адаптации и корректировки подхода.',
    semisextile: 'Тонкая связь, требующая внимания к деталям.',
  },
  en: {
    conjunction: 'Planets merge — their themes amplify each other. A key chart point.',
    opposition: 'Polarity and balance. Integrate opposite qualities.',
    trine: 'Harmonious energy flow. Talents come easily — use them consciously.',
    square: 'Inner tension and challenge. Growth through overcoming obstacles.',
    sextile: 'Favorable opportunities. Require small effort to realize.',
    quincunx: 'Need for adaptation and adjusting your approach.',
    semisextile: 'Subtle link requiring attention to detail.',
  },
  es: {
    conjunction: 'Los planetas se fusionan — sus temas se refuerzan. Punto clave de la carta.',
    opposition: 'Polaridad y equilibrio. Integra cualidades opuestas.',
    trine: 'Flujo armónico de energía. Los talentos llegan con facilidad.',
    square: 'Tensión interna y desafío. Crecimiento superando obstáculos.',
    sextile: 'Oportunidades favorables. Requieren poco esfuerzo.',
    quincunx: 'Necesidad de adaptación y ajuste del enfoque.',
    semisextile: 'Vínculo sutil que requiere atención al detalle.',
  },
  ar: {
    conjunction: 'الكواكب تندمج — مواضيعها تتعزز. نقطة محورية في الخريطة.',
    opposition: 'قطبية وتوازن. دمج الصفات المتعارضة مهم.',
    trine: 'تدفق طاقة متناغم. المواهب تأتي بسهولة.',
    square: 'توتر داخلي وتحدٍّ. نمو عبر تجاوز العقبات.',
    sextile: 'فرص مواتية. تحتاج جهداً بسيطاً.',
    quincunx: 'حاجة للتكيف وتعديل النهج.',
    semisextile: 'رابط دقيق يحتاج انتباهاً للتفاصيل.',
  },
};

function lang(code?: string | null): LangCode {
  return normalizeLangCode(code);
}

function housesFor(code: LangCode): Record<number, HouseInfo> {
  return HOUSES_BY_LANG[code] || HOUSES_EN;
}

function traitsFor(code: LangCode): Record<string, string> {
  return SIGN_TRAITS[code] || SIGN_TRAITS.en || {};
}

function aspectTypes(code: LangCode): Record<string, string> {
  return ASPECT_TYPE[code] || ASPECT_TYPE.en || {};
}

function aspectMeanings(code: LangCode): Record<string, string> {
  return ASPECT_MEANING[code] || ASPECT_MEANING.en || {};
}

function formatPlanetLine(pos: PlanetPosition, key: string, code: LangCode): string {
  const retro = pos.retrograde
    ? (code === 'ru' ? ' (ретроград)' : code === 'es' ? ' (retrógrado)' : code === 'ar' ? ' (تراجعي)' : ' (retrograde)')
    : '';
  return `${translatePlanet(code, key)}: ${translateSign(code, pos.sign)} ${pos.degree}°${pos.minute}'${retro}`;
}

function describeAspect(a: Aspect, code: LangCode): string {
  const p1 = translatePlanet(code, a.planet1);
  const p2 = translatePlanet(code, a.planet2);
  const typeName = aspectTypes(code)[a.type] || a.type;
  const meaning = aspectMeanings(code)[a.type] || '';
  const strong = a.orb < 3
    ? (code === 'ru' ? ' *(сильный аспект)*' : code === 'es' ? ' *(aspecto fuerte)*' : code === 'ar' ? ' *(جانب قوي)*' : ' *(strong aspect)*')
    : '';
  const orbLabel = code === 'ru' ? 'орб' : code === 'es' ? 'orbe' : code === 'ar' ? 'مدار' : 'orb';
  return `• *${p1} ${typeName} ${p2}* (${orbLabel} ${a.orb.toFixed(1)}°)${strong}\n  ${meaning}`;
}

export function describeHouses(chart: NatalChartData, langCode?: string | null): string {
  const L = lang(langCode);
  const houses = housesFor(L);
  const traits = traitsFor(L);
  const header = HOUSE_HEADERS[L] || HOUSE_HEADERS.en;
  const cuspWord = HOUSE_CUSP[L] || HOUSE_CUSP.en || 'cusp in';
  const traitLine = HOUSE_TRAIT_LINE[L] || HOUSE_TRAIT_LINE.en;

  const lines: string[] = ['', header, ''];
  for (let i = 0; i < 12; i++) {
    const house = houses[i + 1];
    const signRu = ZODIAC_SIGNS[Math.floor(chart.houses[i] / 30)];
    const sign = translateSign(L, signRu);
    const degree = Math.floor(chart.houses[i] % 30);
    const trait = traits[signRu];
    lines.push(
      `*${i + 1}. ${house.title}* — ${cuspWord} *${sign}* ${degree}°\n` +
      `${house.description}` +
      (trait && traitLine ? `\n${traitLine(sign, trait)}` : '')
    );
  }
  return lines.join('\n\n');
}

export function buildTriadAndAspectsFallback(chart: NatalChartData, monthKey: string, langCode?: string | null): string {
  const L = lang(langCode);
  const aspects = calculateAspects(chart).slice(0, 8);
  const t = traitsFor(L);

  const titles: Record<LangCode, { main: string; triad: string; planets: string; aspects: string; calm: string }> = {
    ru: { main: 'Натальная карта', triad: 'Триада личности', planets: 'Планеты в знаках', aspects: 'Ключевые аспекты', calm: 'Гармоничная карта без выраженных напряжений — энергии текут ровно.' },
    en: { main: 'Natal Chart', triad: 'Personality Triad', planets: 'Planets in Signs', aspects: 'Key Aspects', calm: 'A harmonious chart with smooth energy flow.' },
    es: { main: 'Carta natal', triad: 'Tríada de personalidad', planets: 'Planetas en signos', aspects: 'Aspectos clave', calm: 'Carta armoniosa con energía fluida.' },
    ar: { main: 'خريطة الميلاد', triad: 'ثالوث الشخصية', planets: 'الكواكب في الأبراج', aspects: 'الجوانب الرئيسية', calm: 'خريطة متناغمة مع تدفق طاقة سلس.' },
  };
  const lbl = titles[L] || titles.en;

  const lines: string[] = [
    `🌟 *${lbl.main} — ${monthKey}*`,
    '',
    `━━ *${lbl.triad}* ━━`,
    `☀️ *${translatePlanet(L, 'sun')} ${translateSign(L, chart.sun.sign)}* — ${t[chart.sun.sign] || chart.sun.sign}.`,
    `🌙 *${translatePlanet(L, 'moon')} ${translateSign(L, chart.moon.sign)}* — ${t[chart.moon.sign] || chart.moon.sign}.`,
    `↑ *${translatePlanet(L, 'ascendant')} ${translateSign(L, chart.ascendant.sign)}* — ${t[chart.ascendant.sign] || chart.ascendant.sign}.`,
    '',
    `━━ *${lbl.planets}* ━━`,
    formatPlanetLine(chart.mercury, 'mercury', L),
    formatPlanetLine(chart.venus, 'venus', L),
    formatPlanetLine(chart.mars, 'mars', L),
    formatPlanetLine(chart.jupiter, 'jupiter', L),
    formatPlanetLine(chart.saturn, 'saturn', L),
    '',
    `━━ *${lbl.aspects}* ━━`,
  ];

  if (aspects.length === 0) {
    lines.push(lbl.calm);
  } else {
    for (const a of aspects) lines.push(describeAspect(a, L));
  }
  return lines.join('\n');
}

export function getNatalAiPrompt(langCode?: string | null): string {
  const L = lang(langCode);
  return NATAL_AI_PROMPT[L] || NATAL_AI_PROMPT.en;
}

export function getNatalFooter(langCode?: string | null): string {
  const L = lang(langCode);
  return NATAL_FOOTERS[L] || NATAL_FOOTERS.en;
}

export function isCompleteNatalInterpretation(content: string): boolean {
  if (content.length < 600) return false;
  return content.includes('[PLANETS_IN_SIGNS]') || content.includes('🏠') || /12\.\s/.test(content);
}
