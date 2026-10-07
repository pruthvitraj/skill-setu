# Dark login validation

Login reuses the existing learning design system by importing `shellmentor.css` and opting into its tokens/fonts with `.sm-learning.skillsetu-auth`. Authentication-specific overrides apply only below `.skillsetu-auth`; no root tokens, backend files, credentials, registration page styles or role workspace rules were changed.

Colors match the requested background (#050505), panel (#0C0C0C), text (#F8FAFC), muted text (#A1A1AA), white/10 borders and neon-green primary action (#00FF66, black text). Existing Cabinet Grotesk headings, IBM Plex Sans body and JetBrains Mono labels are reused. Corners use the existing 3px token. The desktop layout uses a compact form and simple factual branded panel; mobile collapses to one column with branding and the form. It includes no invented terminal output, decorative statistics or authentication claims.

The original role cards have been replaced with one explicitly labeled native Select role dropdown. Options preserve student/tpo/recruiter values and the default Student selection. The dropdown uses a dark surface, white text, thin border, dark native options and green keyboard focus. Native Home/arrow selection and Tab navigation were verified. Existing sign-in handling, validation, errors/loading, redirects, recovery and registration destinations remain intact.

## Files changed

- `client/src/routes/AppRoutes.jsx`: login-only markup and role keyboard handling; authentication submit handlers and other pages are unchanged.
- `client/src/styles/auth-login.css`: scoped theme, layout and control styling using existing learning tokens.
- `client/tests/auth-login.browser.cjs`: synthetic browser checks, with no real account, credential or database requests.
- This document and `docs/design/screenshots/auth-login/desktop.png`, `mobile.png`.

## Evidence — October 7, 2026

- Client production build passed. Its existing large-chunk warning remains.
- All 13 existing focused client search/recommendation/navigation checks passed.
- Rendered headless Edge checks passed at desktop 1440x1000 and mobile 390x844. All three roles could be selected, with Student selected by default and native keyboard selection. Arrow keys and Tab worked; Email focus computed to a 2px neon-green outline.
- Native required-field validation prevented an empty sign-in request. A synthetic rejected sign-in displayed the preserved error, loading/disabled button behavior and retained entered email. Recovery and registration URLs were checked.
- Desktop computed two layout columns; mobile computed one. Neither viewport had horizontal overflow. Background, panel and primary-button/text computed colors matched the requested values.
- Synthetic successful sign-ins redirected Student to `/student/dashboard`, TPO to `/tpo/dashboard` and Company/recruiter to `/company/dashboard`. Outgoing login payload still contained only email and password, matching the existing API contract.
- Screenshots were visually inspected. They display synthetic input and error fixtures, not real authentication or account data.

Repeat browser checks with a local client at port 5173 and Playwright available: `node tests/auth-login.browser.cjs` from the client directory. Set PLAYWRIGHT_MODULE to a bundled package path if needed. The test uses installed Edge and intercepts every API call; it does not authenticate against the real backend.

No backend authentication, environment values, account passwords, database records, push or deployment was changed.

Dropdown follow-up: desktop/mobile browser checks and all three mocked redirects passed again after the replacement. The client build and diff checks passed. Screenshots now show the dropdown; no backend or credential changes were made.
