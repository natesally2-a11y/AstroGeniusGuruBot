import { Router, Request, Response } from 'express';
import { validateInitData } from '../utils/initData';
import {
  getUserByTelegramId, getNatalChart, getPaymentHistory,
  getHoroscope, saveHoroscope,
} from '../database/queries';
import { calculateNatalChart, parseBirthDate, parseBirthTime, ZODIAC_SIGNS, ZODIAC_EMOJI } from '../astrology/engine';
import { calculateCompatibility } from '../astrology/compatibility';
import { generateDailyHoroscope, generateWeeklyHoroscope } from '../astrology/horoscope';
import { isSubscriptionActive } from '../payments/stars';
import { logger } from '../utils/logger';

const router = Router();
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const IS_DEV = process.env.NODE_ENV !== 'production';

// ─── Middleware: validate Telegram initData ───────────────────────────────────

function requireAuth(req: Request, res: Response, next: () => void): void {
  const initData = req.headers['x-init-data'] as string || req.query.initData as string;

  // Dev mode: allow requests with ?dev_id=<telegram_id> for testing
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

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/user', requireAuth, (req: Request, res: Response) => {
  const tgUser = (req as any).telegramUser;
  const user = getUserByTelegramId(tgUser.id);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const chart = getNatalChart(user.id);
  const isPremium = isSubscriptionActive(user);

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
    subscriptionExpires: user.subscription_expires,
    chart: chart ? {
      sunSign: chart.sun_sign,
      moonSign: chart.moon_sign,
      risingSign: chart.rising_sign,
      sunDegree: chart.sun_degree,
      moonDegree: chart.moon_degree,
      risingDegree: chart.rising_degree,
      planets: {
        mercury: chart.mercury_sign,
        venus: chart.venus_sign,
        mars: chart.mars_sign,
        jupiter: chart.jupiter_sign,
        saturn: chart.saturn_sign,
        uranus: chart.uranus_sign,
        neptune: chart.neptune_sign,
        pluto: chart.pluto_sign,
      },
      chartData: chart.chart_data ? JSON.parse(chart.chart_data) : null,
    } : null,
  });
});

router.get('/horoscope/daily', requireAuth, (req: Request, res: Response) => {
  const tgUser = (req as any).telegramUser;
  const user = getUserByTelegramId(tgUser.id);

  if (!user || !user.birth_date) {
    res.status(400).json({ error: 'Birth data not set' });
    return;
  }

  const today = new Date();
  const dateKey = today.toISOString().split('T')[0];
  const cached = getHoroscope(user.id, dateKey);

  let content: string;
  if (cached) {
    content = cached.content;
  } else {
    content = generateDailyHoroscope(user, today);
    saveHoroscope({ user_id: user.id, date: dateKey, content });
  }

  res.json({
    date: dateKey,
    content,
    isPremium: isSubscriptionActive(user),
  });
});

router.get('/horoscope/weekly', requireAuth, (req: Request, res: Response) => {
  const tgUser = (req as any).telegramUser;
  const user = getUserByTelegramId(tgUser.id);

  if (!user || !user.birth_date) {
    res.status(400).json({ error: 'Birth data not set' });
    return;
  }

  if (!isSubscriptionActive(user)) {
    res.status(403).json({ error: 'Premium subscription required' });
    return;
  }

  const content = generateWeeklyHoroscope(user);
  res.json({ content });
});

router.get('/natal-chart', requireAuth, (req: Request, res: Response) => {
  const tgUser = (req as any).telegramUser;
  const user = getUserByTelegramId(tgUser.id);

  if (!user || !user.birth_date) {
    res.status(400).json({ error: 'Birth data not set' });
    return;
  }

  if (!isSubscriptionActive(user)) {
    res.status(403).json({ error: 'Premium subscription required' });
    return;
  }

  const { year, month, day } = parseBirthDate(user.birth_date);
  const { hour, minute } = parseBirthTime(user.birth_time);
  const chart = calculateNatalChart(year, month, day, hour, minute, user.birth_lat || 0, user.birth_lon || 0);

  const formatPlanet = (name: string, pos: { sign: string; degree: number; minute: number; retrograde?: boolean }) => ({
    name,
    sign: pos.sign,
    degree: pos.degree,
    minute: pos.minute,
    longitude: pos.degree + pos.minute / 60,
    retrograde: pos.retrograde || false,
    emoji: ZODIAC_EMOJI[ZODIAC_SIGNS.indexOf(pos.sign as any)],
  });

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
  });
});

router.get('/compatibility', requireAuth, (req: Request, res: Response) => {
  const { sign1, sign2 } = req.query;

  if (!sign1 || !sign2) {
    res.status(400).json({ error: 'sign1 and sign2 are required' });
    return;
  }

  if (!ZODIAC_SIGNS.includes(sign1 as any) || !ZODIAC_SIGNS.includes(sign2 as any)) {
    res.status(400).json({ error: 'Invalid zodiac sign' });
    return;
  }

  const result = calculateCompatibility(sign1 as any, sign2 as any);
  res.json(result);
});

router.get('/payment-history', requireAuth, (req: Request, res: Response) => {
  const tgUser = (req as any).telegramUser;
  const user = getUserByTelegramId(tgUser.id);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const history = getPaymentHistory(user.id);
  res.json({ payments: history });
});

export default router;
