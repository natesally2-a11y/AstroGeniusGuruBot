import { Router, Request, Response } from 'express';
import { Api } from 'grammy';
import { validateInitData } from '../utils/initData';
import {
  getNatalChart, getPaymentHistory,
  getHoroscope, saveHoroscope, getChartInterpretation, saveChartInterpretation,
} from '../database/queries';
import { resolveWebAppUser, userHasBirthData, localizedError } from './resolveUser';
import {
  calculateNatalChartForUser, ZODIAC_SIGNS, ZODIAC_EMOJI, calculateAspects,
} from '../astrology/engine';
import { calculateCompatibility } from '../astrology/compatibility';
import {
  generateDailyHoroscope, generateWeeklyHoroscope, generateMonthlyHoroscope,
} from '../astrology/horoscope';
import { generateTransitForecastResult } from '../astrology/transits';
import {
  generateNatalInterpretation, getNatalInterpretationCacheKey, isCompleteNatalInterpretation,
  buildNatalDecoding,
} from '../astrology/natalInterpretation';
import { calculateNatalAspects, buildNatalPreviewSummary } from '../astrology/natalDecoding';
import { getMoonPhase, getLuckyDay } from '../astrology/features';
import { getLocalDateKey, getCurrentMonthKey, getHoroscopeCacheKey } from '../astrology/timezone';
import {
  isSubscriptionActive, hasNatalChartAccess, cancelSubscription,
  sendSubscriptionInvoice, sendNatalChartInvoice,
  SUBSCRIPTION_PRICE, NATAL_CHART_PRICE,
} from '../payments/stars';
import { isAdmin } from '../config/admin';
import { isLifetimePremium } from '../config/vip';
import { getUserLang, normalizeLangCode, t } from '../i18n';
import { translateSign, translatePlanet, localizeMoon } from '../i18n/astro';
import { logger } from '../utils/logger';

const router = Router();
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const IS_DEV = process.env.NODE_ENV !== 'production';
const botApi = BOT_TOKEN ? new Api(BOT_TOKEN) : null;

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

function birthDataError(res: Response, user?: ReturnType<typeof resolveWebAppUser>): void {
  res.status(400).json({ error: localizedError(user, 'webapp.birth_required'), needsBirthData: true });
}

router.get('/user', requireAuth, (req: Request, res: Response) => {
  const tgUser = (req as any).telegramUser;
  const user = resolveWebAppUser(tgUser);

  const chart = getNatalChart(user.id);
  const isPremium = isSubscriptionActive(user);
  const hasChart = hasNatalChartAccess(user);
  const userIsAdmin = isAdmin(user);

  const lang = getUserLang(user);

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
    isAdmin: userIsAdmin,
    isLifetimeVip: isLifetimePremium(user),
    hasNatalChart: hasChart,
    hasBirthData: userHasBirthData(user),
    autoRenew: user.auto_renew !== 0,
    subscriptionExpires: user.subscription_expires,
    natalChartExpires: user.natal_chart_unlocked_until,
    language: lang,
    languageCode: user.language_code,
    prices: { subscription: SUBSCRIPTION_PRICE, natalChart: NATAL_CHART_PRICE },
    chart: chart ? {
      sunSign: chart.sun_sign,
      moonSign: chart.moon_sign,
      risingSign: chart.rising_sign,
      sunSignLocalized: translateSign(lang, chart.sun_sign),
      moonSignLocalized: translateSign(lang, chart.moon_sign),
      risingSignLocalized: translateSign(lang, chart.rising_sign),
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
  const user = resolveWebAppUser((req as any).telegramUser);
  if (!userHasBirthData(user)) { birthDataError(res, user); return; }

  const cacheKey = getHoroscopeCacheKey(user);
  const cached = getHoroscope(user.id, cacheKey);
  const content = cached?.content || await generateDailyHoroscope(user);
  if (!cached) saveHoroscope({ user_id: user.id, date: cacheKey, content });

  res.json({
    date: getLocalDateKey(user.timezone),
    content,
    isPremium: isSubscriptionActive(user),
  });
});

router.get('/horoscope/weekly', requireAuth, async (req: Request, res: Response) => {
  const user = resolveWebAppUser((req as any).telegramUser);
  if (!userHasBirthData(user)) { birthDataError(res, user); return; }
  if (!isSubscriptionActive(user)) { res.status(403).json({ error: t(getUserLang(user), 'webapp.premium_required') }); return; }

  res.json({ content: await generateWeeklyHoroscope(user) });
});

router.get('/horoscope/monthly', requireAuth, async (req: Request, res: Response) => {
  const user = resolveWebAppUser((req as any).telegramUser);
  if (!userHasBirthData(user)) { birthDataError(res, user); return; }
  if (!isSubscriptionActive(user)) { res.status(403).json({ error: t(getUserLang(user), 'webapp.premium_required') }); return; }

  res.json({ content: await generateMonthlyHoroscope(user) });
});

router.get('/moon', requireAuth, (req: Request, res: Response) => {
  const user = resolveWebAppUser((req as any).telegramUser);
  const lang = getUserLang(user);
  res.json(localizeMoon(getMoonPhase(), lang));
});

router.get('/lucky', requireAuth, (req: Request, res: Response) => {
  const user = resolveWebAppUser((req as any).telegramUser);
  const lang = getUserLang(user);
  let signIdx = 0;
  if (user?.birth_date) {
    const chart = getNatalChart(user.id);
    if (chart) signIdx = ZODIAC_SIGNS.indexOf(chart.sun_sign as any);
  }
  const lucky = getLuckyDay(signIdx >= 0 ? signIdx : 0);
  res.json({ ...lucky, sign: translateSign(lang, lucky.sign) });
});

router.get('/natal-chart', requireAuth, async (req: Request, res: Response) => {
  const user = resolveWebAppUser((req as any).telegramUser);
  const lang = getUserLang(user);
  if (!userHasBirthData(user)) {
    logger.warn('Natal chart: birth data missing', { telegramId: user.telegram_id });
    birthDataError(res, user);
    return;
  }
  const birthDate = user.birth_date!.trim();
  const chart = calculateNatalChartForUser(
    birthDate, user.birth_time, user.birth_lat || 0, user.birth_lon || 0, user.timezone
  );

  const formatPlanet = (key: string, pos: typeof chart.sun) => ({
    name: translatePlanet(lang, key),
    sign: translateSign(lang, pos.sign),
    signKey: pos.sign,
    degree: pos.degree, minute: pos.minute,
    longitude: pos.longitude, retrograde: pos.retrograde || false,
    emoji: ZODIAC_EMOJI[pos.signIndex],
  });

  const chartPayload = {
    sun: formatPlanet('sun', chart.sun),
    moon: formatPlanet('moon', chart.moon),
    mercury: formatPlanet('mercury', chart.mercury),
    venus: formatPlanet('venus', chart.venus),
    mars: formatPlanet('mars', chart.mars),
    jupiter: formatPlanet('jupiter', chart.jupiter),
    saturn: formatPlanet('saturn', chart.saturn),
    uranus: formatPlanet('uranus', chart.uranus),
    neptune: formatPlanet('neptune', chart.neptune),
    pluto: formatPlanet('pluto', chart.pluto),
    ascendant: formatPlanet('ascendant', chart.ascendant),
    houses: chart.houses,
  };

  if (!hasNatalChartAccess(user)) {
    res.json({
      ...chartPayload,
      isPreview: true,
      preview: buildNatalPreviewSummary(chart, lang),
      prices: { subscription: SUBSCRIPTION_PRICE, natalChart: NATAL_CHART_PRICE },
    });
    return;
  }

  const monthKey = getNatalInterpretationCacheKey(user.timezone, lang);
  let interpretation = getChartInterpretation(user.id, monthKey)?.content;
  const staleLang = interpretation && /Дом личности|Дома гороскопа/.test(interpretation) && lang !== 'ru';
  const staleVersion = interpretation && !interpretation.includes('[PLANETS_IN_SIGNS]') && !isCompleteNatalInterpretation(interpretation);
  if (!interpretation || !isCompleteNatalInterpretation(interpretation) || staleLang || staleVersion) {
    interpretation = await generateNatalInterpretation(
      chart, user.timezone, user.first_name, lang,
      { date: birthDate, time: user.birth_time || undefined, city: user.birth_city || undefined, timezone: user.timezone || undefined }
    );
    saveChartInterpretation(user.id, monthKey, interpretation);
  }

  const decoding = buildNatalDecoding(chart, lang, interpretation, {
    date: birthDate,
    time: user.birth_time || undefined,
    city: user.birth_city || undefined,
    timezone: user.timezone || undefined,
  });

  const aspects = calculateNatalAspects(chart).slice(0, 12).map(a => ({
    planet1: a.planet1, planet2: a.planet2, type: a.type, orb: a.orb,
  }));

  res.json({
    ...chartPayload,
    isPreview: false,
    aspects,
    interpretation,
    decoding,
    monthKey,
  });
});

router.get('/compatibility', requireAuth, (req: Request, res: Response) => {
  const user = resolveWebAppUser((req as any).telegramUser);
  const lang = getUserLang(user);
  const { sign1, sign2 } = req.query;
  if (!sign1 || !sign2) { res.status(400).json({ error: t(lang, 'webapp.signs_required') }); return; }
  if (!ZODIAC_SIGNS.includes(sign1 as any) || !ZODIAC_SIGNS.includes(sign2 as any)) {
    res.status(400).json({ error: t(lang, 'webapp.invalid_signs') }); return;
  }
  const result = calculateCompatibility(sign1 as any, sign2 as any);
  res.json({
    ...result,
    sign1Localized: translateSign(lang, result.sign1),
    sign2Localized: translateSign(lang, result.sign2),
  });
});

router.post('/cancel-subscription', requireAuth, (req: Request, res: Response) => {
  const tgUser = (req as any).telegramUser;
  const user = resolveWebAppUser(tgUser);
  if (user && isAdmin(user)) {
    res.status(400).json({ error: t(getUserLang(user), 'webapp.admin_lifetime') });
    return;
  }
  cancelSubscription(tgUser.id);
  res.json({ success: true, message: t(getUserLang(user), 'webapp.auto_renew_off') });
});

router.post('/invoice/subscribe', requireAuth, async (req: Request, res: Response) => {
  const tgUser = (req as any).telegramUser;
  const user = resolveWebAppUser(tgUser);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  if (!botApi) { res.status(500).json({ error: 'Bot not configured' }); return; }
  try {
    await sendSubscriptionInvoice(botApi, tgUser.id, user.id, false, user);
    res.json({ success: true, message: t(getUserLang(user), 'webapp.invoice_sent') });
  } catch (error) {
    logger.error('Invoice subscribe error', { error });
    res.status(500).json({ error: t(getUserLang(user), 'webapp.invoice_failed_sub') });
  }
});

router.post('/invoice/natal-chart', requireAuth, async (req: Request, res: Response) => {
  const tgUser = (req as any).telegramUser;
  const user = resolveWebAppUser(tgUser);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  if (!user.birth_date) { res.status(400).json({ error: t(getUserLang(user), 'webapp.birth_required') }); return; }
  if (!botApi) { res.status(500).json({ error: 'Bot not configured' }); return; }
  try {
    await sendNatalChartInvoice(botApi, tgUser.id, user.id, user);
    res.json({ success: true, message: t(getUserLang(user), 'webapp.invoice_sent') });
  } catch (error) {
    logger.error('Invoice natal-chart error', { error });
    res.status(500).json({ error: t(getUserLang(user), 'webapp.invoice_failed_chart') });
  }
});

router.get('/transits', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = resolveWebAppUser((req as any).telegramUser);
    if (!userHasBirthData(user)) { birthDataError(res, user); return; }

    const { content, transits } = await generateTransitForecastResult(user);
    res.json({ content, transits });
  } catch (error) {
    logger.error('Transits endpoint error', { error });
    const user = resolveWebAppUser((req as any).telegramUser);
    res.status(500).json({ error: t(getUserLang(user), 'webapp.transits_error') });
  }
});

router.get('/payment-history', requireAuth, (req: Request, res: Response) => {
  const user = resolveWebAppUser((req as any).telegramUser);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ payments: getPaymentHistory(user.id) });
});

export default router;
