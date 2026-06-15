import { LangCode, normalizeLangCode } from './languages';
import { ZodiacSign, ZODIAC_SIGNS } from '../astrology/engine';

type PlanetAspects = Record<string, string>;
type PlanetMap = Record<string, PlanetAspects>;
type ThemesMap = Record<ZodiacSign, string[]>;
type ColorsMap = Record<ZodiacSign, string>;

const PLANET_MEANINGS: Record<LangCode, PlanetMap> = {
  ru: {
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
  },
  en: {
    sun: {
      conjunction: 'The Sun boosts your vitality and self-expression',
      trine: 'Solar energy harmoniously supports your goals',
      sextile: 'A favorable time for creativity and leadership',
      opposition: 'Tension between personal desires and external circumstances',
      square: 'Effort is needed to overcome obstacles',
    },
    moon: {
      conjunction: 'Emotions are heightened, intuition is strong',
      trine: 'Inner harmony and emotional balance',
      sextile: 'Good time for family matters and communication',
      opposition: 'Emotional swings, possible misunderstandings',
      square: 'Emotional tension calls for caution',
    },
    mercury: {
      conjunction: 'Mind is sharp, talks and negotiations go well',
      trine: 'Clear thinking, documents and contracts are favorable',
      sextile: 'Great time for learning and communication',
      opposition: 'Disagreements possible, double-check information',
      square: 'Be careful with contracts and communication',
    },
    venus: {
      conjunction: 'Love and harmony in relationships are amplified',
      trine: 'Charm and attractiveness are at a peak',
      sextile: 'Favorable for romance and finances',
      opposition: 'Possible disappointments in relationships',
      square: 'Financial matters require caution',
    },
    mars: {
      conjunction: 'Energy and ambition peak — act decisively',
      trine: 'Physical effort pays off, sports are favorable',
      sextile: 'A good day for active action and initiative',
      opposition: 'Avoid conflicts, control aggression',
      square: 'Be careful with impulsive decisions',
    },
    jupiter: {
      conjunction: 'Luck smiles on you — good for expansion and growth',
      trine: 'Excellent time for new beginnings and travel',
      sextile: 'Opportunities for growth and prosperity open up',
      opposition: 'Do not overestimate your strength',
      square: 'Avoid excessive optimism',
    },
    saturn: {
      conjunction: 'Time for work and responsibility — stay disciplined',
      trine: 'Structure and order help you reach goals',
      sextile: 'Practical effort will bear fruit',
      opposition: 'Delays and limitations are possible',
      square: 'Patience and persistence are your allies',
    },
  },
  es: {
    sun: {
      conjunction: 'El Sol potencia tu vitalidad y autoexpresión',
      trine: 'La energía solar apoya armoniosamente tus metas',
      sextile: 'Momento favorable para creatividad y liderazgo',
      opposition: 'Tensión entre deseos personales y circunstancias externas',
      square: 'Se requiere esfuerzo para superar obstáculos',
    },
    moon: {
      conjunction: 'Las emociones están intensas, la intuición es fuerte',
      trine: 'Armonía interior y equilibrio emocional',
      sextile: 'Buen momento para la familia y la comunicación',
      opposition: 'Altibajos emocionales, posibles malentendidos',
      square: 'La tensión emocional pide cautela',
    },
    mercury: {
      conjunction: 'La mente está aguda, las negociaciones van bien',
      trine: 'Pensamiento claro, documentos y contratos favorables',
      sextile: 'Buen momento para aprender y comunicar',
      opposition: 'Posibles desacuerdos, verifica la información',
      square: 'Cuidado con contratos y comunicación',
    },
    venus: {
      conjunction: 'El amor y la armonía en las relaciones se intensifican',
      trine: 'El encanto y la atracción están en su punto',
      sextile: 'Favorable para romance y finanzas',
      opposition: 'Posibles decepciones en las relaciones',
      square: 'Los temas financieros requieren cautela',
    },
    mars: {
      conjunction: 'Energía y ambición al máximo — actúa con decisión',
      trine: 'El esfuerzo físico da frutos, el deporte es favorable',
      sextile: 'Buen día para acción activa e iniciativa',
      opposition: 'Evita conflictos, controla la agresión',
      square: 'Cuidado con decisiones impulsivas',
    },
    jupiter: {
      conjunction: 'La suerte te sonríe — bueno para expansión y crecimiento',
      trine: 'Excelente momento para nuevos comienzos y viajes',
      sextile: 'Se abren oportunidades de crecimiento y prosperidad',
      opposition: 'No sobreestimes tus fuerzas',
      square: 'Evita el optimismo excesivo',
    },
    saturn: {
      conjunction: 'Tiempo de trabajo y responsabilidad — sé disciplinado',
      trine: 'La estructura y el orden ayudan a alcanzar metas',
      sextile: 'El esfuerzo práctico dará frutos',
      opposition: 'Posibles retrasos y limitaciones',
      square: 'La paciencia y la persistencia son tus aliadas',
    },
  },
  ar: {
    sun: {
      conjunction: 'الشمس تعزّز حيويتك وتعبيرك عن الذات',
      trine: 'طاقة الشمس تدعم أهدافك بتناغم',
      sextile: 'وقت مواتٍ للإبداع والقيادة',
      opposition: 'توتر بين الرغبات الشخصية والظروف الخارجية',
      square: 'يُطلَب جهد لتجاوز العقبات',
    },
    moon: {
      conjunction: 'العواطف حادة والحدس قوي',
      trine: 'انسجام داخلي وتوازن عاطفي',
      sextile: 'وقت جيد للأسرة والتواصل',
      opposition: 'تقلبات عاطفية واحتمال سوء فهم',
      square: 'التوتر العاطفي يتطلب حذراً',
    },
    mercury: {
      conjunction: 'الذهن حاد والمفاوضات تسير جيداً',
      trine: 'تفكير واضح، المستندات والعقود مواتية',
      sextile: 'وقت ممتاز للتعلم والتواصل',
      opposition: 'احتمال خلافات، تحقق من المعلومات',
      square: 'كن حذراً في العقود والتواصل',
    },
    venus: {
      conjunction: 'الحب والانسجام في العلاقات يتعززان',
      trine: 'الجاذبية والسحر في ذروتهما',
      sextile: 'مواتٍ للرومانسية والمال',
      opposition: 'احتمال خيبات في العلاقات',
      square: 'الأمور المالية تتطلب حذراً',
    },
    mars: {
      conjunction: 'الطاقة والطموح في ذروتهما — تصرف بحزم',
      trine: 'الجهد البدني يؤتي ثماره، الرياضة مواتية',
      sextile: 'يوم جيد للعمل النشط والمبادرة',
      opposition: 'تجنب الصراعات، تحكم بالعدوانية',
      square: 'احذر القرارات الاندفاعية',
    },
    jupiter: {
      conjunction: 'الحظ يبتسم — جيد للتوسع والنمو',
      trine: 'وقت ممتاز لبدايات جديدة وسفر',
      sextile: 'فرص للنمو والازدهار تُفتح',
      opposition: 'لا تبالغ في تقدير قوتك',
      square: 'تجنب التفاؤل المفرط',
    },
    saturn: {
      conjunction: 'وقت العمل والمسؤولية — كن منضبطاً',
      trine: 'النظام والترتيب يساعدان على تحقيق الأهداف',
      sextile: 'الجهد العملي سيثمر',
      opposition: 'احتمال تأخير وقيود',
      square: 'الصبر والمثابرة حليفاك',
    },
  },
};

const SIGN_THEMES: Record<LangCode, ThemesMap> = {
  ru: {
    'Овен': ['Ваша энергия неукротима — направьте её в нужное русло', 'День для смелых решений и новых начинаний', 'Лидерские качества помогут вам сегодня', 'Действуйте интуитивно, не раздумывая слишком долго'],
    'Телец': ['Стабильность и комфорт — ваши главные союзники', 'День благоприятен для финансовых решений', 'Наслаждайтесь красотой жизни и маленькими радостями', 'Терпение принесёт долгожданные результаты'],
    'Близнецы': ['Общительность и остроумие открывают двери', 'Информация — ваш ресурс сегодня', 'Не распыляйтесь — сфокусируйтесь на главном', 'Лёгкость в общении поможет решить трудные вопросы'],
    'Рак': ['Интуиция сильна, доверяйте своим ощущениям', 'Дом и семья приносят особую радость сегодня', 'Эмоциональная поддержка близких укрепляет вас', 'Прислушайтесь к снам и внутренним сигналам'],
    'Лев': ['Сияйте — сегодня ваш день для самовыражения', 'Творчество и искусство вдохновляют вас', 'Признание заслуг не заставит себя ждать', 'Щедрость и великодушие привлекают удачу'],
    'Дева': ['Внимание к деталям принесёт отличные результаты', 'Анализ и планирование — ваши сильные стороны', 'День для наведения порядка и систематизации', 'Здоровье и рутина требуют внимания'],
    'Весы': ['Гармония и баланс — ключ к успеху дня', 'Отношения требуют внимания и такта', 'Эстетика и красота вдохновляют вас', 'Дипломатия поможет в сложных ситуациях'],
    'Скорпион': ['Глубина и проницательность — ваши козыри', 'Трансформация и обновление на горизонте', 'Интуиция подсказывает верный путь', 'Страсть и решимость усиливают влияние'],
    'Стрелец': ['Оптимизм и авантюризм открывают горизонты', 'Путешествия и обучение приносят радость', 'Философский взгляд помогает принять решения', 'Свобода и новые впечатления заряжают энергией'],
    'Козерог': ['Дисциплина и целеустремлённость ведут к успеху', 'Карьерные вопросы требуют внимания', 'Терпение и настойчивость окупятся', 'Практичность — ваш лучший советчик'],
    'Водолей': ['Оригинальность и независимость выделяют вас', 'Новые идеи находят поддержку', 'Дружба и сообщество важны сегодня', 'Инновации и перемены на пользу'],
    'Рыбы': ['Чуткость и сострадание открывают сердца', 'Творческое вдохновение достигает пика', 'Медитация и уединение восстанавливают силы', 'Мечты подсказывают правильный путь'],
  },
  en: {
    'Овен': ['Your energy is unstoppable — channel it wisely', 'A day for bold decisions and new beginnings', 'Leadership qualities will help you today', 'Act on intuition without overthinking'],
    'Телец': ['Stability and comfort are your allies', 'A favorable day for financial decisions', 'Enjoy life\'s beauty and small joys', 'Patience will bring long-awaited results'],
    'Близнецы': ['Sociability and wit open doors', 'Information is your resource today', 'Stay focused — avoid scattering your energy', 'Ease in communication helps solve tough issues'],
    'Рак': ['Intuition is strong — trust your feelings', 'Home and family bring special joy today', 'Emotional support from loved ones strengthens you', 'Listen to dreams and inner signals'],
    'Лев': ['Shine — today is your day for self-expression', 'Creativity and art inspire you', 'Recognition of your merits is coming', 'Generosity and magnanimity attract luck'],
    'Дева': ['Attention to detail brings excellent results', 'Analysis and planning are your strengths', 'A day for order and organization', 'Health and routine need attention'],
    'Весы': ['Harmony and balance are the key to success', 'Relationships need care and tact', 'Aesthetics and beauty inspire you', 'Diplomacy helps in difficult situations'],
    'Скорпион': ['Depth and insight are your trump cards', 'Transformation and renewal are on the horizon', 'Intuition points the right way', 'Passion and determination amplify your influence'],
    'Стрелец': ['Optimism and adventure open horizons', 'Travel and learning bring joy', 'A philosophical outlook helps decisions', 'Freedom and new experiences energize you'],
    'Козерог': ['Discipline and focus lead to success', 'Career matters need attention', 'Patience and persistence will pay off', 'Practicality is your best advisor'],
    'Водолей': ['Originality and independence set you apart', 'New ideas find support', 'Friendship and community matter today', 'Innovation and change work in your favor'],
    'Рыбы': ['Sensitivity and compassion open hearts', 'Creative inspiration reaches its peak', 'Meditation and solitude restore strength', 'Dreams hint at the right path'],
  },
  es: {
    'Овен': ['Tu energía es imparable — canalízala bien', 'Día de decisiones audaces y nuevos comienzos', 'Cualidades de liderazgo te ayudarán hoy', 'Actúa con intuición sin pensarlo demasiado'],
    'Телец': ['Estabilidad y confort son tus aliados', 'Día favorable para decisiones financieras', 'Disfruta la belleza de la vida', 'La paciencia traerá resultados esperados'],
    'Близнецы': ['Sociabilidad e ingenio abren puertas', 'La información es tu recurso hoy', 'Concéntrate — evita dispersarte', 'La facilidad al comunicar resuelve lo difícil'],
    'Рак': ['La intuición es fuerte — confía en tus sensaciones', 'Hogar y familia traen alegría especial', 'El apoyo emocional te fortalece', 'Escucha sueños y señales internas'],
    'Лев': ['Brilla — hoy es tu día de autoexpresión', 'Creatividad y arte te inspiran', 'El reconocimiento no tardará', 'Generosidad y magnanimidad atraen suerte'],
    'Дева': ['Atención al detalle trae excelentes resultados', 'Análisis y planificación son tus fortalezas', 'Día para orden y organización', 'Salud y rutina requieren atención'],
    'Весы': ['Armonía y equilibrio son la clave del éxito', 'Las relaciones piden tacto', 'Estética y belleza te inspiran', 'La diplomacia ayuda en situaciones difíciles'],
    'Скорпион': ['Profundidad e intuición son tus ventajas', 'Transformación y renovación en el horizonte', 'La intuición señala el camino correcto', 'Pasión y determinación amplifican tu influencia'],
    'Стрелец': ['Optimismo y aventura abren horizontes', 'Viajes y aprendizaje traen alegría', 'Una mirada filosófica ayuda a decidir', 'Libertad y nuevas experiencias te energizan'],
    'Козерог': ['Disciplina y enfoque llevan al éxito', 'Temas de carrera requieren atención', 'Paciencia y persistencia darán frutos', 'Practicidad es tu mejor consejera'],
    'Водолей': ['Originalidad e independencia te distinguen', 'Nuevas ideas encuentran apoyo', 'Amistad y comunidad importan hoy', 'Innovación y cambio juegan a tu favor'],
    'Рыбы': ['Sensibilidad y compasión abren corazones', 'Inspiración creativa en su punto', 'Meditación y soledad restauran fuerzas', 'Los sueños indican el camino correcto'],
  },
  ar: {
    'Овен': ['طاقتك لا تُقهر — وجّهها بحكمة', 'يوم للقرارات الجريئة والبدايات الجديدة', 'صفات القيادة تساعدك اليوم', 'تصرف بحدس دون إفراط في التفكير'],
    'Телец': ['الاستقرار والراحة حليفاك', 'يوم مواتٍ للقرارات المالية', 'استمتع بجمال الحياة', 'الصبر يجلب نتائج طال انتظارها'],
    'Близнецы': ['التواصل والذكاء يفتحان الأبواب', 'المعلومات موردك اليوم', 'ركّز — تجنب التشتت', 'سهولة التواصل تحل الأمور الصعبة'],
    'Рак': ['الحدس قوي — ثق بمشاعرك', 'البيت والعائلة يجلبان فرحاً خاصاً', 'الدعم العاطفي يقوّيك', 'استمع للأحلام والإشارات الداخلية'],
    'Лев': ['تألّق — اليوم لك للتعبير عن ذاتك', 'الإبداع والفن يلهمونك', 'الاعتراف بجهودك قادم', 'الكرم والسخاء يجلبان الحظ'],
    'Дева': ['الاهتمام بالتفاصيل يجلب نتائج ممتازة', 'التحليل والتخطيط نقاط قوتك', 'يوم للنظام والتنظيم', 'الصحة والروتين يحتاجان اهتماماً'],
    'Весы': ['الانسجام والتوازن مفتاح النجاح', 'العلاقات تحتاج لطفاً', 'الجمال والفن يلهمونك', 'الدبلوماسية تساعد في المواقف الصعبة'],
    'Скорпион': ['العمق والبصيرة أوراقك الرابحة', 'تحول وتجديد في الأفق', 'الحدس يشير للطريق الصحيح', 'الشغف والعزم يعززان نفوذك'],
    'Стрелец': ['التفاؤل والمغامرة يفتحان آفاقاً', 'السفر والتعلم يجلبان الفرح', 'نظرة فلسفية تساعد على القرار', 'الحرية والتجارب الجديدة تمنحك طاقة'],
    'Козерог': ['الانضباط والتركيز يقودان للنجاح', 'مسائل المهنة تحتاج اهتماماً', 'الصبر والمثابرة ستثمر', 'العملية أفضل مستشار لك'],
    'Водолей': ['الأصالة والاستقلالية تميزانك', 'أفكار جديدة تجد دعماً', 'الصداقة والمجتمع مهمان اليوم', 'الابتكار والتغيير لصالحك'],
    'Рыбы': ['الحساسية والتعاطف يفتحان القلوب', 'الإلهام الإبداعي في ذروته', 'التأمل والعزلة يستعيدان القوة', 'الأحلام تشير للطريق الصحيح'],
  },
};

const LUCKY_COLORS: Record<LangCode, ColorsMap> = {
  ru: {
    'Овен': 'красный', 'Телец': 'зелёный', 'Близнецы': 'жёлтый', 'Рак': 'серебристый',
    'Лев': 'золотой', 'Дева': 'бежевый', 'Весы': 'голубой', 'Скорпион': 'тёмно-красный',
    'Стрелец': 'фиолетовый', 'Козерог': 'тёмно-синий', 'Водолей': 'бирюзовый', 'Рыбы': 'морской',
  },
  en: {
    'Овен': 'red', 'Телец': 'green', 'Близнецы': 'yellow', 'Рак': 'silver',
    'Лев': 'gold', 'Дева': 'beige', 'Весы': 'light blue', 'Скорпион': 'dark red',
    'Стрелец': 'purple', 'Козерог': 'navy blue', 'Водолей': 'turquoise', 'Рыбы': 'sea blue',
  },
  es: {
    'Овен': 'rojo', 'Телец': 'verde', 'Близнецы': 'amarillo', 'Рак': 'plateado',
    'Лев': 'dorado', 'Дева': 'beige', 'Весы': 'celeste', 'Скорпион': 'rojo oscuro',
    'Стрелец': 'violeta', 'Козерог': 'azul marino', 'Водолей': 'turquesa', 'Рыбы': 'azul mar',
  },
  ar: {
    'Овен': 'أحمر', 'Телец': 'أخضر', 'Близнецы': 'أصفر', 'Рак': 'فضي',
    'Лев': 'ذهبي', 'Дева': 'بيج', 'Весы': 'أزرق فاتح', 'Скорпион': 'أحمر داكن',
    'Стрелец': 'بنفسجي', 'Козерог': 'أزرق داكن', 'Водолей': 'فيروزي', 'Рыбы': 'أزرق بحري',
  },
};

const WEEKLY_AREAS: Record<LangCode, string[]> = {
  ru: ['💼 Карьера', '❤️ Отношения', '💰 Финансы', '🌿 Здоровье', '🌟 Личный рост'],
  en: ['💼 Career', '❤️ Relationships', '💰 Finance', '🌿 Health', '🌟 Personal growth'],
  es: ['💼 Carrera', '❤️ Relaciones', '💰 Finanzas', '🌿 Salud', '🌟 Crecimiento personal'],
  ar: ['💼 المهنة', '❤️ العلاقات', '💰 المال', '🌿 الصحة', '🌟 النمو الشخصي'],
};

function langOf(code: LangCode | string): LangCode {
  return normalizeLangCode(code);
}

export function getPlanetMeaning(lang: LangCode | string, planet: string, aspectType: string): string {
  const L = langOf(lang);
  return PLANET_MEANINGS[L]?.[planet]?.[aspectType]
    || PLANET_MEANINGS.en[planet]?.[aspectType]
    || '';
}

export function getSignTheme(lang: LangCode | string, sign: ZodiacSign, seed: number): string {
  const L = langOf(lang);
  const themes = SIGN_THEMES[L]?.[sign] || SIGN_THEMES.en[sign] || SIGN_THEMES.ru[sign];
  if (!themes?.length) return '';
  return themes[Math.abs(seed) % themes.length];
}

export function getLuckyColor(lang: LangCode | string, sign: ZodiacSign): string {
  const L = langOf(lang);
  return LUCKY_COLORS[L]?.[sign] || LUCKY_COLORS.en[sign] || LUCKY_COLORS.ru[sign] || '';
}

export function getWeeklyAreas(lang: LangCode | string): string[] {
  const L = langOf(lang);
  return WEEKLY_AREAS[L] || WEEKLY_AREAS.en;
}

export function getDateLocale(lang: LangCode | string): string {
  const locales: Record<LangCode, string> = {
    ru: 'ru-RU', en: 'en-US', es: 'es-ES', ar: 'ar-SA',
  };
  return locales[langOf(lang)];
}

export { ZODIAC_SIGNS };
