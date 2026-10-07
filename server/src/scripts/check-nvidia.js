// Uses only a synthetic prompt, never a student profile or database.
const { createNvidiaAdapter } = require('../integrations/ai/nvidia');
(async () => {
  try {
    await createNvidiaAdapter().completeJson('Return JSON only.', 'Return {"connected":true}.', { maxTokens: 32 });
    console.log(JSON.stringify({ provider: 'nvidia', httpStatus: 200, authenticated: true, jsonResponseValid: true }));
  } catch (error) {
    console.log(JSON.stringify({ provider: 'nvidia', httpStatus: error.upstreamStatus || null,
      authenticated: error.upstreamStatus === 200, code: error.errorCode || 'AI_PROVIDER',
      message: error.errorCode ? error.message : 'Connection check failed.' }));
    process.exitCode = 1;
  }
})();
