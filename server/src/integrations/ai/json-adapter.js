const { AppError } = require('../../utils/AppError');

class ProviderError extends AppError {
  constructor(provider, code, upstreamStatus, message) {
    super(`${provider}: ${message}`, 503, code);
    this.provider = provider;
    this.upstreamStatus = upstreamStatus;
  }
}
async function readBounded(response, limit = 131072) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Missing response body');
  let length = 0;
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > limit) throw new Error('Response too large');
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks).toString('utf8');
  } finally { await reader.cancel().catch(() => {}); }
}
function createJsonAdapter({ provider, key, model, endpoint, fetchImpl = (...args) => fetch(...args), timeoutMs = 45000, maxTokens = 4096, quotaCooldownMs = 3600000, now = Date.now, request, extract, headers }) {
  let blockedUntil = 0;
  let blockedError;
  async function completeJson(system, user, options = {}) {
    if (!key) throw new ProviderError(provider, 'AI_CONFIG', undefined, 'API key is not configured on the server.');
    if (key !== key.trim() || /^Bearer\s/i.test(key)) throw new ProviderError(provider, 'AI_CONFIG', undefined, 'Configure the raw API key without whitespace or a Bearer prefix.');
    if (blockedUntil > now()) throw blockedError;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(60000, Math.max(100, timeoutMs)));
    const boundedTokens = Math.min(8192, Math.max(16, options.maxTokens || maxTokens));
    try {
      const payload = request ? request(system, user, boundedTokens) : {
        model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        max_tokens: boundedTokens, temperature: 0.3, stream: false,
      };
      const response = await fetchImpl(endpoint, {
        method: 'POST', headers: headers || { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal,
      });
      if (!response.ok) {
        await response.body?.cancel().catch(() => {});
        let code = 'AI_PROVIDER', message = 'Provider request failed. Try later.';
        if ([401,403].includes(response.status)) {
          code = 'AI_AUTH'; message = 'Server API credentials were rejected. Check the configured key and endpoint access.';
          blockedUntil = Infinity;
        } else if ([402,429].includes(response.status)) {
          code = 'AI_QUOTA'; message = 'Provider quota/rate limit reached. Requests are paused during cooldown.';
          const retry = Number(response.headers.get('retry-after')) * 1000;
          blockedUntil = now() + Math.min(86400000, Math.max(quotaCooldownMs, Number.isFinite(retry) ? retry : 0));
        } else { blockedUntil = now() + 30000; }
        blockedError = new ProviderError(provider, code, response.status, message);
        throw blockedError;
      }
      let value;
      try {
        const envelope = JSON.parse(await readBounded(response));
        const choice = envelope.choices?.[0];
        const content = extract ? extract(envelope) : choice?.message?.content;
        if ((!extract && choice?.finish_reason === 'length') || typeof content !== 'string' || content.length > 60000) throw new Error('Incomplete content');
        value = JSON.parse(content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
        if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected JSON object');
      } catch (error) {
        if (controller.signal.aborted) throw error;
        throw new ProviderError(provider, 'AI_INVALID_RESPONSE', response.status, 'Provider returned invalid, oversized or truncated JSON.');
      }
      return value;
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      const code = controller.signal.aborted ? 'AI_TIMEOUT' : 'AI_PROVIDER';
      throw new ProviderError(provider, code, undefined, controller.signal.aborted ? 'Provider request timed out.' : 'Provider connection failed.');
    } finally { clearTimeout(timer); }
  }
  return { completeJson, provider, model };
}
module.exports = { createJsonAdapter, ProviderError, readBounded };
