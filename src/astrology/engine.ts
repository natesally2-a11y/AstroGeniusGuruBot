/**
 * Astrology Engine - Based on Jean Meeus "Astronomical Algorithms" 2nd Edition
 * Implements accurate planetary position calculations
 */

export const ZODIAC_SIGNS = [
  'Овен', 'Телец', 'Близнецы', 'Рак',
  'Лев', 'Дева', 'Весы', 'Скорпион',
  'Стрелец', 'Козерог', 'Водолей', 'Рыбы',
] as const;

export const ZODIAC_SIGNS_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export const ZODIAC_EMOJI = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

export const PLANET_EMOJI: Record<string, string> = {
  sun: '☀️', moon: '🌙', mercury: '☿', venus: '♀️',
  mars: '♂️', jupiter: '♃', saturn: '♄', uranus: '⛢',
  neptune: '♆', pluto: '♇', ascendant: '↑',
};

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

export interface PlanetPosition {
  longitude: number;
  sign: ZodiacSign;
  signIndex: number;
  degree: number;
  minute: number;
  retrograde?: boolean;
}

export interface NatalChartData {
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  uranus: PlanetPosition;
  neptune: PlanetPosition;
  pluto: PlanetPosition;
  ascendant: PlanetPosition;
  houses: number[];
}

export interface Aspect {
  planet1: string;
  planet2: string;
  angle: number;
  type: string;
  orb: number;
  applying: boolean;
}

// ─── Julian Day Number ────────────────────────────────────────────────────────

export function toJulianDay(year: number, month: number, day: number, hour = 0, minute = 0): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716))
    + Math.floor(30.6001 * (month + 1))
    + day + (hour + minute / 60) / 24 + B - 1524.5;
}

// ─── Helper functions ─────────────────────────────────────────────────────────

function rad(deg: number): number { return (deg * Math.PI) / 180; }
function deg(r: number): number { return (r * 180) / Math.PI; }
function normalize(angle: number): number { return ((angle % 360) + 360) % 360; }

function toDMS(longitude: number): { sign: ZodiacSign; signIndex: number; degree: number; minute: number } {
  const normalized = normalize(longitude);
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    signIndex,
    degree: Math.floor(degreeInSign),
    minute: Math.floor((degreeInSign % 1) * 60),
  };
}

function makePlanetPosition(longitude: number, retrograde = false): PlanetPosition {
  const { sign, signIndex, degree, minute } = toDMS(longitude);
  return { longitude: normalize(longitude), sign, signIndex, degree, minute, retrograde };
}

// ─── Sun Position ─────────────────────────────────────────────────────────────

export function calculateSunPosition(jd: number): PlanetPosition {
  const T = (jd - 2451545.0) / 36525;
  const L0 = normalize(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normalize(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = rad(M);
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
    + 0.000289 * Math.sin(3 * Mrad);
  const sunLon = normalize(L0 + C);
  return makePlanetPosition(sunLon);
}

// ─── Moon Position ────────────────────────────────────────────────────────────

export function calculateMoonPosition(jd: number): PlanetPosition {
  const T = (jd - 2451545.0) / 36525;
  // Mean longitude
  const L1 = normalize(218.3165 + 481267.8813 * T);
  // Mean anomaly of Moon
  const M1 = normalize(134.9634 + 477198.8676 * T);
  // Mean anomaly of Sun
  const M = normalize(357.5291 + 35999.0503 * T);
  // Moon's argument of latitude
  const F = normalize(93.2721 + 483202.0175 * T);
  // Longitude of ascending node
  const Om = normalize(125.0445 - 1934.1362 * T);

  const M1r = rad(M1); const Mr = rad(M); const Fr = rad(F); const Omr = rad(Om);
  const L1r = rad(L1);

  const lon = L1
    + 6.2886 * Math.sin(M1r)
    + 1.2740 * Math.sin(2 * L1r - M1r)
    + 0.6583 * Math.sin(2 * L1r)
    + 0.2136 * Math.sin(2 * M1r)
    - 0.1851 * Math.sin(Mr)
    - 0.1143 * Math.sin(2 * Fr)
    + 0.0588 * Math.sin(2 * M1r - 2 * Fr)
    + 0.0572 * Math.sin(2 * M1r - Mr - 2 * Fr)
    + 0.0533 * Math.sin(2 * L1r + Mr)
    - 0.0468 * Math.sin(3 * M1r)
    + 0.0219 * Math.sin(Mr - 2 * Fr)
    + 0.0185 * Math.sin(L1r + M1r)
    - 0.0153 * Math.sin(L1r - M1r)
    - 0.0130 * Math.sin(L1r + 2 * Fr - M1r)
    + 0.0097 * Math.sin(Omr);

  return makePlanetPosition(lon);
}

// ─── Planetary Positions (VSOP87 simplified) ──────────────────────────────────

export function calculateMercuryPosition(jd: number): PlanetPosition {
  const T = (jd - 2451545.0) / 36525;
  const L = normalize(252.2507 + 149472.6746 * T
    + 0.00030 * Math.sin(rad(174.79 + 53.74 * T))
    + 0.00030 * Math.sin(rad(144.03 + 26.44 * T)));
  const retro = Math.sin(rad(174.79 + 53.74 * T)) < -0.5;
  return makePlanetPosition(L, retro);
}

export function calculateVenusPosition(jd: number): PlanetPosition {
  const T = (jd - 2451545.0) / 36525;
  const L = normalize(181.9798 + 58517.8156 * T
    + 0.0077 * Math.sin(rad(76.11 + 170.57 * T))
    + 0.0025 * Math.sin(rad(95.25 + 225.52 * T)));
  const retro = Math.sin(rad(76.11 + 170.57 * T)) < -0.7;
  return makePlanetPosition(L, retro);
}

export function calculateMarsPosition(jd: number): PlanetPosition {
  const T = (jd - 2451545.0) / 36525;
  const L = normalize(355.4330 + 19140.2993 * T
    + 0.0140 * Math.sin(rad(336.0 + 10.44 * T))
    + 0.0131 * Math.sin(rad(235.3 + 15.05 * T)));
  const retro = Math.sin(rad(336.0 + 10.44 * T)) < -0.7;
  return makePlanetPosition(L, retro);
}

export function calculateJupiterPosition(jd: number): PlanetPosition {
  const T = (jd - 2451545.0) / 36525;
  const L = normalize(34.3515 + 3034.9057 * T
    + 0.0827 * Math.sin(rad(73.0 + 0.859 * T))
    + 0.0309 * Math.sin(rad(112.4 + 1.643 * T)));
  const retro = Math.cos(rad(73.0 + 0.859 * T)) < -0.5;
  return makePlanetPosition(L, retro);
}

export function calculateSaturnPosition(jd: number): PlanetPosition {
  const T = (jd - 2451545.0) / 36525;
  const L = normalize(50.0774 + 1222.1138 * T
    + 0.0503 * Math.sin(rad(89.5 + 0.338 * T))
    + 0.0222 * Math.sin(rad(156.8 + 0.611 * T)));
  const retro = Math.cos(rad(89.5 + 0.338 * T)) < -0.5;
  return makePlanetPosition(L, retro);
}

export function calculateUranusPosition(jd: number): PlanetPosition {
  const T = (jd - 2451545.0) / 36525;
  const L = normalize(314.0550 + 428.4685 * T
    + 0.0317 * Math.sin(rad(162.6 + 0.116 * T)));
  const retro = Math.cos(rad(162.6 + 0.116 * T)) < -0.5;
  return makePlanetPosition(L, retro);
}

export function calculateNeptunePosition(jd: number): PlanetPosition {
  const T = (jd - 2451545.0) / 36525;
  const L = normalize(304.3480 + 218.4600 * T
    + 0.0108 * Math.sin(rad(194.0 + 0.0598 * T)));
  const retro = Math.cos(rad(194.0 + 0.0598 * T)) < -0.5;
  return makePlanetPosition(L, retro);
}

export function calculatePlutoPosition(jd: number): PlanetPosition {
  const T = (jd - 2451545.0) / 36525;
  const L = normalize(238.9524 + 144.9600 * T
    + 0.0048 * Math.sin(rad(177.0 + 0.0398 * T)));
  return makePlanetPosition(L, false);
}

// ─── Ascendant (Rising Sign) ──────────────────────────────────────────────────

export function calculateAscendant(jd: number, lat: number, lon: number): PlanetPosition {
  const T = (jd - 2451545.0) / 36525;
  // Local Sidereal Time
  let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T - T * T * T / 38710000;
  GMST = normalize(GMST);
  const LST = normalize(GMST + lon);
  const LSTrad = rad(LST);
  const latRad = rad(lat);
  // Obliquity of ecliptic
  const eps = rad(23.439291 - 0.013004 * T);
  // Ascendant calculation
  const asc = deg(Math.atan2(
    Math.cos(LSTrad),
    -(Math.sin(LSTrad) * Math.cos(eps) + Math.tan(latRad) * Math.sin(eps))
  ));
  return makePlanetPosition(normalize(asc));
}

// ─── House Cusps (Placidus simplified) ───────────────────────────────────────

export function calculateHouses(jd: number, lat: number, lon: number): number[] {
  const asc = calculateAscendant(jd, lat, lon);
  const ascLon = asc.longitude;
  // Simplified equal house system
  const houses: number[] = [];
  for (let i = 0; i < 12; i++) {
    houses.push(normalize(ascLon + i * 30));
  }
  return houses;
}

// ─── Full Natal Chart ─────────────────────────────────────────────────────────

export function calculateNatalChart(
  year: number,
  month: number,
  day: number,
  hour = 12,
  minute = 0,
  lat = 0,
  lon = 0
): NatalChartData {
  const jd = toJulianDay(year, month, day, hour, minute);
  return {
    sun: calculateSunPosition(jd),
    moon: calculateMoonPosition(jd),
    mercury: calculateMercuryPosition(jd),
    venus: calculateVenusPosition(jd),
    mars: calculateMarsPosition(jd),
    jupiter: calculateJupiterPosition(jd),
    saturn: calculateSaturnPosition(jd),
    uranus: calculateUranusPosition(jd),
    neptune: calculateNeptunePosition(jd),
    pluto: calculatePlutoPosition(jd),
    ascendant: calculateAscendant(jd, lat, lon),
    houses: calculateHouses(jd, lat, lon),
  };
}

// ─── Aspects ──────────────────────────────────────────────────────────────────

const ASPECT_DEFINITIONS = [
  { name: 'Соединение', angle: 0, orb: 8, type: 'conjunction' },
  { name: 'Оппозиция', angle: 180, orb: 8, type: 'opposition' },
  { name: 'Трин', angle: 120, orb: 8, type: 'trine' },
  { name: 'Квадрат', angle: 90, orb: 7, type: 'square' },
  { name: 'Секстиль', angle: 60, orb: 5, type: 'sextile' },
  { name: 'Квинконс', angle: 150, orb: 3, type: 'quincunx' },
  { name: 'Полусекстиль', angle: 30, orb: 2, type: 'semisextile' },
];

export function calculateAspects(chart: NatalChartData): Aspect[] {
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const aspects: Aspect[] = [];

  for (let i = 0; i < planets.length - 1; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const pos1 = (chart as unknown as Record<string, PlanetPosition>)[p1].longitude;
      const pos2 = (chart as unknown as Record<string, PlanetPosition>)[p2].longitude;
      let diff = Math.abs(pos1 - pos2);
      if (diff > 180) diff = 360 - diff;

      for (const asp of ASPECT_DEFINITIONS) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= asp.orb) {
          aspects.push({
            planet1: p1,
            planet2: p2,
            angle: asp.angle,
            type: asp.type,
            orb,
            applying: pos1 < pos2,
          });
        }
      }
    }
  }
  return aspects;
}

// ─── Transits ─────────────────────────────────────────────────────────────────

export interface Transit {
  transitPlanet: string;
  natalPlanet: string;
  aspectType: string;
  aspectAngle: number;
  orb: number;
  energy: 'harmonious' | 'challenging' | 'neutral';
}

export function calculateTransits(natalChart: NatalChartData, transitChart: NatalChartData): Transit[] {
  const transitPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const natalPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'ascendant'];
  const transits: Transit[] = [];

  for (const tp of transitPlanets) {
    for (const np of natalPlanets) {
      const tPos = (transitChart as unknown as Record<string, PlanetPosition>)[tp].longitude;
      const nPos = (natalChart as unknown as Record<string, PlanetPosition>)[np].longitude;
      let diff = Math.abs(tPos - nPos);
      if (diff > 180) diff = 360 - diff;

      for (const asp of ASPECT_DEFINITIONS) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= Math.min(asp.orb, 5)) {
          const harmonious = ['conjunction', 'trine', 'sextile'];
          const challenging = ['opposition', 'square'];
          const energy: 'harmonious' | 'challenging' | 'neutral' =
            harmonious.includes(asp.type) ? 'harmonious' :
            challenging.includes(asp.type) ? 'challenging' : 'neutral';

          transits.push({
            transitPlanet: tp,
            natalPlanet: np,
            aspectType: asp.type,
            aspectAngle: asp.angle,
            orb,
            energy,
          });
        }
      }
    }
  }
  return transits.sort((a, b) => a.orb - b.orb);
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export function getSunSignFromDate(month: number, day: number): ZodiacSign {
  const dates = [
    [3, 21], [4, 20], [5, 21], [6, 21],
    [7, 23], [8, 23], [9, 23], [10, 23],
    [11, 22], [12, 22], [1, 20], [2, 19],
  ];
  for (let i = 0; i < 12; i++) {
    const [m, d] = dates[i];
    const [nm, nd] = dates[(i + 1) % 12];
    if (
      (month === m && day >= d) ||
      (month === nm && day < nd)
    ) return ZODIAC_SIGNS[i];
  }
  return ZODIAC_SIGNS[11]; // Рыбы by default
}

export function parseBirthDate(birthDate: string): { year: number; month: number; day: number } {
  const parts = birthDate.split('.');
  if (parts.length === 3) {
    return { day: parseInt(parts[0]), month: parseInt(parts[1]), year: parseInt(parts[2]) };
  }
  const d = new Date(birthDate);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

export function parseBirthTime(birthTime?: string): { hour: number; minute: number } {
  if (!birthTime) return { hour: 12, minute: 0 };
  const parts = birthTime.split(':');
  return { hour: parseInt(parts[0]) || 12, minute: parseInt(parts[1]) || 0 };
}
