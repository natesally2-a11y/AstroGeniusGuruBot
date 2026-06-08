import axios from 'axios';
import { logger } from '../utils/logger';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export async function generateAstrologyText(
  systemPrompt: string,
  userPrompt: string,
  fallback: string
): Promise<string> {
  if (!OPENAI_API_KEY) {
    return fallback;
  }

  try {
    const response = await axios.post(
      `${OPENAI_BASE_URL}/chat/completions`,
      {
        model: OPENAI_MODEL,
        temperature: 0.85,
        max_tokens: 900,
        messages: [
          {
            role: 'system',
            content:
              'Ты профессиональный астролог. Пиши на русском, точно, без эзотерического пафоса. ' +
              'Опирайся только на переданные астрологические данные. Не выдумывай факты. ' +
              systemPrompt,
          },
          { role: 'user', content: userPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 25000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content?.trim();
    return text || fallback;
  } catch (error) {
    logger.warn('AI generation failed, using fallback', { error });
    return fallback;
  }
}
