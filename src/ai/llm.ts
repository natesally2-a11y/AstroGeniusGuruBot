import axios from 'axios';
import { logger } from '../utils/logger';
import { getAiLanguageInstruction, LangCode, normalizeLangCode, t } from '../i18n';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'google/gemini-2.5-flash';
const OPENAI_APP_TITLE = process.env.OPENAI_APP_TITLE || 'AstroGuru Bot';
const OPENAI_HTTP_REFERER = process.env.OPENAI_HTTP_REFERER || 'https://astroguru-production.up.railway.app';

function buildAstrologerSystem(lang?: LangCode | string): string {
  const L = normalizeLangCode(lang);
  return `${t(L, 'ai.system')} ${getAiLanguageInstruction(L)}`;
}

export function isAiEnabled(): boolean {
  return Boolean(OPENAI_API_KEY);
}

export function getAiConfig(): { model: string; baseUrl: string } {
  return { model: OPENAI_MODEL, baseUrl: OPENAI_BASE_URL };
}

export async function generateAstrologyText(
  systemPrompt: string,
  userPrompt: string,
  fallback: string,
  maxTokens = 900,
  timeoutMs = 45000,
  lang?: LangCode | string
): Promise<string> {
  if (!OPENAI_API_KEY) {
    return fallback;
  }

  try {
    const response = await axios.post(
      `${OPENAI_BASE_URL}/chat/completions`,
      {
        model: OPENAI_MODEL,
        temperature: 0.82,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: `${buildAstrologerSystem(lang)}\n\n${systemPrompt}` },
          { role: 'user', content: userPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': OPENAI_HTTP_REFERER,
          'X-Title': OPENAI_APP_TITLE,
        },
        timeout: timeoutMs,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content?.trim();
    if (text) {
      logger.debug('AI text generated', { model: OPENAI_MODEL, chars: text.length });
      return text;
    }
    logger.warn('AI returned empty response, using fallback');
    return fallback;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    logger.warn('AI generation failed, using fallback', {
      model: OPENAI_MODEL,
      error: err.response?.data || err.message || error,
    });
    return fallback;
  }
}
