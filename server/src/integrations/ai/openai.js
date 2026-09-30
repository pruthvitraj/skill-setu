const env = require('../../config/env');
const logger = require('../../utils/logger');

async function completeJson(system, user) {
  if (!env.openaiKey) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.openaiModel,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;
    return content ? JSON.parse(content) : null;
  } catch (err) {
    logger.warn(`OpenAI fallback: ${err.message}`);
    return null;
  }
}

module.exports = { completeJson };
