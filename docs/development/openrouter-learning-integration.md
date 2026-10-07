# OpenRouter learning provider

Set `AI_PROVIDER=openrouter` in the private server environment to explicitly select OpenRouter for both Learning Roadmap and AI Practice Assignments. Set `OPENROUTER_API_KEY` privately; never put the key in tracked files or client configuration.

`OPENROUTER_MODEL` defaults to `nvidia/nemotron-3-ultra-550b-a55b:free`. Only this exact identifier is accepted. Paid variants, alternate free models, automatic routers and online/search suffixes fail locally before a request. Adding a key does not automatically select OpenRouter or change the existing auto-provider order.

Requests go to `https://openrouter.ai/api/v1/chat/completions` with server-side Bearer authentication. JSON is requested through the system prompt; `response_format` is omitted. The payload contains no fallback model list, web-search plugins or tools. Provider fallback is disabled and prompt/completion price limits are zero. Explicit selection never falls back to another learning provider.

The adapter reuses the shared request timeout, bounded tokens/body/content, safe authentication/quota/provider errors and process-local cooldowns. It accepts only completed `stop` responses containing valid JSON objects. Existing roadmap and assignment validators still validate generated content before persistence.

Official-document retrieval, roadmap provenance, student target-role selection, draft/submission ownership, final submission protection and separation from competency evidence are unchanged. No frontend, private environment file, account or database record was changed for this addition.

## Connection check

From `D:\Setup\skill-setu\server`:

```powershell
node src/scripts/check-openrouter.js
```

The script uses only a synthetic prompt and requires exactly `{"connected":true}` in the parsed response. It prints safe status/model/error information, never keys or raw provider content. It accesses no database and leaves the configured learning-provider selection unchanged.

On October 7, 2026 (Asia/Calcutta), the actual check returned HTTP 200, `authenticated: true`, and `jsonResponseValid: true` for the exact free model. This verifies a synthetic request, not complete live student generation or browser journeys. The earlier direct NVIDIA endpoint's HTTP 401 is a separate credential issue.

## Changed files

- `server/src/config/env.js`: OpenRouter server environment fields and default model.
- `server/.env.example`: blank key and explicit selection/model documentation.
- `server/src/integrations/ai/openrouter.js`: strict free-only adapter.
- `server/src/integrations/ai/learning-provider.js`: explicit OpenRouter selection and shared adapter caching.
- `server/src/scripts/check-openrouter.js`: synthetic schema-checked connection check.
- `server/tests/openrouter-learning.test.js`: request policy, model guard, error/cooldown, JSON completion and existing-validator tests.
- This document.

All 21 focused learning-provider tests and all 75 full server regression tests passed, including the existing NVIDIA, retrieval and practice workflow checks. No keys were printed or committed. No reseeding, push or deployment was performed.

Routing options were checked against the official [OpenRouter provider routing documentation](https://openrouter.ai/docs/guides/routing/provider-selection).

