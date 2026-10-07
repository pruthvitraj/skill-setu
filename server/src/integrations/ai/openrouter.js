const env = require('../../config/env');
const { createJsonAdapter, ProviderError } = require('./json-adapter');
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const FREE_MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free';
function createOpenRouterAdapter(options = {}) {
  const model = options.model ?? env.openrouterModel;
  if (model !== FREE_MODEL) {
    throw new ProviderError('OpenRouter', 'AI_CONFIG', undefined, `OPENROUTER_MODEL must be exactly ${FREE_MODEL}; paid or alternate models are disabled.`);
  }
  return createJsonAdapter({ key: env.openrouterKey, timeoutMs: env.aiTimeoutMs,
    maxTokens: env.aiMaxTokens, quotaCooldownMs: env.aiQuotaCooldownMs, ...options,
    provider: 'OpenRouter', model, endpoint: ENDPOINT,
    // No response_format, models fallback list, plugins or tools. JSON is prompt-driven.
    request: (system, user, maxTokens) => ({
      model, messages: [
        { role: 'system', content: `${system}\nReturn a single valid JSON object only, without commentary or Markdown fences.` },
        { role: 'user', content: user },
      ], max_tokens: maxTokens, temperature: 0.3, stream: false,
      provider: { allow_fallbacks: false, max_price: { prompt: 0, completion: 0 } },
    }),
    extract: envelope => envelope.choices?.[0]?.finish_reason === 'stop'
      ? envelope.choices[0].message?.content : null,
  });
}
module.exports = { createOpenRouterAdapter, ENDPOINT, FREE_MODEL };
