# ShellMentor student learning visual system

Implemented only the existing Learning Roadmap (`/student/roadmap`), Courses (`/student/courses`) and Practice Assignments / controlled assessments (`/student/assessments`). SkillSetu branding, workspace shell and all existing routes remain. There is no public homepage, CMS, terminal simulator, XP, achievements, lesson engine or additional module.

## Reuse and scope

`client/src/styles/shellmentor.css` contains reusable `--sm-*` colors, typography, spacing, geometry and motion tokens. They are activated only by `.sm-learning`; shared `--ui-*` adapters are local to that subtree, never `:root`. `LearningWorkspace.jsx` reuses the existing PageHeader and provides accessible links to the three existing screens. Existing Button, Input and Feedback components are reused without globally changing them.

Fonts are Cabinet Grotesk (700/800), IBM Plex Sans (400/500/600) and JetBrains Mono (400/600), supplied through Fontshare and Google Fonts CSS imports with swap and local fallbacks. Remote font availability is required for the exact requested typography; offline/system fallback rendering is not identical. Tokens preserve near-black surfaces, thin borders, 3px corners, neon-green controls, cyan metadata and 2px focus outlines. Content uses 1400px maximum width, 32px desktop/20px mobile horizontal padding, 112px desktop/80px mobile section spacing, and 180ms motion. Reduced motion disables transitions and hover translation. No terminal texture is added because none of these screens includes a terminal or hero image.

## Screen behavior

- Roadmap prioritizes the next incomplete task, real stored completion, provenance and phase items. Regeneration and checkboxes retain their existing API calls. Busy labels distinguish generation from item saving. Read errors have retry feedback. Legacy `Gap:` prefixes are removed only for display; stored data is unchanged. Self-reported completion and template/AI suggestions are explicitly separate from competency evidence.
- Courses prioritizes the catalog and skill filter. Course links retain new-tab behavior with accessible course-specific labels. Missing metadata is identified rather than invented. Recommendations fail independently of the catalog. Pagination uses the applied filter, not an unsubmitted edit; retry uses the failed query. Stale requests cannot replace later results. Empty catalogs do not show redundant pagination controls.
- Practice assignments retain repeatable, untimed practice and the existing controlled assessment flow. Rules acceptance, server-time offset/deadline, answer payloads, final-submit behavior and result provenance are preserved. Keyboard focus moves to the newly opened rules/questions/result heading; unanswered validation remains accessible. No claims of proctoring or identity monitoring are introduced.

No backend, model, permission, authentication, seed or environment file changed.

## Validation (2026-10-07, Asia/Calcutta)

- Server regressions: 42 passed, including repeatable practice without evidence, controlled expiry, answer validation and immutable final grades/reviews.
- Frontend navigation regressions: 3 passed.
- Production build passed. Existing approximately 1 MB main JavaScript bundle still triggers Vite's chunk-size warning.
- Actual browser sign-in using the existing synthetic student audit account against `skillsetu_audit_1791216328267`, temporary API 5001/frontend 5174, with process-only overrides. Existing roadmap/provenance/phases rendered, practice questions opened, incomplete-answer validation appeared, answer selection and keyboard focus worked, and leaving practice restored the list. Controlled rules start was disabled before acceptance and enabled after acceptance.
- Browser course checks against that audit database: real empty catalog, unmatched skill, filter and clear states. It contains no courses.
- Separate temporary read-only preview: five existing public course records read from `skillsetu`, without insert/update/delete, for populated rendering and skill filtering. Only catalog reads used this source; current-user/recommendation GETs used the audit API. A preview-only 503 exercised error, retry and clear-to-recover behavior. This is presentation validation, not a claim that the audit database contains those courses. The initial broad proxy was rejected by approval review; only its narrowed GET-only replacement ran.
- Browser dimensions: 1280px three-column course grid, 768px two-column grid, 390px single-column cards. No horizontal document overflow. Roadmap and Practice also checked at 390px; scoped keyboard focus outline and accessible form labels checked. Screenshots are in `screenshots/shellmentor-learning/`.
- Saved roadmaps, assessment attempts, final submissions, reviews and evidence were not altered during browser checks. Regeneration, completion writes and final assessment submission were not exercised against the retained data; existing server regressions cover their contracts. No database was reseeded. Sign-in and authenticated reads have their normal session effects.

Remaining validation limits: no new end-to-end controlled attempt/final submission, no native 200% zoom test, no browser forced reduced-motion emulation, and exact font-file load status is not exposed by the browser inspection tool. Computed family stacks and rendered typography were inspected. The shared sidebar intentionally retains its prior styling because adoption is scoped to these three content screens.
