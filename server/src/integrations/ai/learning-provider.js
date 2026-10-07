const crypto = require('node:crypto');
const env = require('../../config/env');
const { createNvidiaAdapter } = require('./nvidia');
const { createOpenRouterAdapter } = require('./openrouter');
const { createJsonAdapter, ProviderError } = require('./json-adapter');
const clients = new Map();
function client(name) {
  const key = { openrouter: env.openrouterKey, nvidia: env.nvidiaKey, openai: env.openaiKey, gemini: env.geminiKey }[name];
  const model = { openrouter: env.openrouterModel, nvidia: env.nvidiaModel, openai: env.openaiModel, gemini: env.geminiModel }[name];
  const fingerprint = crypto.createHash('sha256').update(`${key || ''}:${model}`).digest('hex');
  const cacheKey = `${name}:${fingerprint}`;
  if (!clients.has(cacheKey)) {
    const options = { key, model, timeoutMs: env.aiTimeoutMs, maxTokens: env.aiMaxTokens, quotaCooldownMs: env.aiQuotaCooldownMs };
    if (name === 'openrouter') clients.set(cacheKey, createOpenRouterAdapter(options));
    else if (name === 'nvidia') clients.set(cacheKey, createNvidiaAdapter(options));
    else if (name === 'openai') clients.set(cacheKey, createJsonAdapter({ ...options, provider: 'OpenAI', endpoint: 'https://api.openai.com/v1/chat/completions' }));
    else if (name === 'gemini') clients.set(cacheKey, createJsonAdapter({ ...options, provider: 'Gemini', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      request: (system, user, maxOutputTokens) => ({ system_instruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.3, maxOutputTokens } }),
      extract: envelope => envelope.candidates?.[0]?.finishReason === 'MAX_TOKENS' ? null : envelope.candidates?.[0]?.content?.parts?.map(part => part.text || '').join(''),
    }));
    else throw new ProviderError('AI', 'AI_CONFIG', undefined, 'Select openrouter, nvidia, openai, gemini or auto with AI_PROVIDER.');
  }
  return clients.get(cacheKey);
}
async function generateJson(system, user, validator) {
  const names = env.aiProvider === 'auto'
    ? ['gemini', 'openai', 'nvidia'].filter(name => ({ gemini: env.geminiKey, openai: env.openaiKey, nvidia: env.nvidiaKey })[name])
    : [env.aiProvider];
  let lastError = new ProviderError('AI', 'AI_CONFIG', undefined, 'No configured AI provider is available.');
  for (const name of names) {
    try {
      const adapter = client(name);
      const raw = await adapter.completeJson(system, user);
      const content = validator(raw);
      if (!content) throw new ProviderError(adapter.provider, 'AI_INVALID_RESPONSE', 200, 'Generated content failed the existing learning validator.');
      return { content, raw, provider: name, model: adapter.model };
    } catch (error) {
      if (!(error instanceof ProviderError)) throw error;
      lastError = error;
    }
  }
  throw lastError;
}
module.exports = { generateJson };
