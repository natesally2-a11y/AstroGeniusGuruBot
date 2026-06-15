/* AstroGuru Mini App i18n — ru, en, es, ar */
(function (global) {
  const ZODIAC_SIGNS_RU = [
    'Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева',
    'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы',
  ];

  const ZODIAC = {
    ru: ZODIAC_SIGNS_RU,
    en: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
    es: ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'],
    de: ['Widder', 'Stier', 'Zwillinge', 'Krebs', 'Löwe', 'Jungfrau', 'Waage', 'Skorpion', 'Schütze', 'Steinbock', 'Wassermann', 'Fische'],
    fr: ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'],
    pt: ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'],
    zh: ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'],
    uk: ['Овен', 'Телець', 'Близнюки', 'Рак', 'Лев', 'Діва', 'Терези', 'Скорпіон', 'Стрілець', 'Козеріг', 'Водолій', 'Риби'],
    it: ['Ariete', 'Toro', 'Gemelli', 'Cancro', 'Leone', 'Vergine', 'Bilancia', 'Scorpione', 'Sagittario', 'Capricorno', 'Acquario', 'Pesci'],
    tr: ['Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'],
    ja: ['牡羊座', '牡牛座', '双子座', '蟹座', '獅子座', '乙女座', '天秤座', '蠍座', '射手座', '山羊座', '水瓶座', '魚座'],
    ko: ['양자리', '황소자리', '쌍둥이자리', '게자리', '사자자리', '처녀자리', '천칭자리', '전갈자리', '사수자리', '염소자리', '물병자리', '물고기자리'],
    ar: ['الحمل', 'الثور', 'الجوزاء', 'السرطان', 'الأسد', 'العذراء', 'الميزان', 'العقرب', 'القوس', 'الجدي', 'الدلو', 'الحوت'],
    hi: ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'],
  };

  const PLANETS = {
    ru: { sun: 'Солнце', moon: 'Луна', mercury: 'Меркурий', venus: 'Венера', mars: 'Марс', jupiter: 'Юпитер', saturn: 'Сатурн', uranus: 'Уран', neptune: 'Нептун', pluto: 'Плутон', ascendant: 'Асцендент' },
    en: { sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto', ascendant: 'Ascendant' },
    es: { sun: 'Sol', moon: 'Luna', mercury: 'Mercurio', venus: 'Venus', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Neptuno', pluto: 'Plutón', ascendant: 'Ascendente' },
    de: { sun: 'Sonne', moon: 'Mond', mercury: 'Merkur', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptun', pluto: 'Pluto', ascendant: 'Aszendent' },
    fr: { sun: 'Soleil', moon: 'Lune', mercury: 'Mercure', venus: 'Vénus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturne', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluton', ascendant: 'Ascendant' },
    pt: { sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão', ascendant: 'Ascendente' },
    zh: { sun: '太阳', moon: '月亮', mercury: '水星', venus: '金星', mars: '火星', jupiter: '木星', saturn: '土星', uranus: '天王星', neptune: '海王星', pluto: '冥王星', ascendant: '上升点' },
    uk: { sun: 'Сонце', moon: 'Місяць', mercury: 'Меркурій', venus: 'Венера', mars: 'Марс', jupiter: 'Юпітер', saturn: 'Сатурн', uranus: 'Уран', neptune: 'Нептун', pluto: 'Плутон', ascendant: 'Асцендент' },
    it: { sun: 'Sole', moon: 'Luna', mercury: 'Mercurio', venus: 'Venere', mars: 'Marte', jupiter: 'Giove', saturn: 'Saturno', uranus: 'Urano', neptune: 'Nettuno', pluto: 'Plutone', ascendant: 'Ascendente' },
    tr: { sun: 'Güneş', moon: 'Ay', mercury: 'Merkür', venus: 'Venüs', mars: 'Mars', jupiter: 'Jüpiter', saturn: 'Satürn', uranus: 'Uranüs', neptune: 'Neptün', pluto: 'Plüton', ascendant: 'Yükselen' },
    ja: { sun: '太陽', moon: '月', mercury: '水星', venus: '金星', mars: '火星', jupiter: '木星', saturn: '土星', uranus: '天王星', neptune: '海王星', pluto: '冥王星', ascendant: 'アセンダント' },
    ko: { sun: '태양', moon: '달', mercury: '수성', venus: '금성', mars: '화성', jupiter: '목성', saturn: '토성', uranus: '천왕성', neptune: '해왕성', pluto: '명왕성', ascendant: '상승궁' },
    ar: { sun: 'الشمس', moon: 'القمر', mercury: 'عطارد', venus: 'الزهرة', mars: 'المريخ', jupiter: 'المشتري', saturn: 'زحل', uranus: 'أورانوس', neptune: 'نبتون', pluto: 'بلوتو', ascendant: 'الطالع' },
    hi: { sun: 'सूर्य', moon: 'चंद्र', mercury: 'बुध', venus: 'शुक्र', mars: 'मंगल', jupiter: 'गुरु', saturn: 'शनि', uranus: 'यूरेनस', neptune: 'नेपच्यून', pluto: 'प्लूटो', ascendant: 'लग्न' },
  };

  const MOON_PHASES_RU = {
    'Новолуние': 'New Moon', 'Растущий серп': 'Waxing Crescent', 'Первая четверть': 'First Quarter',
    'Растущая луна': 'Waxing Gibbous', 'Полнолуние': 'Full Moon', 'Убывающая луна': 'Waning Gibbous',
    'Последняя четверть': 'Last Quarter', 'Убывающий серп': 'Waning Crescent',
  };

  const MOON_PHASES = {
    ru: { 'Новолуние': 'Новолуние', 'Растущий серп': 'Растущий серп', 'Первая четверть': 'Первая четверть', 'Растущая луна': 'Растущая луна', 'Полнолуние': 'Полнолуние', 'Убывающая луна': 'Убывающая луна', 'Последняя четверть': 'Последняя четверть', 'Убывающий серп': 'Убывающий серп' },
    en: MOON_PHASES_RU,
    es: { 'Новолуние': 'Luna nueva', 'Растущий серп': 'Creciente', 'Первая четверть': 'Cuarto creciente', 'Растущая луна': 'Gibosa creciente', 'Полнолуние': 'Luna llena', 'Убывающая луна': 'Gibosa menguante', 'Последняя четверть': 'Cuarto menguante', 'Убывающий серп': 'Menguante' },
    de: { 'Новолуние': 'Neumond', 'Растущий серп': 'Zunehmende Sichel', 'Первая четверть': 'Erstes Viertel', 'Растущая луна': 'Zunehmender Mond', 'Полнолуние': 'Vollmond', 'Убывающая луна': 'Abnehmender Mond', 'Последняя четверть': 'Letztes Viertel', 'Убывающий серп': 'Abnehmende Sichel' },
    fr: { 'Новолуние': 'Nouvelle lune', 'Растущий серп': 'Premier croissant', 'Первая четверть': 'Premier quartier', 'Растущая луна': 'Lune gibbeuse croissante', 'Полнолуние': 'Pleine lune', 'Убывающая луна': 'Lune gibbeuse décroissante', 'Последняя четверть': 'Dernier quartier', 'Убывающий серп': 'Dernier croissant' },
    pt: { 'Новолуние': 'Lua nova', 'Растущий серп': 'Crescente', 'Первая четверть': 'Quarto crescente', 'Растущая луна': 'Gibosa crescente', 'Полнолуние': 'Lua cheia', 'Убывающая луна': 'Gibosa minguante', 'Последняя четверть': 'Quarto minguante', 'Убывающий серп': 'Minguante' },
    zh: { 'Новолуние': '新月', 'Растущий серп': '娥眉月', 'Первая четверть': '上弦月', 'Растущая луна': '盈凸月', 'Полнолуние': '满月', 'Убывающая луна': '亏凸月', 'Последняя четверть': '下弦月', 'Убывающий серп': '残月' },
    uk: { 'Новолуние': 'Новолуння', 'Растущий серп': 'Молодий місяць', 'Первая четверть': 'Перша чверть', 'Растущая луна': 'Зростаючий місяць', 'Полнолуние': 'Повний місяць', 'Убывающая луна': 'Спадаючий місяць', 'Последняя четверть': 'Остання чверть', 'Убывающий серп': 'Старий місяць' },
    it: { 'Новолуние': 'Luna nuova', 'Растущий серп': 'Crescente', 'Первая четверть': 'Primo quarto', 'Растущая луна': 'Gibbosa crescente', 'Полнолуние': 'Luna piena', 'Убывающая луна': 'Gibbosa calante', 'Последняя четверть': 'Ultimo quarto', 'Убывающий серп': 'Calante' },
    tr: { 'Новолуние': 'Yeni ay', 'Растущий серп': 'Hilal', 'Первая четверть': 'İlk dördün', 'Растущая луна': 'Şişkin ay', 'Полнолуние': 'Dolunay', 'Убывающая луна': 'Azalan ay', 'Последняя четверть': 'Son dördün', 'Убывающий серп': 'Son hilal' },
    ja: { 'Новолуние': '新月', 'Растущий серп': '三日月', 'Первая четверть': '上弦の月', 'Растущая луна': '十三夜月', 'Полнолуние': '満月', 'Убывающая луна': '居待月', 'Последняя четверть': '下弦の月', 'Убывающий серп': '有明月' },
    ko: { 'Новолуние': '삭', 'Растущий серп': '초승달', 'Первая четверть': '상현달', 'Растущая луна': '상현망', 'Полнолуние': '보름달', 'Убывающая луна': '하현망', 'Последняя четверть': '하현달', 'Убывающий серп': '그믐달' },
    ar: { 'Новолуние': 'محاق', 'Растущий серп': 'هلال متزايد', 'Первая четверть': 'تربيع أول', 'Растущая луна': 'أحدب متزايد', 'Полнолуние': 'بدر', 'Убывающая луна': 'أحدب متناقص', 'Последняя четверть': 'تربيع أخير', 'Убывающий серп': 'هلال متناقص' },
    hi: { 'Новолуние': 'अमावस्या', 'Растущий серп': 'शुक्ल पक्ष', 'Первая четверть': 'प्रथम चतुर्थांश', 'Растущая луна': 'शुक्ल पक्ष', 'Полнолуние': 'पूर्णिमा', 'Убывающая луна': 'कृष्ण पक्ष', 'Последняя четверть': 'अंतिम चतुर्थांश', 'Убывающий серп': 'कृष्ण पक्ष' },
  };

  const LUCKY_COLORS = {
    'фиолетовый': { en: 'purple', es: 'violeta', de: 'violett', fr: 'violet', pt: 'roxo', zh: '紫色', uk: 'фіолетовий', it: 'viola', tr: 'mor', ja: '紫', ko: '보라', ar: 'بنفسجي', hi: 'बैंगनी' },
    'золотой': { en: 'gold', es: 'dorado', de: 'gold', fr: 'or', pt: 'dourado', zh: '金色', uk: 'золотий', it: 'oro', tr: 'altın', ja: '金', ko: '금색', ar: 'ذهبي', hi: 'सुनहरा' },
    'изумрудный': { en: 'emerald', es: 'esmeralda', de: 'smaragd', fr: 'émeraude', pt: 'esmeralda', zh: '翡翠绿', uk: 'смарагдовий', it: 'smeraldo', tr: 'zümrüt', ja: 'エメラルド', ko: '에메랄드', ar: 'زمردي', hi: 'पन्ना' },
    'сапфировый': { en: 'sapphire', es: 'zafiro', de: 'saphir', fr: 'saphir', pt: 'safira', zh: '蓝宝石', uk: 'сапфіровий', it: 'zaffiro', tr: 'safir', ja: 'サファイア', ko: '사파이어', ar: 'ياقوتي', hi: 'नीलम' },
    'алый': { en: 'scarlet', es: 'escarlata', de: 'scharlach', fr: 'écarlate', pt: 'escarlate', zh: '猩红', uk: 'багряний', it: 'scarlatto', tr: 'kızıl', ja: '深紅', ko: '진홍', ar: 'قرمزي', hi: 'लाल' },
    'бирюзовый': { en: 'turquoise', es: 'turquesa', de: 'türkis', fr: 'turquoise', pt: 'turquesa', zh: '绿松石', uk: 'бірюзовий', it: 'turchese', tr: 'turkuaz', ja: 'ターコイズ', ko: '청록', ar: 'فيروزي', hi: 'फ़िरोज़ा' },
    'янтарный': { en: 'amber', es: 'ámbar', de: 'bernstein', fr: 'ambre', pt: 'âmbar', zh: '琥珀', uk: 'бурштиновий', it: 'ambra', tr: 'kehribar', ja: '琥珀', ko: '호박', ar: 'كهرماني', hi: 'अंबर' },
    'серебряный': { en: 'silver', es: 'plateado', de: 'silber', fr: 'argent', pt: 'prateado', zh: '银色', uk: 'срібний', it: 'argento', tr: 'gümüş', ja: '銀', ko: '은색', ar: 'فضي', hi: 'चांदी' },
  };

  const LUCKY_STONES = {
    'аметист': { en: 'amethyst', es: 'amatista', de: 'Amethyst', fr: 'améthyste', pt: 'ametista', zh: '紫水晶', uk: 'аметист', it: 'ametista', tr: 'ametist', ja: 'アメジスト', ko: '자수정', ar: 'جمشت', hi: 'अमेथिस्ट' },
    'гранат': { en: 'garnet', es: 'granate', de: 'Granat', fr: 'grenat', pt: 'granada', zh: '石榴石', uk: 'гранат', it: 'granato', tr: 'lal', ja: 'ガーネット', ko: '가넷', ar: 'عقيق', hi: 'गार्नेट' },
    'лазурит': { en: 'lapis lazuli', es: 'lapislázuli', de: 'Lapislazuli', fr: 'lapis lazuli', pt: 'lápis-lazúli', zh: '青金石', uk: 'лазурит', it: 'lapislazzuli', tr: 'lapis', ja: 'ラピスラズリ', ko: '청금석', ar: 'لازورد', hi: 'लाजुली' },
    'янтарь': { en: 'amber', es: 'ámbar', de: 'Bernstein', fr: 'ambre', pt: 'âmbar', zh: '琥珀', uk: 'бурштин', it: 'ambra', tr: 'kehribar', ja: '琥珀', ko: '호박', ar: 'كهرمان', hi: 'अंबर' },
    'лунный камень': { en: 'moonstone', es: 'piedra lunar', de: 'Mondstein', fr: 'pierre de lune', pt: 'pedra da lua', zh: '月光石', uk: 'місячний камінь', it: 'pietra di luna', tr: 'ay taşı', ja: 'ムーンストーン', ko: '문스톤', ar: 'حجر القمر', hi: 'चंद्रकांत' },
  };

  const LUCKY_TIME = { утро: { en: 'morning', es: 'mañana', de: 'Morgen', fr: 'matin', pt: 'manhã', zh: '早晨', uk: 'ранок', it: 'mattina', tr: 'sabah', ja: '朝', ko: '아침', ar: 'صباح', hi: 'सुबह' }, день: { en: 'afternoon', es: 'tarde', de: 'Tag', fr: 'après-midi', pt: 'tarde', zh: '白天', uk: 'день', it: 'pomeriggio', tr: 'öğleden sonra', ja: '昼', ko: '낮', ar: 'نهار', hi: 'दिन' }, вечер: { en: 'evening', es: 'noche', de: 'Abend', fr: 'soir', pt: 'noite', zh: '傍晚', uk: 'вечір', it: 'sera', tr: 'akşam', ja: '夕方', ko: '저녁', ar: 'مساء', hi: 'शाम' } };

  const STRINGS = {
    ru: {
      loading: 'Загрузка...', loadingSubtitle: 'Познайте свою судьбу по звёздам',
      navHoroscope: 'Гороскоп', navChart: 'Карта', navCompat: 'Совместим.', navProfile: 'Профиль',
      today: 'Сегодня', week: 'Неделя', month: 'Месяц',
      pageNatalChart: 'Натальная карта', pageCompat: 'Совместимость', pageProfile: 'Профиль',
      chartLockedTitle: 'Натальная карта', chartLockedDesc: 'Полная карта рождения с AI-интерпретацией всех планет, домов и аспектов. Обновляется каждый месяц.',
      chartPreviewLockedTitle: 'Полная расшифровка карты',
      chartPreviewLockedDesc: 'AI-анализ всех планет в знаках и домах, аспекты, баланс стихий — как на профессиональной консультации.',
      premiumChartBtn: '⭐ Premium — {price} ⭐/мес', buyChartOnce: '🌌 Разово — {price} ⭐',
      chartBirthTitle: 'Нужны данные рождения',
      chartBirthDesc: 'Укажите дату, время и город в боте через /settings — данные сохранятся и подтянутся сюда автоматически.',
      refreshData: '🔄 Обновить данные',
      birthRequired: 'Нужны данные рождения', birthHint: 'Укажите дату, время и город в боте — затем нажмите «Обновить»',
      enterBirthTitle: 'Укажите дату рождения', enterBirthHint: 'Для персонального гороскопа нужны ваши данные',
      openBot: '⚙️ Указать в боте', refresh: '🔄 Обновить',
      notSet: 'не указано', notSetCity: 'не указан',
      moonIn: 'Луна в', moonBanner: '{emoji} {phase} · {moonIn} {sign} ({pct}%)',
      luckyDay: 'Счастливый день', numbers: 'Числа', color: 'Цвет', stone: 'Камень', bestTime: 'Лучшее время',
      luckyCard: '🍀 {luckyDay} · {numbers}: {nums} · {color}: {col} · 💎 {stoneVal}',
      getPremium: 'Получите Premium', premiumDesc: 'AI-гороскоп по натальной карте · {price} ⭐/мес',
      premiumRequired: 'Доступно в Premium', premiumBtn: '⭐ Premium — {price} ⭐/мес',
      aiLoading: 'ИИ составляет прогноз', aiHint: 'Анализируем натальную карту и транзиты...',
      aiDaily: 'ИИ составляет гороскоп', aiWeekly: 'ИИ готовит прогноз на неделю', aiMonthly: 'ИИ готовит прогноз на месяц',
      hintDaily: 'Анализируем транзиты и составляем персональный прогноз на сегодня...',
      hintWeekly: 'Составляем недельный прогноз по вашей натальной карте...',
      hintMonthly: 'Готовим месячный астрологический обзор...',
      aiChart: 'ИИ читает натальную карту', aiChartHint: 'Готовим подробную расшифровку: планеты, дома, аспекты...',
      decodeTitle: 'Расшифровка карты', elementFire: 'Огонь', elementEarth: 'Земля', elementAir: 'Воздух', elementWater: 'Вода',
      qualityCardinal: 'Кардин.', qualityFixed: 'Фикс.', qualityMutable: 'Подвиж.',
      interpretation: 'Интерпретация', interpretationUnavailable: 'Интерпретация недоступна', loadError: 'Ошибка загрузки',
      yourSign: 'Ваш знак', partner: 'Партнёр', selectSign: 'Выберите знак', checkCompat: 'Проверить совместимость',
      calculating: 'Считаю...', selectBothSigns: 'Выберите оба знака', compatibility: 'совместимость',
      love: '❤️ Любовь', friendship: '🤝 Дружба', work: '💼 Работа', communication: '💬 Общение',
      birthData: 'Данные рождения', date: 'Дата', time: 'Время', city: 'Город',
      subscription: 'Подписка', subTerms: '{price} ⭐/мес · автосписание · отмена в любой момент · действует до конца периода',
      cancelAutoRenew: '❌ Отменить автопродление', renewBtn: '🔄 Продлить — {price} ⭐',
      premiumUntil: '✅ Premium до {date}', autoRenewOn: '🔄 Автопродление: {price} ⭐/мес', autoRenewOff: '⏸ Автопродление отключено',
      lifetime: 'бессрочно', adminPremium: '👑 <strong>Бессрочный Premium</strong> (админ)',
      freeAccount: '🆓 Бесплатный аккаунт', premiumActive: '⭐ Premium активен', chartUnlocked: '🌌 Натальная карта разблокирована',
      lifetimeVip: '⭐ Premium бессрочно', adminStatus: '👑 Админ · Premium бессрочно',
      premiumDescFree: 'Premium {price} ⭐/мес — AI-гороскоп, натальная карта, транзиты',
      oneTimePurchases: 'Разовые покупки', natalChartBtn: '🌌 Натальная карта — {price} ⭐',
      quickActions: 'Быстрые действия', horoscopeToday: '🔮 Гороскоп на сегодня', changeBirth: '⚙️ Изменить данные рождения',
      luckyDayAction: '🍀 Счастливый день', transitsAction: '🪐 Влияние планет сегодня', moonPhase: '🌙 Фаза луны',
      documents: 'Документы', privacy: '📄 Политика конфиденциальности',
      moonLabel: 'Луна', rising: '↑', dataLoaded: 'Данные загружены',
      guestHint: 'Откройте бота → /start', guestMsg: 'Откройте бота и введите /start',
      openTelegram: 'Откройте через Telegram', alreadyPremium: '✅ У вас уже есть Premium!\n\nОтменить автопродление — кнопка ниже.',
      subscribeConfirm: 'Условия подписки Premium:\n\n• {price} ⭐ в месяц\n• Автосписание каждые 30 дней\n• Отмена в любой момент\n• После отмены Premium до конца оплаченного периода\n\nСогласны?',
      invoiceSent: 'Счёт отправлен! Проверьте чат с ботом.', errorSubscribe: 'Ошибка. Попробуйте /subscribe в боте.',
      errorBuyChart: 'Ошибка. Попробуйте /buy_chart в боте.', cancelConfirm: 'Отключить автопродление? Подписка останется до конца оплаченного периода.',
      autoRenewDisabled: '✅ Автопродление отключено',
      aiLucky: 'ИИ готовит счастливый день', aiLuckyHint: 'Подбираем числа, цвет и камень по вашему знаку...',
      luckyUse: 'Используйте для важных дел сегодня', aiTransits: 'ИИ анализирует транзиты',
      aiTransitsHint: 'Смотрим, как планеты сегодня влияют на вашу карту...', calmDay: 'Сегодня спокойный день',
      noTransits: 'Нет сильных транзитов к вашей карте.', planetsToday: 'Влияние планет сегодня', needBirthDate: 'Нужна дата рождения',
    },
    en: {
      loading: 'Loading...', loadingSubtitle: 'Discover your destiny through the stars',
      navHoroscope: 'Horoscope', navChart: 'Chart', navCompat: 'Match', navProfile: 'Profile',
      today: 'Today', week: 'Week', month: 'Month',
      pageNatalChart: 'Natal Chart', pageCompat: 'Compatibility', pageProfile: 'Profile',
      chartLockedTitle: 'Natal Chart', chartLockedDesc: 'Full birth chart with AI interpretation of all planets, houses and aspects. Updated monthly.',
      chartPreviewLockedTitle: 'Full chart decoding',
      chartPreviewLockedDesc: 'AI analysis of planets in signs and houses, aspects, elemental balance — like a professional reading.',
      premiumChartBtn: '⭐ Premium — {price} ⭐/mo', buyChartOnce: '🌌 One-time — {price} ⭐',
      chartBirthTitle: 'Birth data required',
      chartBirthDesc: 'Set date, time and city in the bot via /settings — data will sync here automatically.',
      refreshData: '🔄 Refresh data',
      birthRequired: 'Birth data required', birthHint: 'Set date, time and city in the bot — then tap Refresh',
      enterBirthTitle: 'Enter your birth date', enterBirthHint: 'Personal horoscope requires your birth data',
      openBot: '⚙️ Set in bot', refresh: '🔄 Refresh',
      notSet: 'not set', notSetCity: 'not set',
      moonIn: 'Moon in', moonBanner: '{emoji} {phase} · {moonIn} {sign} ({pct}%)',
      luckyDay: 'Lucky day', numbers: 'Numbers', color: 'Color', stone: 'Stone', bestTime: 'Best time',
      luckyCard: '🍀 {luckyDay} · {numbers}: {nums} · {color}: {col} · 💎 {stoneVal}',
      getPremium: 'Get Premium', premiumDesc: 'AI horoscope by natal chart · {price} ⭐/mo',
      premiumRequired: 'Premium required', premiumBtn: '⭐ Premium — {price} ⭐/mo',
      aiLoading: 'AI is preparing your forecast', aiHint: 'Analyzing natal chart and transits...',
      aiDaily: 'AI is writing your horoscope', aiWeekly: 'AI is preparing weekly forecast', aiMonthly: 'AI is preparing monthly forecast',
      hintDaily: 'Analyzing transits and building your personal forecast for today...',
      hintWeekly: 'Building weekly forecast from your natal chart...',
      hintMonthly: 'Preparing monthly astrological overview...',
      aiChart: 'AI is reading your natal chart', aiChartHint: 'Preparing detailed decoding: planets, houses, aspects...',
      decodeTitle: 'Chart decoding', elementFire: 'Fire', elementEarth: 'Earth', elementAir: 'Air', elementWater: 'Water',
      qualityCardinal: 'Card.', qualityFixed: 'Fixed', qualityMutable: 'Mut.',
      interpretation: 'Interpretation', interpretationUnavailable: 'Interpretation unavailable', loadError: 'Loading error',
      yourSign: 'Your sign', partner: 'Partner', selectSign: 'Select sign', checkCompat: 'Check compatibility',
      calculating: 'Calculating...', selectBothSigns: 'Select both signs', compatibility: 'compatibility',
      love: '❤️ Love', friendship: '🤝 Friendship', work: '💼 Work', communication: '💬 Communication',
      birthData: 'Birth data', date: 'Date', time: 'Time', city: 'City',
      subscription: 'Subscription', subTerms: '{price} ⭐/mo · auto-renewal · cancel anytime · valid until period ends',
      cancelAutoRenew: '❌ Cancel auto-renewal', renewBtn: '🔄 Renew — {price} ⭐',
      premiumUntil: '✅ Premium until {date}', autoRenewOn: '🔄 Auto-renewal: {price} ⭐/mo', autoRenewOff: '⏸ Auto-renewal off',
      lifetime: 'lifetime', adminPremium: '👑 <strong>Lifetime Premium</strong> (admin)',
      freeAccount: '🆓 Free account', premiumActive: '⭐ Premium active', chartUnlocked: '🌌 Natal chart unlocked',
      lifetimeVip: '⭐ Lifetime Premium', adminStatus: '👑 Admin · Lifetime Premium',
      premiumDescFree: 'Premium {price} ⭐/mo — AI horoscope, natal chart, transits',
      oneTimePurchases: 'One-time purchases', natalChartBtn: '🌌 Natal chart — {price} ⭐',
      quickActions: 'Quick actions', horoscopeToday: '🔮 Today\'s horoscope', changeBirth: '⚙️ Change birth data',
      luckyDayAction: '🍀 Lucky day', transitsAction: '🪐 Planetary transits today', moonPhase: '🌙 Moon phase',
      documents: 'Documents', privacy: '📄 Privacy policy',
      moonLabel: 'Moon', rising: '↑', dataLoaded: 'Data loaded',
      guestHint: 'Open bot → /start', guestMsg: 'Open the bot and type /start',
      openTelegram: 'Open via Telegram', alreadyPremium: '✅ You already have Premium!\n\nCancel auto-renewal with the button below.',
      subscribeConfirm: 'Premium subscription terms:\n\n• {price} ⭐ per month\n• Auto-renewal every 30 days\n• Cancel anytime\n• Premium stays until paid period ends\n\nAgree?',
      invoiceSent: 'Invoice sent! Check the bot chat.', errorSubscribe: 'Error. Try /subscribe in the bot.',
      errorBuyChart: 'Error. Try /buy_chart in the bot.', cancelConfirm: 'Disable auto-renewal? Subscription stays until the paid period ends.',
      autoRenewDisabled: '✅ Auto-renewal disabled',
      aiLucky: 'AI is preparing lucky day', aiLuckyHint: 'Picking numbers, color and stone for your sign...',
      luckyUse: 'Use for important matters today', aiTransits: 'AI is analyzing transits',
      aiTransitsHint: 'Checking how planets affect your chart today...', calmDay: 'A calm day today',
      noTransits: 'No strong transits to your chart.', planetsToday: 'Planetary influence today', needBirthDate: 'Birth date required',
    },
  };

  // Spanish — full UI
  STRINGS.es = {
    ...STRINGS.en,
    loading: 'Cargando...', loadingSubtitle: 'Descubre tu destino a través de las estrellas',
    navHoroscope: 'Horóscopo', navChart: 'Carta', navCompat: 'Pareja', navProfile: 'Perfil',
    today: 'Hoy', week: 'Semana', month: 'Mes',
    pageNatalChart: 'Carta natal', pageCompat: 'Compatibilidad', pageProfile: 'Perfil',
    chartLockedTitle: 'Carta natal', chartLockedDesc: 'Carta de nacimiento completa con interpretación IA de planetas, casas y aspectos. Se actualiza mensualmente.',
    chartPreviewLockedTitle: 'Decodificación completa',
    chartPreviewLockedDesc: 'Análisis IA de planetas en signos y casas, aspectos y balance elemental — como una consulta profesional.',
    premiumChartBtn: '⭐ Premium — {price} ⭐/mes', buyChartOnce: '🌌 Una vez — {price} ⭐',
    chartBirthTitle: 'Datos de nacimiento requeridos',
    chartBirthDesc: 'Indica fecha, hora y ciudad en el bot con /settings — los datos se sincronizarán aquí.',
    refreshData: '🔄 Actualizar datos',
    birthRequired: 'Datos de nacimiento requeridos', birthHint: 'Indica fecha, hora y ciudad en el bot — luego pulsa Actualizar',
    enterBirthTitle: 'Indica tu fecha de nacimiento', enterBirthHint: 'El horóscopo personal requiere tus datos',
    openBot: '⚙️ Configurar en el bot', refresh: '🔄 Actualizar',
    notSet: 'no indicado', notSetCity: 'no indicada',
    moonIn: 'Luna en', moonBanner: '{emoji} {phase} · {moonIn} {sign} ({pct}%)',
    luckyDay: 'Día de suerte', numbers: 'Números', color: 'Color', stone: 'Piedra', bestTime: 'Mejor momento',
    luckyCard: '🍀 {luckyDay} · {numbers}: {nums} · {color}: {col} · 💎 {stoneVal}',
    getPremium: 'Obtener Premium', premiumDesc: 'Horóscopo IA por carta natal · {price} ⭐/mes',
    premiumRequired: 'Requiere Premium', premiumBtn: '⭐ Premium — {price} ⭐/mes',
    aiLoading: 'La IA prepara tu pronóstico', aiHint: 'Analizando carta natal y tránsitos...',
    aiDaily: 'La IA escribe tu horóscopo', aiWeekly: 'La IA prepara el pronóstico semanal', aiMonthly: 'La IA prepara el pronóstico mensual',
    hintDaily: 'Analizando tránsitos y creando tu pronóstico de hoy...',
    hintWeekly: 'Creando pronóstico semanal según tu carta natal...',
    hintMonthly: 'Preparando panorama astrológico mensual...',
    aiChart: 'La IA lee tu carta natal', aiChartHint: 'Preparando decodificación: planetas, casas, aspectos...',
    decodeTitle: 'Decodificación', elementFire: 'Fuego', elementEarth: 'Tierra', elementAir: 'Aire', elementWater: 'Agua',
    qualityCardinal: 'Card.', qualityFixed: 'Fijo', qualityMutable: 'Mut.',
    interpretation: 'Interpretación', interpretationUnavailable: 'Interpretación no disponible', loadError: 'Error de carga',
    yourSign: 'Tu signo', partner: 'Pareja', selectSign: 'Elige signo', checkCompat: 'Comprobar compatibilidad',
    calculating: 'Calculando...', selectBothSigns: 'Elige ambos signos', compatibility: 'compatibilidad',
    love: '❤️ Amor', friendship: '🤝 Amistad', work: '💼 Trabajo', communication: '💬 Comunicación',
    birthData: 'Datos de nacimiento', date: 'Fecha', time: 'Hora', city: 'Ciudad',
    subscription: 'Suscripción', subTerms: '{price} ⭐/mes · renovación auto · cancela cuando quieras · válido hasta fin del periodo',
    cancelAutoRenew: '❌ Cancelar renovación auto', renewBtn: '🔄 Renovar — {price} ⭐',
    premiumUntil: '✅ Premium hasta {date}', autoRenewOn: '🔄 Renovación auto: {price} ⭐/mes', autoRenewOff: '⏸ Renovación auto desactivada',
    lifetime: 'de por vida', adminPremium: '👑 <strong>Premium de por vida</strong> (admin)',
    freeAccount: '🆓 Cuenta gratuita', premiumActive: '⭐ Premium activo', chartUnlocked: '🌌 Carta natal desbloqueada',
    lifetimeVip: '⭐ Premium de por vida', adminStatus: '👑 Admin · Premium de por vida',
    premiumDescFree: 'Premium {price} ⭐/mes — horóscopo IA, carta natal, tránsitos',
    oneTimePurchases: 'Compras únicas', natalChartBtn: '🌌 Carta natal — {price} ⭐',
    quickActions: 'Acciones rápidas', horoscopeToday: '🔮 Horóscopo de hoy', changeBirth: '⚙️ Cambiar datos de nacimiento',
    luckyDayAction: '🍀 Día de suerte', transitsAction: '🪐 Tránsitos planetarios hoy', moonPhase: '🌙 Fase lunar',
    documents: 'Documentos', privacy: '📄 Política de privacidad',
    moonLabel: 'Luna', rising: '↑', dataLoaded: 'Datos cargados',
    guestHint: 'Abre el bot → /start', guestMsg: 'Abre el bot y escribe /start',
    openTelegram: 'Abrir vía Telegram', alreadyPremium: '✅ ¡Ya tienes Premium!\n\nCancela la renovación con el botón de abajo.',
    subscribeConfirm: 'Condiciones Premium:\n\n• {price} ⭐ al mes\n• Renovación cada 30 días\n• Cancela cuando quieras\n• Premium hasta fin del periodo pagado\n\n¿Aceptas?',
    invoiceSent: '¡Factura enviada! Revisa el chat del bot.', errorSubscribe: 'Error. Prueba /subscribe en el bot.',
    errorBuyChart: 'Error. Prueba /buy_chart en el bot.', cancelConfirm: '¿Desactivar renovación auto? La suscripción sigue hasta fin del periodo.',
    autoRenewDisabled: '✅ Renovación auto desactivada',
    aiLucky: 'La IA prepara tu día de suerte', aiLuckyHint: 'Eligiendo números, color y piedra para tu signo...',
    luckyUse: 'Úsalo para asuntos importantes hoy', aiTransits: 'La IA analiza tránsitos',
    aiTransitsHint: 'Comprobando cómo los planetas afectan tu carta hoy...', calmDay: 'Un día tranquilo hoy',
    noTransits: 'Sin tránsitos fuertes a tu carta.', planetsToday: 'Influencia planetaria hoy', needBirthDate: 'Se requiere fecha de nacimiento',
  };

  // Arabic — full UI
  STRINGS.ar = {
    ...STRINGS.en,
    loading: 'جاري التحميل...', loadingSubtitle: 'اكتشف مصيرك عبر النجوم',
    navHoroscope: 'الأبراج', navChart: 'الخريطة', navCompat: 'التوافق', navProfile: 'الملف',
    today: 'اليوم', week: 'الأسبوع', month: 'الشهر',
    pageNatalChart: 'خريطة الميلاد', pageCompat: 'التوافق', pageProfile: 'الملف',
    chartLockedTitle: 'خريطة الميلاد', chartLockedDesc: 'خريطة ميلاد كاملة مع تفسير بالذكاء الاصطناعي للكواكب والبيوت والجوانب. تُحدَّث شهرياً.',
    chartPreviewLockedTitle: 'التفسير الكامل للخريطة',
    chartPreviewLockedDesc: 'تحليل بالذكاء الاصطناعي للكواكب في الأبراج والبيوت والجوانب وتوازن العناصر — كاستشارة احترافية.',
    premiumChartBtn: '⭐ Premium — {price} ⭐/شهر', buyChartOnce: '🌌 مرة واحدة — {price} ⭐',
    chartBirthTitle: 'مطلوب بيانات الميلاد',
    chartBirthDesc: 'أدخل التاريخ والوقت والمدينة في البوت عبر /settings — ستُزامَن البيانات هنا.',
    refreshData: '🔄 تحديث البيانات',
    birthRequired: 'مطلوب بيانات الميلاد', birthHint: 'أدخل البيانات في البوت — ثم اضغط تحديث',
    enterBirthTitle: 'أدخل تاريخ ميلادك', enterBirthHint: 'الأبراج الشخصية تحتاج بياناتك',
    openBot: '⚙️ الإعداد في البوت', refresh: '🔄 تحديث',
    notSet: 'غير محدد', notSetCity: 'غير محددة',
    moonIn: 'القمر في', moonBanner: '{emoji} {phase} · {moonIn} {sign} ({pct}%)',
    luckyDay: 'يوم محظوظ', numbers: 'أرقام', color: 'اللون', stone: 'الحجر', bestTime: 'أفضل وقت',
    luckyCard: '🍀 {luckyDay} · {numbers}: {nums} · {color}: {col} · 💎 {stoneVal}',
    getPremium: 'احصل على Premium', premiumDesc: 'أبراج بالذكاء الاصطناعي · {price} ⭐/شهر',
    premiumRequired: 'يتطلب Premium', premiumBtn: '⭐ Premium — {price} ⭐/شهر',
    aiLoading: 'الذكاء الاصطناعي يُعدّ التوقعات', aiHint: 'تحليل الخريطة والترانزيت...',
    aiDaily: 'الذكاء الاصطناعي يكتب أبراجك', aiWeekly: 'توقعات الأسبوع', aiMonthly: 'توقعات الشهر',
    hintDaily: 'تحليل الترانزيت وبناء توقعات اليوم...',
    hintWeekly: 'بناء توقعات أسبوعية من خريطتك...',
    hintMonthly: 'إعداد نظرة شهرية...',
    aiChart: 'الذكاء الاصطناعي يقرأ خريطتك', aiChartHint: 'تفسير مفصّل: كواكب، بيوت، جوانب...',
    decodeTitle: 'تفسير الخريطة', elementFire: 'نار', elementEarth: 'أرض', elementAir: 'هواء', elementWater: 'ماء',
    qualityCardinal: 'أساسي', qualityFixed: 'ثابت', qualityMutable: 'متغير',
    interpretation: 'التفسير', interpretationUnavailable: 'التفسير غير متاح', loadError: 'خطأ في التحميل',
    yourSign: 'برجك', partner: 'الشريك', selectSign: 'اختر البرج', checkCompat: 'فحص التوافق',
    calculating: 'جاري الحساب...', selectBothSigns: 'اختر برجين', compatibility: 'توافق',
    love: '❤️ حب', friendship: '🤝 صداقة', work: '💼 عمل', communication: '💬 تواصل',
    birthData: 'بيانات الميلاد', date: 'التاريخ', time: 'الوقت', city: 'المدينة',
    subscription: 'الاشتراك', subTerms: '{price} ⭐/شهر · تجديد تلقائي · إلغاء في أي وقت',
    cancelAutoRenew: '❌ إلغاء التجديد التلقائي', renewBtn: '🔄 تجديد — {price} ⭐',
    premiumUntil: '✅ Premium حتى {date}', autoRenewOn: '🔄 تجديد تلقائي: {price} ⭐/شهر', autoRenewOff: '⏸ التجديد التلقائي متوقف',
    lifetime: 'مدى الحياة', adminPremium: '👑 <strong>Premium مدى الحياة</strong> (مدير)',
    freeAccount: '🆓 حساب مجاني', premiumActive: '⭐ Premium نشط', chartUnlocked: '🌌 خريطة الميلاد مفتوحة',
    lifetimeVip: '⭐ Premium مدى الحياة', adminStatus: '👑 مدير · Premium مدى الحياة',
    premiumDescFree: 'Premium {price} ⭐/شهر — أبراج IA، خريطة ميلاد، ترانزيت',
    oneTimePurchases: 'مشتريات لمرة واحدة', natalChartBtn: '🌌 خريطة الميلاد — {price} ⭐',
    quickActions: 'إجراءات سريعة', horoscopeToday: '🔮 أبراج اليوم', changeBirth: '⚙️ تغيير بيانات الميلاد',
    luckyDayAction: '🍀 يوم محظوظ', transitsAction: '🪐 ترانزيت الكواكب اليوم', moonPhase: '🌙 طور القمر',
    documents: 'المستندات', privacy: '📄 سياسة الخصوصية',
    moonLabel: 'القمر', rising: '↑', dataLoaded: 'تم تحميل البيانات',
    guestHint: 'افتح البوت → /start', guestMsg: 'افتح البوت واكتب /start',
    openTelegram: 'افتح عبر تيليغرام', alreadyPremium: '✅ لديك Premium بالفعل!\n\nألغِ التجديد بالزر أدناه.',
    subscribeConfirm: 'شروط Premium:\n\n• {price} ⭐ شهرياً\n• تجديد كل 30 يوماً\n• إلغاء في أي وقت\n\nهل توافق؟',
    invoiceSent: 'تم إرسال الفاتورة! تحقق من محادثة البوت.', errorSubscribe: 'خطأ. جرّب /subscribe في البوت.',
    errorBuyChart: 'خطأ. جرّب /buy_chart في البوت.', cancelConfirm: 'إيقاف التجديد التلقائي؟ الاشتراك يسري حتى نهاية الفترة.',
    autoRenewDisabled: '✅ تم إيقاف التجديد التلقائي',
    aiLucky: 'الذكاء الاصطناعي يُعدّ يومك المحظوظ', aiLuckyHint: 'اختيار الأرقام واللون والحجر...',
    luckyUse: 'استخدمه للأمور المهمة اليوم', aiTransits: 'الذكاء الاصطناعي يحلّل الترانزيت',
    aiTransitsHint: 'كيف تؤثر الكواكب على خريطتك اليوم...', calmDay: 'يوم هادئ اليوم',
    noTransits: 'لا ترانزيت قوي لخريطتك.', planetsToday: 'تأثير الكواكب اليوم', needBirthDate: 'مطلوب تاريخ الميلاد',
  };

  const COMPAT_DESC = {
    ru: {
      high: ['Ваша пара — настоящее космическое совпадение! Между вами царит магнетическое притяжение и глубокое взаимопонимание.', 'Эти знаки созданы друг для друга. Ваши стихии прекрасно дополняют друг друга.', 'Редкое сочетание — ваши энергии усиливают лучшие качества друг друга.'],
      medium: ['Хорошая совместимость с точками роста. Взаимопонимание требует усилий, но результат стоит того.', 'Между вами есть и притяжение, и трение — это делает отношения интересными.', 'Большой потенциал при уважении к различиям друг друга.'],
      low: ['Разные темпераменты создают вызовы, но противоположности могут дополнять друг друга.', 'Эти знаки видят мир по-разному — источник взаимного обогащения.', 'Сложный союз, но любовь и понимание творят чудеса.'],
    },
    en: {
      high: ['A true cosmic match! Magnetic attraction and deep understanding between you.', 'These signs are made for each other. Your elements complement each other beautifully.', 'A rare pairing — your energies amplify each other\'s best qualities.'],
      medium: ['Good compatibility with room to grow. Understanding takes effort but pays off.', 'Attraction and friction coexist — making the relationship dynamic.', 'Great potential when you respect each other\'s differences.'],
      low: ['Different temperaments create challenges, but opposites can complement each other.', 'You see the world differently — a source of mutual enrichment.', 'A challenging pairing, but love and understanding work wonders.'],
    },
  };
  COMPAT_DESC.es = {
    high: ['¡Una pareja cósmica! Atracción magnética y comprensión profunda.', 'Signos hechos el uno para el otro. Elementos que se complementan.', 'Energías que amplifican lo mejor del otro.'],
    medium: ['Buena compatibilidad con margen de crecimiento.', 'Atracción y fricción — relación dinámica.', 'Gran potencial respetando las diferencias.'],
    low: ['Temperamentos distintos, pero los opuestos pueden complementarse.', 'Ven el mundo de forma diferente — enriquecimiento mutuo.', 'Unión desafiante, pero el amor hace maravillas.'],
  };
  COMPAT_DESC.ar = {
    high: ['توافق cósmico حقيقي! جذب عميق وفهم بينكما.', 'أبراج صُنعت لبعضها. عناصر تكمل بعضها.', 'طاقات تُعزّز أفضل الصفات لدى كل منكما.'],
    medium: ['توافق جيد مع مجال للنمو.', 'جذب وتوتر — علاقة ديناميكية.', 'إمكانات كبيرة عند احترام الاختلاف.'],
    low: ['طباع مختلفة لكن المتضادات قد تكمل بعضها.', 'ترون العالم بشكل مختلف — ثراء متبادل.', 'تحالف صعب لكن الحب يصنع المعجزات.'],
  };

  function normLang(code) {
    const c = (code || 'en').toLowerCase().slice(0, 2);
    return (c === 'ru' || c === 'en' || c === 'es' || c === 'ar') ? c : 'en';
  }

  function t(lang, key, params) {
    const L = normLang(lang);
    let text = STRINGS[L][key] || STRINGS.en[key] || STRINGS.ru[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
    return text;
  }

  function signIndex(ruSign) { return ZODIAC_SIGNS_RU.indexOf(ruSign); }

  function translateSign(lang, ruSign) {
    const i = signIndex(ruSign);
    if (i < 0) return ruSign;
    const list = ZODIAC[normLang(lang)] || ZODIAC.en;
    return list[i] || ruSign;
  }

  function translatePlanet(lang, planet) {
    const L = normLang(lang);
    return (PLANETS[L] || PLANETS.en)[planet] || planet;
  }

  function translateMoonPhase(lang, ruPhase) {
    const L = normLang(lang);
    return (MOON_PHASES[L] || MOON_PHASES.en)[ruPhase] || ruPhase;
  }

  function translateLuckyColor(lang, ruColor) {
    const map = LUCKY_COLORS[ruColor];
    if (!map) return ruColor;
    const L = normLang(lang);
    return map[L] || map.en || ruColor;
  }

  function translateLuckyStone(lang, ruStone) {
    const map = LUCKY_STONES[ruStone];
    if (!map) return ruStone;
    const L = normLang(lang);
    return map[L] || map.en || ruStone;
  }

  function translateLuckyTime(lang, ruTime) {
    const map = LUCKY_TIME[ruTime];
    if (!map) return ruTime;
    const L = normLang(lang);
    return map[L] || map.en || ruTime;
  }

  function compatDescription(lang, level, sign1, sign2) {
    const L = normLang(lang);
    const descs = (COMPAT_DESC[L] || COMPAT_DESC.en)[level] || COMPAT_DESC.en.medium;
    const seed = (signIndex(sign1) + signIndex(sign2)) % descs.length;
    return descs[seed];
  }

  function localeForDate(lang) {
    const map = { ru: 'ru-RU', en: 'en-US', es: 'es-ES', ar: 'ar-SA' };
    return map[normLang(lang)] || 'en-US';
  }

  global.AstroI18n = {
    ZODIAC_SIGNS_RU, ZODIAC, t, normLang, translateSign, translatePlanet,
    translateMoonPhase, translateLuckyColor, translateLuckyStone, translateLuckyTime,
    compatDescription, localeForDate, signIndex,
  };
})(window);

const tg = window.Telegram?.WebApp;
const API_BASE = '/api';
const BOT_USERNAME = 'AstroGeniusGuruBot';

const I18n = window.AstroI18n;
if (!I18n) console.error('AstroGuru: i18n failed to load');
const ZODIAC_SIGNS = I18n.ZODIAC_SIGNS_RU;
const ZODIAC_EMOJI = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const PLANET_EMOJIS = {
  sun:'☀️',moon:'🌙',mercury:'☿',venus:'♀',mars:'♂',
  jupiter:'♃',saturn:'♄',uranus:'⛢',neptune:'♆',pluto:'♇',ascendant:'↑'
};

class AstroGuruApp {
  constructor() {
    this.userData = null;
    this.currentTab = 'horoscope';
    this.initData = tg?.initData || '';
    const urlParams = new URLSearchParams(window.location.search);
    this.devId = urlParams.get('dev_id') || '';
    this.ascendantOffset = 0;
    this.init();
  }

  lang() {
    return this.userData?.language
      || this.loadCachedUserData()?.language
      || 'en';
  }

  t(key, params) {
    const p = { price: this.userData?.prices?.subscription || 99, ...params };
    return I18n.t(this.lang(), key, p);
  }

  signLabel(ruSign) { return I18n.translateSign(this.lang(), ruSign); }

  async init() {
    if (tg) {
      tg.ready(); tg.expand();
      tg.setHeaderColor('#1a0533'); tg.setBackgroundColor('#1a1a2e');
    }
    this.applyTheme();
    this.setupNavigation();
    await this.loadUserData();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.onAppResume();
    });
    if (tg) {
      tg.onEvent('viewportChanged', () => { this.onAppResume(); });
    }
    setTimeout(() => {
      document.getElementById('loading-screen').classList.remove('active');
      document.getElementById('main-app').classList.add('active');
    }, 900);
  }

  async onAppResume() {
    try {
      await this.refreshUserData();
      this.renderUserData();
      if (this.currentTab === 'chart') await this.loadNatalChart();
    } catch { /* ignore */ }
  }

  async refreshUserData() {
    this.userData = await this.makeRequest('/user');
    this.cacheUserData(this.userData);
    return this.userData;
  }

  async refreshAndLoadChart() {
    await this.refreshUserData();
    this.renderUserData();
    await this.loadNatalChart();
  }

  hasBirthData() {
    return Boolean(this.userData?.hasBirthData || this.userData?.birthDate);
  }

  updateChartTabState() {
    const hasBirth = this.hasBirthData();
    const locked = document.getElementById('chart-locked');
    const missing = document.getElementById('chart-birth-missing');
    const container = document.getElementById('chart-container');

    if (!hasBirth) {
      if (locked) locked.style.display = 'none';
      if (missing) missing.style.display = 'block';
      if (container) container.style.display = 'none';
      return;
    }

    if (missing) missing.style.display = 'none';
    if (locked) locked.style.display = 'none';
    if (container) container.style.display = 'block';
  }

  renderBirthDataRequired(targetId = 'chart-interpretation') {
    const html = `<div style="text-align:center;padding:24px">
      <div style="font-size:40px;margin-bottom:12px">📅</div>
      <div style="font-weight:600;margin-bottom:8px">${this.t('birthRequired')}</div>
      <div style="color:var(--tg-hint);margin-bottom:16px">${this.t('birthHint')}</div>
      <button class="btn-primary" onclick="app.openSettings()">${this.t('openBot')}</button>
      <button class="btn-secondary" style="margin-top:10px" onclick="app.refreshAndLoadChart()">${this.t('refresh')}</button>
    </div>`;
    const el = document.getElementById(targetId);
    if (el) el.innerHTML = html;
  }

  applyTheme() {
    if (!tg?.themeParams) return;
    const p = tg.themeParams, r = document.documentElement;
    if (p.bg_color) r.style.setProperty('--tg-bg', p.bg_color);
    if (p.secondary_bg_color) r.style.setProperty('--tg-sec-bg', p.secondary_bg_color);
    if (p.text_color) r.style.setProperty('--tg-text', p.text_color);
    if (p.hint_color) r.style.setProperty('--tg-hint', p.hint_color);
    if (p.button_color) r.style.setProperty('--tg-btn', p.button_color);
  }

  setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
    document.querySelectorAll('.htab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.htab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadHoroscope(btn.dataset.htype);
      });
    });
  }

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.toggle('active', t.id === `tab-${tab}`));
    if (this.userData) this.applyUiLanguage();
    if (tab === 'chart' && this.hasBirthData()) {
      this.refreshAndLoadChart();
    }
  }

  showAiLoading(title, hint) {
    title = title || this.t('aiLoading');
    hint = hint || this.t('aiHint');
    const overlay = document.getElementById('ai-loading-overlay');
    const titleEl = document.getElementById('ai-loading-title');
    const hintEl = document.getElementById('ai-loading-hint');
    if (titleEl) titleEl.textContent = title;
    if (hintEl) hintEl.textContent = hint;
    if (overlay) {
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
    }
    this._aiLoadingCount = (this._aiLoadingCount || 0) + 1;
  }

  hideAiLoading() {
    this._aiLoadingCount = Math.max(0, (this._aiLoadingCount || 0) - 1);
    if (this._aiLoadingCount > 0) return;
    const overlay = document.getElementById('ai-loading-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
    }
  }

  renderInlineWaiting(title, hint) {
    return `<div class="ai-waiting-inline">
      <div class="ai-loading-spinner"></div>
      <p><strong>${title}</strong><br>${hint}</p>
    </div>`;
  }

  async makeRequest(endpoint, method = 'GET') {
    const headers = { 'Content-Type': 'application/json' };
    if (this.initData) headers['x-init-data'] = this.initData;
    const sep = endpoint.includes('?') ? '&' : '?';
    const url = (!this.initData && this.devId)
      ? `${API_BASE}${endpoint}${sep}dev_id=${this.devId}` : `${API_BASE}${endpoint}`;
    const response = await fetch(url, { method, headers });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  cacheUserData(data) {
    try {
      localStorage.setItem('astroguru_user', JSON.stringify({
        birthDate: data.birthDate,
        birthTime: data.birthTime,
        birthCity: data.birthCity,
        firstName: data.firstName,
        language: data.language,
        savedAt: Date.now(),
      }));
    } catch { /* private mode */ }
  }

  loadCachedUserData() {
    try {
      const raw = localStorage.getItem('astroguru_user');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  }

  async loadUserData() {
    const cached = this.loadCachedUserData();
    if (cached?.birthDate) {
      document.getElementById('prof-birth-date').textContent = cached.birthDate;
      document.getElementById('prof-birth-time').textContent = cached.birthTime || this.t('notSet');
      document.getElementById('prof-birth-city').textContent = cached.birthCity || this.t('notSetCity');
    }
    try {
      this.userData = await this.makeRequest('/user');
      this.cacheUserData(this.userData);
      this.renderUserData();
      if (this.userData?.chart?.sunSign) {
        const s1 = document.getElementById('sign1-select');
        if (s1) s1.value = this.userData.chart.sunSign;
      }
    } catch (err) {
      console.warn('Failed to load user:', err);
      this.renderGuestMode();
    }
  }

  applyUiLanguage() {
    const price = this.userData?.prices?.subscription || 99;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key || el.id === 'profile-name') return;
      el.textContent = this.t(key, { price });
    });
    const sub = document.querySelector('.loading-subtitle');
    if (sub) sub.textContent = this.t('loadingSubtitle');
    const nav = [
      ['horoscope', 'navHoroscope'], ['chart', 'navChart'],
      ['compat', 'navCompat'], ['profile', 'navProfile'],
    ];
    nav.forEach(([tab, key]) => {
      const btn = document.querySelector(`.nav-btn[data-tab="${tab}"] span:last-child`);
      if (btn) btn.textContent = this.t(key);
    });
    const htabs = [['daily', 'today'], ['weekly', 'week'], ['monthly', 'month']];
    htabs.forEach(([type, key]) => {
      const btn = document.querySelector(`.htab[data-htype="${type}"]`);
      if (btn) btn.textContent = this.t(key);
    });
    const upgrade = document.querySelector('#upgrade-banner .upgrade-text strong');
    const upgradeSpan = document.querySelector('#upgrade-banner .upgrade-text span');
    if (upgrade) upgrade.textContent = this.t('getPremium');
    if (upgradeSpan) upgradeSpan.textContent = this.t('premiumDesc', { price });
    this.populateSignSelectors();
    if (this._lastChartData) this.renderPlanetsList(this._lastChartData);
  }

  renderUserData() {
    const u = this.userData;
    if (!u) return;
    this.applyUiLanguage();
    const price = u.prices?.subscription || 99;
    const loc = I18n.localeForDate(this.lang());

    document.getElementById('header-sign-name').textContent = u.firstName || 'AstroGuru';

    if (u.chart) {
      const idx = ZODIAC_SIGNS.indexOf(u.chart.sunSign);
      const sun = u.chart.sunSignLocalized || this.signLabel(u.chart.sunSign);
      const moon = u.chart.moonSignLocalized || this.signLabel(u.chart.moonSign);
      const rising = u.chart.risingSignLocalized || this.signLabel(u.chart.risingSign);
      document.getElementById('header-sign-name').textContent = sun || '—';
      document.getElementById('header-sign-detail').textContent =
        `${this.t('moonLabel')}: ${moon || '—'} · ${this.t('rising')} ${rising || '—'}`;
      document.querySelector('.sign-emoji').textContent = ZODIAC_EMOJI[idx] || '✨';
    } else if (u.birthDate) {
      document.getElementById('header-sign-name').textContent = this.t('dataLoaded');
      document.getElementById('header-sign-detail').textContent = u.birthDate;
    }

    if (u.isPremium) document.getElementById('premium-badge').style.display = 'flex';

    document.getElementById('profile-name').textContent = [u.firstName, u.lastName].filter(Boolean).join(' ');
    let statusText = this.t('freeAccount');
    if (u.isAdmin) statusText = this.t('adminStatus');
    else if (u.isLifetimeVip) statusText = this.t('lifetimeVip');
    else if (u.isPremium) statusText = this.t('premiumActive');
    else if (u.hasNatalChart) statusText = this.t('chartUnlocked');
    document.getElementById('profile-sub-status').textContent = statusText;

    const idx = u.chart ? ZODIAC_SIGNS.indexOf(u.chart.sunSign) : -1;
    document.getElementById('profile-avatar').textContent = idx >= 0 ? ZODIAC_EMOJI[idx] : '✨';
    document.getElementById('prof-birth-date').textContent = u.birthDate || '—';
    document.getElementById('prof-birth-time').textContent = u.birthTime || this.t('notSet');
    document.getElementById('prof-birth-city').textContent = u.birthCity || this.t('notSetCity');

    const subDetails = document.getElementById('sub-details');
    const subBtn = document.getElementById('sub-btn');
    const cancelBtn = document.getElementById('cancel-sub-btn');

    if (u.isAdmin) {
      subDetails.innerHTML = this.t('adminPremium');
      subBtn.style.display = 'none';
      cancelBtn.style.display = 'none';
    } else if (u.isPremium) {
      const exp = u.subscriptionExpires
        ? new Date(u.subscriptionExpires).toLocaleDateString(loc, { day:'numeric', month:'long', year:'numeric' })
        : this.t('lifetime');
      subDetails.innerHTML = `${this.t('premiumUntil', { date: exp })}<br>` +
        (u.autoRenew ? this.t('autoRenewOn', { price }) : this.t('autoRenewOff'));
      subBtn.textContent = this.t('renewBtn', { price });
      subBtn.style.display = 'block';
      cancelBtn.style.display = u.autoRenew ? 'block' : 'none';
    } else {
      subBtn.style.display = 'block';
      subDetails.textContent = this.t('premiumDescFree', { price });
      subBtn.textContent = this.t('premiumBtn', { price });
      cancelBtn.style.display = 'none';
    }

    this.loadHoroscope('daily');

    this.updateChartTabState();
    document.getElementById('upgrade-banner').style.display = u.isPremium ? 'none' : 'flex';
    if (this.hasBirthData() && this.currentTab === 'chart') {
      this.loadNatalChart();
    }
    this.loadMoonBanner();
    this.loadLuckyCard();
  }

  renderGuestMode() {
    document.getElementById('header-sign-name').textContent = 'AstroGuru';
    document.getElementById('header-sign-detail').textContent = this.t('guestHint');
    document.getElementById('horoscope-content').innerHTML =
      `<div style="text-align:center;padding:20px;color:var(--tg-hint)">${this.t('guestMsg')}</div>`;
  }

  async loadMoonBanner() {
    try {
      const moon = await this.makeRequest('/moon');
      const el = document.getElementById('moon-banner');
      el.style.display = 'block';
      const phase = moon.phase;
      const sign = moon.sign;
      const moonIn = moon.moonInLabel || this.t('moonIn');
      el.innerHTML = `${moon.emoji} <strong>${phase}</strong> · ${moonIn} ${sign} (${moon.illumination}%)`;
    } catch { /* skip */ }
  }

  async loadLuckyCard() {
    try {
      const lucky = await this.makeRequest('/lucky');
      const el = document.getElementById('lucky-card');
      el.style.display = 'block';
      el.innerHTML = this.t('luckyCard', {
        luckyDay: this.t('luckyDay'),
        numbers: this.t('numbers'),
        nums: lucky.numbers.join(', '),
        color: this.t('color'),
        col: I18n.translateLuckyColor(this.lang(), lucky.color),
        stoneVal: I18n.translateLuckyStone(this.lang(), lucky.stone),
      });
    } catch { /* skip */ }
  }

  async loadHoroscope(type) {
    const container = document.getElementById('horoscope-content');
    const hints = { daily: this.t('hintDaily'), weekly: this.t('hintWeekly'), monthly: this.t('hintMonthly') };
    const titles = { daily: this.t('aiDaily'), weekly: this.t('aiWeekly'), monthly: this.t('aiMonthly') };
    container.innerHTML = this.renderInlineWaiting(titles[type] || titles.daily, hints[type] || hints.daily);
    this.showAiLoading(titles[type] || titles.daily, hints[type] || hints.daily);
    const endpoints = { daily:'/horoscope/daily', weekly:'/horoscope/weekly', monthly:'/horoscope/monthly' };
    try {
      const data = await this.makeRequest(endpoints[type] || endpoints.daily);
      container.innerHTML = this.renderMarkdown(data.content || '');
    } catch (err) {
      if (err.message?.includes('Premium')) {
        container.innerHTML = this.renderPremiumRequired();
      } else if (err.message?.includes('дату рождения') || err.message?.includes('Birth') || err.message?.includes('/settings')) {
        container.innerHTML = `<div style="text-align:center;padding:24px">
          <div style="font-size:40px;margin-bottom:12px">📅</div>
          <div style="font-weight:600;margin-bottom:8px">${this.t('enterBirthTitle')}</div>
          <div style="color:var(--tg-hint);margin-bottom:16px">${this.t('enterBirthHint')}</div>
          <button class="btn-primary" onclick="app.openSettings()">${this.t('openBot')}</button>
        </div>`;
      } else {
        container.innerHTML = `<div style="color:var(--tg-hint);text-align:center;padding:20px">${err.message}</div>`;
      }
    } finally {
      this.hideAiLoading();
    }
  }

  renderPremiumRequired() {
    const price = this.userData?.prices?.subscription || 99;
    return `<div style="text-align:center;padding:20px">
      <div style="font-size:48px;margin-bottom:12px">🔒</div>
      <div style="font-size:16px;font-weight:700;color:var(--gold);margin-bottom:8px">${this.t('premiumRequired')}</div>
      <button class="btn-subscribe" onclick="app.openSubscribe()">${this.t('premiumBtn', { price })}</button>
    </div>`;
  }

  renderMarkdown(text) {
    return text.replace(/\*\*(.*?)\*\*/g,'<strong class="md-bold">$1</strong>')
      .replace(/\*(.*?)\*/g,'<em class="md-italic">$1</em>')
      .replace(/_(.*?)_/g,'<em class="md-italic">$1</em>')
      .replace(/\n/g,'<br>');
  }

  async loadNatalChart() {
    this.updateChartTabState();
    if (!this.hasBirthData()) {
      this.renderBirthDataRequired();
      return;
    }

    const hasFullAccess = this.userData?.isPremium || this.userData?.hasNatalChart;
    const previewPanel = document.getElementById('chart-preview-panel');
    const decodePanel = document.getElementById('chart-decode-panel');
    const interp = document.getElementById('chart-interpretation');

    if (hasFullAccess) {
      if (interp) {
        interp.innerHTML = this.renderInlineWaiting(this.t('aiChart'), this.t('aiChartHint'));
      }
      this.showAiLoading(this.t('aiChart'), this.t('aiChartHint'));
    } else if (previewPanel) {
      previewPanel.style.display = 'none';
    }

    try {
      const chart = await this.makeRequest('/natal-chart');
      this._lastChartData = chart;
      this.ascendantOffset = chart.ascendant?.longitude || 0;
      this.drawNatalChart(chart);
      this.renderPlanetsList(chart);

      if (chart.isPreview) {
        if (previewPanel) {
          previewPanel.style.display = 'block';
          const textEl = document.getElementById('chart-preview-text');
          if (textEl) textEl.innerHTML = this.renderMarkdown(chart.preview || '');
        }
        decodePanel?.style.setProperty('display', 'none');
        if (interp) interp.style.display = 'none';
        return;
      }

      previewPanel?.style.setProperty('display', 'none');
      if (chart.decoding) {
        this.renderNatalDecoding(chart.decoding);
      } else if (interp) {
        decodePanel?.style.setProperty('display', 'none');
        interp.style.display = '';
        if (chart.interpretation) {
          interp.innerHTML = `<h3 style="margin-bottom:8px;color:var(--accent)">📖 ${this.t('interpretation')} (${chart.monthKey})</h3>` +
            this.renderMarkdown(chart.interpretation);
        } else {
          interp.innerHTML = '';
        }
      }
    } catch (err) {
      console.error('Chart error:', err);
      if (err.message?.includes('дату рождения') || err.message?.includes('Birth') || err.message?.includes('/settings')) {
        this.updateChartTabState();
        this.renderBirthDataRequired();
      } else if (interp) {
        interp.style.display = '';
        interp.innerHTML = `<div style="color:var(--tg-hint);text-align:center;padding:16px">${err.message || this.t('loadError')}</div>`;
      }
    } finally {
      if (hasFullAccess) this.hideAiLoading();
    }
  }

  renderNatalDecoding(decoding) {
    const panel = document.getElementById('chart-decode-panel');
    const legacy = document.getElementById('chart-interpretation');
    if (legacy) legacy.style.display = 'none';
    if (!panel || !decoding?.tabs) return;
    panel.style.display = '';

    const summaryEl = document.getElementById('decode-summary');
    if (summaryEl) summaryEl.innerHTML = this.renderMarkdown(decoding.summary || '');

    const balanceEl = document.getElementById('decode-balance');
    if (balanceEl && decoding.elements) {
      const e = decoding.elements;
      const q = decoding.qualities || {};
      balanceEl.innerHTML = [
        `<span>🔥 ${this.t('elementFire')}: ${e.fire}</span>`,
        `<span>🌍 ${this.t('elementEarth')}: ${e.earth}</span>`,
        `<span>💨 ${this.t('elementAir')}: ${e.air}</span>`,
        `<span>💧 ${this.t('elementWater')}: ${e.water}</span>`,
        `<span>⚡ ${this.t('qualityCardinal')}: ${q.cardinal || 0}</span>`,
        `<span>🔒 ${this.t('qualityFixed')}: ${q.fixed || 0}</span>`,
        `<span>🌀 ${this.t('qualityMutable')}: ${q.mutable || 0}</span>`,
      ].join('');
    }

    const tabKeys = ['planetsInSigns', 'housesInSigns', 'planetsInHouses', 'aspects', 'info'];
    const tabsEl = document.getElementById('decode-tabs');
    const contentEl = document.getElementById('decode-content');
    if (!tabsEl || !contentEl) return;

    if (!this._decodeTab) this._decodeTab = 'planetsInSigns';

    const renderTabContent = (key) => {
      const items = decoding.tabs[key] || [];
      if (!items.length) {
        contentEl.innerHTML = `<div style="color:var(--tg-hint);text-align:center;padding:12px">—</div>`;
        return;
      }
      contentEl.innerHTML = items.map(item =>
        `<div class="decode-item"><h4>${item.heading}</h4><p>${this.renderMarkdown(item.text).replace(/^<p>|<\/p>$/g, '')}</p></div>`
      ).join('');
    };

    tabsEl.innerHTML = tabKeys.map(key => {
      const label = (decoding.tabLabels && decoding.tabLabels[key]) || key;
      const active = this._decodeTab === key ? ' active' : '';
      return `<button type="button" class="dtab${active}" data-dtab="${key}">${label}</button>`;
    }).join('');

    tabsEl.querySelectorAll('.dtab').forEach(btn => {
      btn.addEventListener('click', () => {
        this._decodeTab = btn.dataset.dtab;
        tabsEl.querySelectorAll('.dtab').forEach(b => b.classList.toggle('active', b.dataset.dtab === this._decodeTab));
        renderTabContent(this._decodeTab);
      });
    });

    renderTabContent(this._decodeTab);
  }

  drawNatalChart(chartData) {
    const canvas = document.getElementById('natal-chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height, cx = W/2, cy = H/2;
    const outerR = W/2 - 12, zodiacR = outerR - 6, zodiacInnerR = zodiacR - 32, planetR = zodiacInnerR - 22;
    const ascOffset = this.ascendantOffset;

    ctx.clearRect(0, 0, W, H);
    const bgGrad = ctx.createRadialGradient(cx,cy,0,cx,cy,outerR);
    bgGrad.addColorStop(0,'#0f0c29'); bgGrad.addColorStop(1,'#1a0533');
    ctx.fillStyle = bgGrad;
    ctx.beginPath(); ctx.arc(cx,cy,outerR,0,Math.PI*2); ctx.fill();

    const signColors = ['#ef4444','#22c55e','#eab308','#06b6d4','#f97316','#84cc16',
      '#8b5cf6','#0ea5e9','#a855f7','#6366f1','#14b8a6','#ec4899'];

    // Zodiac ring — rotated so ascendant is at 9 o'clock (left)
    for (let i = 0; i < 12; i++) {
      const startAngle = ((i * 30 - ascOffset) - 90) * Math.PI / 180;
      const endAngle = (((i+1) * 30 - ascOffset) - 90) * Math.PI / 180;
      const midAngle = startAngle + Math.PI / 12;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,zodiacR,startAngle,endAngle); ctx.closePath();
      ctx.fillStyle = signColors[i] + '44'; ctx.fill();
      ctx.strokeStyle = signColors[i] + '88'; ctx.lineWidth = 1; ctx.stroke();
      ctx.save();
      ctx.translate(cx + (zodiacInnerR+20)*Math.cos(midAngle), cy + (zodiacInnerR+20)*Math.sin(midAngle));
      ctx.rotate(midAngle + Math.PI/2);
      ctx.fillStyle = signColors[i]; ctx.font = '13px Arial'; ctx.textAlign = 'center';
      ctx.fillText(ZODIAC_EMOJI[i], 0, 0); ctx.restore();
    }

    ctx.beginPath(); ctx.arc(cx,cy,zodiacInnerR,0,Math.PI*2);
    ctx.fillStyle = '#0f0c29ee'; ctx.fill();
    ctx.strokeStyle = 'rgba(167,139,250,0.4)'; ctx.stroke();

    // House cusps
    if (chartData.houses) {
      for (let i = 0; i < 12; i++) {
        const angle = ((chartData.houses[i] - ascOffset) - 90) * Math.PI / 180;
        const isAxis = i === 0 || i === 3 || i === 6 || i === 9;
        ctx.strokeStyle = isAxis ? 'rgba(167,139,250,0.6)' : 'rgba(167,139,250,0.15)';
        ctx.lineWidth = isAxis ? 1.5 : 0.5;
        ctx.beginPath();
        ctx.moveTo(cx + 18*Math.cos(angle), cy + 18*Math.sin(angle));
        ctx.lineTo(cx + zodiacInnerR*Math.cos(angle), cy + zodiacInnerR*Math.sin(angle));
        ctx.stroke();
        if (isAxis) {
          ctx.fillStyle = 'rgba(167,139,250,0.7)'; ctx.font = '9px Inter';
          ctx.fillText(String(i+1), cx + (zodiacInnerR-8)*Math.cos(angle), cy + (zodiacInnerR-8)*Math.sin(angle));
        }
      }
    }

    // Planets
    const planets = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];
    const dots = [];
    for (const planet of planets) {
      if (!chartData[planet]) continue;
      const pos = chartData[planet];
      const signKey = pos.signKey || pos.sign;
      const totalDeg = signKey ? (ZODIAC_SIGNS.indexOf(signKey)*30 + pos.degree + pos.minute/60) : pos.longitude;
      const angle = ((totalDeg - ascOffset) - 90) * Math.PI / 180;
      let r = planetR - dots.filter(p => Math.abs(p.angle-angle)<0.25).length * 13;
      const px = cx + r*Math.cos(angle), py = cy + r*Math.sin(angle);
      dots.push({angle, px, py});
      ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2);
      ctx.fillStyle = signColors[ZODIAC_SIGNS.indexOf(signKey)] || '#a78bfa'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
      ctx.font = '11px Arial'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
      ctx.fillText(PLANET_EMOJIS[planet]||'●', px, py+1);
    }

    // Ascendant marker at left (9 o'clock)
    ctx.beginPath(); ctx.arc(cx-planetR+5, cy, 4, 0, Math.PI*2);
    ctx.fillStyle = '#fbbf24'; ctx.fill();
    ctx.font = '10px Arial'; ctx.fillStyle = '#fbbf24'; ctx.textAlign = 'left';
    ctx.fillText('ASC', cx-planetR+12, cy+4);

    ctx.font = '18px Arial'; ctx.textAlign = 'center'; ctx.fillStyle = '#a78bfa';
    ctx.fillText('✦', cx, cy);
  }

  renderPlanetsList(chartData) {
    const container = document.getElementById('planets-list');
    if (!container) return;
    const planets = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','ascendant'];
    container.innerHTML = '';
    for (const planet of planets) {
      if (!chartData[planet]) continue;
      const pos = chartData[planet];
      const signKey = pos.signKey || pos.sign;
      const signIdx = ZODIAC_SIGNS.indexOf(signKey);
      const item = document.createElement('div');
      item.className = 'planet-item';
      item.innerHTML = `<span class="planet-emoji">${PLANET_EMOJIS[planet]}</span>
        <div class="planet-details">
          <div class="planet-name">${pos.name || I18n.translatePlanet(this.lang(), planet)}</div>
          <div class="planet-sign">${ZODIAC_EMOJI[signIdx]} ${pos.sign}</div>
          <div class="planet-degree">${pos.degree}°${pos.minute}'${pos.retrograde?' <span class="retrograde-badge">℞</span>':''}</div>
        </div>`;
      container.appendChild(item);
    }
  }

  populateSignSelectors() {
    ['sign1-select','sign2-select'].forEach(id => {
      const select = document.getElementById(id);
      if (!select) return;
      const saved = select.value;
      select.innerHTML = '';
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = this.t('selectSign');
      select.appendChild(empty);
      ZODIAC_SIGNS.forEach((sign, i) => {
        const opt = document.createElement('option');
        opt.value = sign;
        opt.textContent = `${ZODIAC_EMOJI[i]} ${this.signLabel(sign)}`;
        select.appendChild(opt);
      });
      if (saved) select.value = saved;
    });
  }

  async checkCompatibility() {
    const sign1 = document.getElementById('sign1-select').value;
    const sign2 = document.getElementById('sign2-select').value;
    if (!sign1 || !sign2) { tg?.showAlert(this.t('selectBothSigns')); return; }
    const btn = document.getElementById('compat-btn');
    btn.disabled = true; btn.textContent = this.t('calculating');
    try {
      const result = await this.makeRequest(`/compatibility?sign1=${encodeURIComponent(sign1)}&sign2=${encodeURIComponent(sign2)}`);
      this.renderCompatibilityResult(result);
    } catch (err) { tg?.showAlert(err.message); }
    finally { btn.disabled = false; btn.textContent = this.t('checkCompat'); }
  }

  renderCompatibilityResult(result) {
    const container = document.getElementById('compat-result');
    const e1 = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(result.sign1)] || '';
    const e2 = ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(result.sign2)] || '';
    const areas = { love: this.t('love'), friendship: this.t('friendship'), work: this.t('work'), communication: this.t('communication') };
    const desc = I18n.compatDescription(this.lang(), result.level, result.sign1, result.sign2);
    let bars = '';
    for (const [k,l] of Object.entries(areas)) {
      const v = result.areas?.[k] || 0;
      bars += `<div class="compat-bar-row"><span class="compat-bar-label">${l}</span>
        <div class="compat-bar-track"><div class="compat-bar-fill" style="width:${v}%"></div></div>
        <span class="compat-bar-value">${v}%</span></div>`;
    }
    const s1 = result.sign1Localized || this.signLabel(result.sign1);
    const s2 = result.sign2Localized || this.signLabel(result.sign2);
    container.innerHTML = `<div class="compat-percentage"><div style="font-size:28px">${e1} ${s1} 💕 ${e2} ${s2}</div>
      <div class="compat-score">${result.percentage}%</div><div class="compat-label">${this.t('compatibility')}</div></div>
      <div class="compat-bar-section">${bars}</div>
      <p class="compat-description">${desc}</p>`;
    container.style.display = 'block';
  }

  async openSubscribe() {
    if (!tg) { alert(this.t('openTelegram')); return; }
    if (this.userData?.isPremium && !this.userData?.isAdmin) {
      tg.showAlert(this.t('alreadyPremium'));
      return;
    }
    const price = this.userData?.prices?.subscription || 99;
    if (!confirm(this.t('subscribeConfirm', { price }))) return;
    try {
      const r = await this.makeRequest('/invoice/subscribe', 'POST');
      tg.showAlert(this.t('invoiceSent'));
      tg.close();
    } catch (err) {
      tg.showAlert(this.t('errorSubscribe'));
    }
  }

  async buyNatalChart() {
    if (!tg) { alert(this.t('openTelegram')); return; }
    try {
      await this.makeRequest('/invoice/natal-chart', 'POST');
      tg.showAlert(this.t('invoiceSent'));
      tg.close();
    } catch (err) {
      tg.showAlert(this.t('errorBuyChart'));
    }
  }

  async cancelSubscription() {
    if (!tg) return;
    if (!confirm(this.t('cancelConfirm'))) return;
    try {
      await this.makeRequest('/cancel-subscription', 'POST');
      tg.showAlert(this.t('autoRenewDisabled'));
      await this.loadUserData();
    } catch (err) { tg.showAlert(err.message); }
  }

  openSettings() {
    const url = `https://t.me/${BOT_USERNAME}?start=settings`;
    if (tg) tg.openTelegramLink(url);
    else window.open(url, '_blank');
  }

  async sendBotCommand(command) {
    const cmd = command.replace('/', '');
    switch (cmd) {
      case 'today':
        this.switchTab('horoscope');
        document.querySelectorAll('.htab').forEach(b => b.classList.toggle('active', b.dataset.htype === 'daily'));
        await this.loadHoroscope('daily');
        break;
      case 'settings':
        this.openSettings();
        break;
      case 'moon': {
        const moon = await this.makeRequest('/moon');
        const phase = I18n.translateMoonPhase(this.lang(), moon.phase);
        const sign = this.signLabel(moon.sign);
        if (tg) tg.showAlert(`${moon.emoji} ${phase}\n${moon.moonInLabel || this.t('moonIn')} ${sign}\n\n${moon.advice}`);
        break;
      }
      case 'lucky':
        await this.showLuckyDay();
        break;
      case 'transits':
        await this.showTransits();
        break;
      default:
        if (tg) tg.openTelegramLink(`https://t.me/${BOT_USERNAME}?start=${cmd}`);
    }
  }

  openPrivacy() {
    const url = window.location.origin + '/privacy';
    if (tg) tg.openLink(url); else window.open(url, '_blank');
  }

  showActionResult(html) {
    const el = document.getElementById('profile-action-result');
    if (!el) return;
    el.innerHTML = html;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async showLuckyDay() {
    this.showActionResult(this.renderInlineWaiting(this.t('aiLucky'), this.t('aiLuckyHint')));
    this.showAiLoading(this.t('aiLucky'), this.t('aiLuckyHint'));
    try {
      const lucky = await this.makeRequest('/lucky');
      this.showActionResult(
        `<div style="font-size:16px;font-weight:700;margin-bottom:10px">🍀 ${this.t('luckyDay')} — ${lucky.sign}</div>` +
        `<div>🔢 <strong>${this.t('numbers')}:</strong> ${lucky.numbers.join(', ')}</div>` +
        `<div>🎨 <strong>${this.t('color')}:</strong> ${I18n.translateLuckyColor(this.lang(), lucky.color)}</div>` +
        `<div>💎 <strong>${this.t('stone')}:</strong> ${I18n.translateLuckyStone(this.lang(), lucky.stone)}</div>` +
        `<div>⏰ <strong>${this.t('bestTime')}:</strong> ${I18n.translateLuckyTime(this.lang(), lucky.bestTime)}</div>` +
        `<div style="margin-top:8px;color:var(--tg-hint);font-size:12px">${this.t('luckyUse')}</div>`
      );
      await this.loadLuckyCard();
    } catch (err) {
      if (tg) tg.showAlert(err.message);
    } finally {
      this.hideAiLoading();
    }
  }

  async showTransits() {
    this.showActionResult(this.renderInlineWaiting(this.t('aiTransits'), this.t('aiTransitsHint')));
    this.showAiLoading(this.t('aiTransits'), this.t('aiTransitsHint'));
    try {
      const data = await this.makeRequest('/transits');
      if (!data.transits?.length) {
        this.showActionResult(`🪐 <strong>${this.t('calmDay')}</strong><br>${this.t('noTransits')}`);
        return;
      }
      let html = data.content
        ? this.renderMarkdown(data.content)
        : `<div style="font-size:16px;font-weight:700;margin-bottom:6px">🪐 ${this.t('planetsToday')}</div>`;
      if (!data.content) {
        for (const t of data.transits) {
          const icon = t.energy === 'harmonious' ? '✅' : t.energy === 'challenging' ? '⚠️' : '➡️';
          html += `<div style="margin-bottom:10px">${icon} <strong>${t.text}</strong>` +
            (t.hint ? `<div style="color:var(--tg-hint);font-size:12px;margin-top:2px">${t.hint}</div>` : '') +
            `</div>`;
        }
      }
      this.showActionResult(html);
    } catch (err) {
      if (err.message?.includes('дату') || err.message?.includes('Birth') || err.message?.includes('/settings')) {
        this.showActionResult(`📅 <strong>${this.t('needBirthDate')}</strong><br><button class="btn-primary" style="margin-top:10px" onclick="app.openSettings()">${this.t('openBot')}</button>`);
      } else if (tg) tg.showAlert(err.message);
    } finally {
      this.hideAiLoading();
    }
  }
}

let app;
document.addEventListener('DOMContentLoaded', () => { app = new AstroGuruApp(); });
