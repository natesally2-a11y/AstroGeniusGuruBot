const PRODUCTION_BASE = 'https://astroguru-production.up.railway.app';

export const APP_BASE_URL = (process.env.WEBHOOK_URL || PRODUCTION_BASE).replace(/\/$/, '');

export const MINI_APP_URL = (process.env.MINI_APP_URL || `${APP_BASE_URL}/app`).replace(/\/$/, '');
