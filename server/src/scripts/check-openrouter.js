// Synthetic request only: no student profile, database access or credential output.
const { createOpenRouterAdapter, FREE_MODEL } = require('../integrations/ai/openrouter');
(async () => {
  try {
    const result = await createOpenRouterAdapter().completeJson('Return JSON only.', 'Return {"connected":true}.', { maxTokens: 256 });
    if (result.connected !== true || Object.keys(result).length !== 1) {
      console.log(JSON.stringify({ provider: 'openrouter', model: FREE_MODEL, httpStatus: 200,
        authenticated: true, code: 'AI_INVALID_RESPONSE', jsonResponseValid: false,
        message: 'Synthetic response did not match the requested JSON schema.' }));
      process.exitCode = 1;
      return;
    }
    console.log(JSON.stringify({ provider: 'openrouter', model: FREE_MODEL, httpStatus: 200,
      authenticated: true, jsonResponseValid: true }));
  } catch (error) {
    console.log(JSON.stringify({ provider: 'openrouter', model: FREE_MODEL,
      httpStatus: error.upstreamStatus || null,
      authenticated: error.upstreamStatus === 200 ? true : [401,403].includes(error.upstreamStatus) ? false : null,
      code: error.errorCode || 'AI_PROVIDER', message: error.errorCode ? error.message : 'Connection check failed.' }));
    process.exitCode = 1;
  }
})();
