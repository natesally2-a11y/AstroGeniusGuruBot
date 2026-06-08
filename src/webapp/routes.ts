import { Router, Request, Response } from 'express';
import { validateInitData } from '../utils/initData';
import {
  getUserByTelegramId, getNatalChart, getPaymentHistory,
  getHoroscope, saveHoroscope, getChartInterpretation, saveChartInterpretation,
} from '../database/queries';
import {
  calculateNatalChartForUser, ZODIAC_SIGNS, ZODIAC_EMOJI, calculateAspects,
} from '../astrology/engine';
import { calculateCompatibility } from '../astrology/compatibility';
import { generateDailyHoroscope, generateWeeklyHoroscope, generateMonthlyHoroscope } from '../astrology/horoscope';
import { generateNatalInterpretation } from '../astrology/natalInterpretation';
import { getMoonPhase, getLuckyDay } from '../astrology/features';
import { getLocalDateKey, getCurrentMonthKey } from '../astrology/timezone';
import {
  isSubscriptionActive, hasNatalChartAccess, cancelSubscription,
  SUBSCRIPTION_PRICE, NATAL_CHART_PRICE,
} from '../payments/stars';
import { logger } from '../utils/logger';

const router = Router();
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const IS_DEV = process.env.NODE_ENV !== 'production';

function requireAuth(req: Request, res: Response, next: () => void): void {
  const initData = req.headers['x-init-data'] as string || req.query.initData as string;

  if (IS_DEV && req.query.dev_id) {
    (req as any).telegramUser = { id: parseInt(req.query.dev_id as string, 10), first_name: 'Dev' };
    next();
    return;
  }

  if (!initData) {
    res.status(401).json({ error: 'Missing initData' });
    return;
  }

  const data = validateInitData(initData, BOT_TOKEN);
  if (!data || !data.user) {
    res.status(403).json({ error: 'Invalid initData' });
    return;
  }

  (req as any).telegramUser = data.user;
  next();
}

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/user', requireAuth, (req: Request, res: Response) => {
  const tgUser = (req as any).telegramUser;
  const user = getUserByTelegramId(tgUser.id);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  const chart = getNatalChart(user.id);
  const isPremium = isSubscriptionActive(user);
  const hasChart = hasNatalChartAccess(user);

  res.json({
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    birthDate: user.birth_date,
    birthTime: user.birth_time,
    birthCity: user.birth_city,
    timezone: user.timezone,
    isPremium,
    hasNatalChart: hasChart,
    autoRenew: user.auto_renew !== 0,
    subscriptionExpires: user.subscription_expires,
    natalChartExpires: user.natal_chart_unlocked_until,
    prices: { subscription: SUBSCRIPTION_PRICE, natalChart: NATAL_CHART_PRICE },
    chart: chart ? {
      sunSign: chart.sun_sign,
      moonSign: chart.moon_sign,
      risingSign: chart.rising_sign,
      sunDegree: chart.sun_degree,
      moonDegree: chart.moon_degree,
      risingDegree: chart.rising_degree,
      planets: {
        mercury: chart.mercury_sign, venus: chart.venus_sign, mars: chart.mars_sign,
        jupiter: chart.jupiter_sign, saturn: chart.saturn_sign,
        uranus: chart.uranus_sign, neptune: chart.neptune_sign, pluto: chart.pluto_sign,
      },
      chartData: chart.chart_data ? JSON.parse(chart.chart_data) : null,
    } : null,
  });
});

router.get('/horoscope/daily', requireAuth, async (req: Request, res: Response) => {
  const user = getUserByTelegramId((req as any).telegramUser.id);
  if (!user?.birth_date) { res.status(400).json({ error: 'Birth data not set' }); return; }

  const dateKey = getLocalDateKey(user.timezone || 'Europe/Moscow');
  const cached = getHoroscope(user.id, dateKey);
  const content = cached?.content || await generateDailyHoroscope(user, new Date());
  if (!cached) saveHoroscope({ user_id: user.id, date: dateKey, content });

  res.json({ date: dateKey, content, isPremium: isSubscriptionActive(user) });
});

router.get('/horoscope/weekly', requireAuth, async (req: Request, res: Response) => {
  const user = getUserByTelegramId((req as any).telegramUser.id);
  if (!user?.birth_date) { res.status(400).json({ error: 'Birth data not set' }); return; }
  if (!isSubscriptionActive(user)) { res.status(403).json({ error: 'Premium subscription required' }); return; }

  res.json({ content: await generateWeeklyHoroscope(user) });
});

router.get('/horoscope/monthly', requireAuth, async (req: Request, res: Response) => {
  const user = getUserByTelegramId((req as any).telegramUser.id);
  if (!user?.birth_date) { res.status(400).json({ error: 'Birth data not set' }); return; }
  if (!isSubscriptionActive(user)) { res.status(403).json({ error: 'Premium subscription required' }); return; }

  res.json({ content: await generateMonthlyHoroscope(user) });
});

router.get('/moon', requireAuth, (_req: Request, res: Response) => {
  res.json(getMoonPhase());
});

router.get('/lucky', requireAuth, (req: Request, res: Response) => {
  const user = getUserByTelegramId((req as any).telegramUser.id);
  let signIdx = 0;
  if (user?.birth_date) {
    const chart = getNatalChart(user.id);
    if (chart) signIdx = ZODIAC_SIGNS.indexOf(chart.sun_sign as any);
  }
  res.json(getLuckyDay(signIdx >= 0 ? signIdx : 0));
});

router.get('/natal-chart', requireAuth, async (req: Request, res: Response) => {
  const user = getUserByTelegramId((req as any).telegramUser.id);
  if (!user?.birth_date) { res.status(400).json({ error: 'Birth data not set' }); return; }
  if (!hasNatalChartAccess(user)) {
    res.status(403).json({ error: 'Natal chart access required', price: NATAL_CHART_PRICE });
    return;
  }

  const chart = calculateNatalChartForUser(
    user.birth_date, user.birth_time, user.birth_lat || 0, user.birth_lon || 0, user.timezone
  );

  const formatPlanet = (name: string, pos: typeof chart.sun) => ({
    name, sign: pos.sign, degree: pos.degree, minute: pos.minute,
    longitude: pos.longitude, retrograde: pos.retrograde || false,
    emoji: ZODIAC_EMOJI[pos.signIndex],
  });

  const monthKey = getCurrentMonthKey(user.timezone);
  let interpretation = getChartInterpretation(user.id, monthKey)?.content;
  if (!interpretation) {
    interpretation = await generateNatalInterpretation(chart, user.timezone, user.first_name);
    saveChartInterpretation(user.id, monthKey, interpretation);
  }

  const aspects = calculateAspects(chart).slice(0, 8).map(a => ({
    planet1: a.planet1, planet2: a.planet2, type: a.type, orb: a.orb,
  }));

  res.json({
    sun: formatPlanet('Солнце', chart.sun),
    moon: formatPlanet('Луна', chart.moon),
    mercury: formatPlanet('Меркурий', chart.mercury),
    venus: formatPlanet('Венера', chart.venus),
    mars: formatPlanet('Марс', chart.mars),
    jupiter: formatPlanet('Юпитер', chart.jupiter),
    saturn: formatPlanet('Сатурн', chart.saturn),
    uranus: formatPlanet('Уран', chart.uranus),
    neptune: formatPlanet('Нептун', chart.neptune),
    pluto: formatPlanet('Плутон', chart.pluto),
    ascendant: formatPlanet('Асцендент', chart.ascendant),
    houses: chart.houses,
    aspects,
    interpretation,
    monthKey,
  });
});

router.get('/compatibility', requireAuth, (req: Request, res: Response) => {
  const { sign1, sign2 } = req.query;
  if (!sign1 || !sign2) { res.status(400).json({ error: 'sign1 and sign2 required' }); return; }
  if (!ZODIAC_SIGNS.includes(sign1 as any) || !ZODIAC_SIGNS.includes(sign2 as any)) {
    res.status(400).json({ error: 'Invalid zodiac sign' }); return;
  }
  res.json(calculateCompatibility(sign1 as any, sign2 as any));
});

router.post('/cancel-subscription', requireAuth, (req: Request, res: Response) => {
  const tgUser = (req as any).telegramUser;
  cancelSubscription(tgUser.id);
  res.json({ success: true, message: 'Автопродление отключено' });
});

router.get('/payment-history', requireAuth, (req: Request, res: Response) => {
  const user = getUserByTelegramId((req as any).telegramUser.id);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ payments: getPaymentHistory(user.id) });
});

export default router;
