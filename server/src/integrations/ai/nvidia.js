const env = require('../../config/env');
const { createJsonAdapter } = require('./json-adapter');
const ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';
function createNvidiaAdapter(options = {}) {
  return createJsonAdapter({ provider: 'NVIDIA', key: env.nvidiaKey, model: env.nvidiaModel,
    endpoint: ENDPOINT, timeoutMs: env.aiTimeoutMs, maxTokens: env.aiMaxTokens,
    quotaCooldownMs: env.aiQuotaCooldownMs, ...options });
}
module.exports = { createNvidiaAdapter, ENDPOINT };
