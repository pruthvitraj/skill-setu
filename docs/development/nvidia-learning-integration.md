# NVIDIA learning integration

## Scope and configuration

This change connects only Learning Roadmap and AI Practice Assignments to a shared server-side provider layer. Existing course matching, controlled assessments, authentication, student ownership, draft saving and competency evidence behavior are preserved. No account, database seed or environment file was changed.

In the private server environment, configure `NVIDIA_API_KEY` with the raw key (no Bearer prefix or surrounding whitespace). Never put a real key in `.env.example`, tracked files, logs or client configuration.

- `NVIDIA_MODEL`: defaults to `nvidia/nemotron-3-ultra-550b-a55b`.
- Endpoint: `https://integrate.api.nvidia.com/v1/chat/completions`.
- `AI_PROVIDER`: `nvidia`, `openai`, `gemini` or `auto`. If unset, NVIDIA is selected when its key is configured; otherwise auto uses configured Gemini, OpenAI and NVIDIA providers in that order. Explicit selection does not silently switch providers.
- `AI_TIMEOUT_MS`: default 45000, capped at 60000 per request, including response reading.
- `AI_MAX_TOKENS`: default 4096; bounded at 8192. HTTP response bodies and generated JSON have separate size limits.
- `AI_QUOTA_COOLDOWN_MS`: default 3600000. Quota/rate-limit responses pause calls across both workflows in this server process; numeric Retry-After is respected, capped at 24 hours.
- Existing `OPENAI_MODEL` and optional `GEMINI_MODEL` configure the other learning providers. ATS continues to use its existing adapters.

Authentication errors pause that credential/model combination until a new adapter is selected (changed configuration or process restart). Other HTTP provider failures pause for 30 seconds. Circuits and retrieval caches are process-local; multiple server instances do not share them. Invalid responses and network/timeouts fail clearly without saving an assignment. The provider's raw error body is never returned or logged by this layer. Upstream authentication errors become local 503 errors, so they do not incorrectly invalidate the student's login session.

After privately correcting configuration and restarting the backend, run from `D:\Setup\skill-setu\server`:

```powershell
node src/scripts/check-nvidia.js
```

This uses a synthetic JSON prompt, no student profile and no database. Success requires both HTTP 200 and valid JSON. Failure output contains only safe status/code information. A timeout/connection failure cannot establish authentication status.

## Real connection result and blocker

On October 7, 2026 (Asia/Calcutta), the minimal live NVIDIA authentication request returned **HTTP 401**. The configured key was present, had no surrounding whitespace and had no Bearer prefix. The endpoint rejected the configured credential. This check cannot distinguish an invalid/revoked key from missing endpoint/account access. It also cannot establish that the requested model is available to this account.

No further real NVIDIA generation requests or student prompts were sent after that failure. Actual roadmap and assignment generation remains blocked until a valid key with endpoint/model access passes the connection check. The integration code and mocked tests are not evidence of successful live Nemotron generation.

## Roadmap retrieval and provenance

Nemotron is not treated as a web search engine. A separate server retrieval layer selects up to three role-matched sources from a fixed catalog of official MDN, React, Python, PostgreSQL, Airflow, Node.js, Docker, Kubernetes, Git and scikit-learn documentation. The model and student cannot supply arbitrary fetch URLs; redirects are rejected. Retrieval has an eight-second timeout per source and bounded HTML/text sizes.

Successful fetched excerpts are cached for ten minutes and failed fetches for one minute. Attribution preserves the original UTC retrieval timestamp and an excerpt hash; cached material is not assigned a new research date. Research is limited to these technical references, not a comprehensive survey of hiring demand or proof of competency. Partial retrieval can still ground guidance in the sources that actually succeeded.

- **Researched AI guidance** requires validated content and source IDs referencing successful retrievals. Only those source URLs, titles, timestamps and hashes are stored. Model-generated HTTP links outside the retrieved allowlist are rejected.
- **Ungrounded AI guidance** is explicitly labeled when retrieval fails or no catalog sources match. No researched source attribution is stored, and the prompt forbids research/currentness claims and links.
- **Role template** is used when AI generation/authentication/validation fails. Its notice explains the failure. Even if references were retrieved, they are not attributed to a template that did not use them.

The existing `source: ai/template` contract is retained; optional metadata distinguishes these cases. Existing records need no migration. Student-facing roadmap provenance uses existing visual styles and adds no module or navigation redesign.

Roadmap prompts send the target role and self-reported skill names/levels, not names, contact details, education or resumes. These values and fetched text are treated as untrusted prompt data. AI source attribution does not independently verify every model statement.

## Practice assignment behavior

Assignments use the student's saved target role, rather than a supplied generation-request role. Missing saved roles are rejected. Existing validators enforce task structure and a rubric totaling 100. Invalid/provider-failed generation creates no assignment. Provider/model metadata is optional and does not change assignment source or status contracts.

Exercises continue to use synthetic data. Draft saving and final submission stay scoped to the owning student; submitted work cannot be overwritten. Practice assignments create no competency evidence and are separate from controlled assessments. Existing target-role and skill context is sent to the selected server-side provider; credentials never reach the browser.

## Changed files for this task

- `server/.env.example`, `server/src/config/env.js`: blank credential example and server configuration.
- `server/src/integrations/ai/json-adapter.js`: bounded JSON requests, safe errors and cooldowns.
- `server/src/integrations/ai/nvidia.js`: fixed NVIDIA endpoint and model defaults.
- `server/src/integrations/ai/learning-provider.js`: shared configurable learning provider selection.
- `server/src/integrations/ai/roadmap-research.js`: actual trusted-source retrieval and caching.
- `server/src/modules/roadmap/roadmap.ai.js`: existing validation plus grounding/template handling.
- `server/src/modules/skills/practice.service.js`: existing assignment validation through shared provider.
- `server/src/models/Roadmap.js`, `server/src/models/PracticeAssignment.js`: optional provenance fields.
- `client/src/pages/student/StudentRoadmap.jsx`: honest guidance labels, source dates and fallback notice.
- `server/src/scripts/check-nvidia.js`: credential-safe synthetic connection check.
- `server/tests/nvidia-learning.test.js`, `server/tests/learning-provider-workflows.test.js`: provider/retrieval/workflow regression coverage.
- This document.

These files overlap earlier uncommitted work in roadmap and practice. Unrelated changes were preserved; the existing role-matching logic, other learning page styles and shared sidebar were not changed by this task.

## Validation

Automated checks cover authentication rejection, key formatting, quota cooldown, shared cooldown across both flows, timeouts, network/provider failures, oversized/truncated/malformed JSON, source allowlisting and retrieval dates/cache behavior, attribution, existing schema validators, saved target role, draft ownership and final submission immutability. All provider tests use synthetic fixtures and mocked requests, not real credentials.

All 69 server regression tests, all 3 client navigation checks and the production client build passed. The build retains its large main-chunk warning. Live retrieval succeeded for a Data Engineer role against:

- https://www.postgresql.org/docs/current/tutorial.html
- https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html
- https://docs.python.org/3/tutorial/

Their actual retrieval timestamps were approximately `2026-10-06T22:08:50Z` (October 7 local time). This proves retrieval connectivity, not successful AI generation. No live generated output was persisted to MongoDB, and no successful browser generation journey is claimed while authentication is blocked. No reseeding, push or deployment was performed.

