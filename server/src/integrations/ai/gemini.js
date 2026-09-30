const env = require('../../config/env');
const logger = require('../../utils/logger');

// Ordered fallback chain — fast & reliable first
const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
];
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Try one model once. Immediately returns parsed JSON on success, or null on error/503 to try next model.
 */
async function tryModel(model, system, user) {
  const url = `${BASE_URL}/${model}:generateContent?key=${env.geminiKey}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      }),
    });

    const json = await res.json();

    if (json.error) {
      logger.warn(`Gemini [${model}]: ${json.error.code} — ${json.error.message.slice(0, 80)}`);
      return null;
    }

    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      logger.warn(`Gemini [${model}] returned empty content`);
      return null;
    }

    logger.info(`Gemini ATS success via ${model}`);
    return JSON.parse(text);
  } catch (err) {
    logger.warn(`Gemini [${model}] fetch error: ${err.message}`);
    return null;
  }
}

/**
 * Try each model in the fallback chain.
 * Returns parsed JSON or null (callers fall back to rule-based ATS).
 */
async function completeJson(system, user) {
  if (!env.geminiKey) return null;

  for (const model of GEMINI_MODELS) {
    const result = await tryModel(model, system, user);
    if (result !== null) return result;
  }

  logger.warn('All Gemini models exhausted — using rule-based ATS fallback.');
  return null;
}

module.exports = { completeJson };
