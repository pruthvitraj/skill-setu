# Core workflow audit — 6 October 2026

Branch: fix/core-workflows. Existing environment files retained. No database reseed, push, or deployment.

## Repairs

- Student Digital Card: profile-less active student accounts get a stable profile on retrieval without an invented institution. The card is placed before profile editing; compact mobile navigation prevents it being buried below the full sidebar. It explicitly identifies a platform identifier, not an institution-issued ID.
- Authentication/session contracts: logout calls persistent session revocation and clears its cookie; session expiry clears client authentication. Cookie-based sessions restore after reload. Password recovery returns an explanatory 503 when delivery is unavailable.
- Resumes: readable PDF Buffer parsing repaired using Uint8Array; real PDF upload saves actual parsed text and ATS results. Rules-based results are labeled honestly. JavaScript no longer matches Java. Resumes referenced by applications cannot be deleted.
- Applications/interviews: job deadlines enforced, duplicate applications rejected, accurate job counts, explicit interview date/round/mode/details form, outcome page, owner-scoped updates, future-date validation, concurrent scheduled-interview uniqueness and consistent outcomes.
- Messaging/notifications: student–TPO messaging requires the same institution; recruiter–student messaging requires a placement connection. Inactive/unauthorized conversations are excluded, blank messages fail, concurrent new conversations have one pair key. Notification read actions require ownership. TPO announcements create in-app notifications only for the chosen institutional audience.
- Placement drives: ownership/date/duplicate validation, correct job recruiter, TPO approval date, usable reschedule/start/complete/cancel actions and immutable ended states.
- Reports/analytics/settings: company analytics now fetches live data; zero-filled/invented conversion metrics removed. TPO analytics now returns real status, department, monthly and drive data. Interview names and company data repaired. Reports use correct optional columns, names, dates and evidence scores; Student Report rendering repaired and practice/legacy results distinguished. Unsupported notification/theme preferences and invented email-verification status removed from settings. Company/profile saves use validated contracts.
- Roadmaps: template fallback is labeled and persisted as template guidance; it does not claim AI evaluation or proven competency gaps. Completion requires a boolean; target role is validated. Job editing fetches its own record instead of searching only the first page.
- UI: navigation exposes supported messages, notifications and interviews across roles; authenticated route protection, responsive sidebar and resume layout, visible keyboard focus, disabled-state affordances, and accessible dialog focus/Escape behavior. Dead feed/team actions and misleading success claims removed.

## Database and module validation

The configured skillsetu database had 12 legacy-scored students without migration markers. Before mutation, students, skillscores, assessmentattempts and skillevidences were backed up to .audit-backups/2026-10-05T19-19-26-822Z (ignored by Git). After migration: 12 students retained, all 12 marked evidenceMigration=1 and all 12 old scores preserved in legacySkillScore; no attempts or evidence created. Existing applications/interviews and environment files were not changed by test fixtures. No duplicate scheduled application interviews were found before adding the unique index.

Automated integration checks create new skillsetu_audit_* databases on local MongoDB and retain them for inspection. They never reset existing databases. The final result is in live-api-results.json. Run npm run test:live --prefix server to repeat. The test password and PDF are synthetic fixtures, not real personal data.

18 live API/MongoDB groups validate migration twice, repeatable practice without evidence, server-timed controlled attempts with persisted deadlines/no answer key, ownership and expired attempts, immutable final grades, challenge submissions and weighted reviews, sourced evidence, privacy/institution boundaries, resumes/applications, concurrent interviews, messages, notification ownership, drive review, all report APIs, settings, template provenance, completion, expired sessions and logout revocation. Final controlled submissions/reviews cannot replace the first recorded score/evaluator.

Browser journeys used retained isolated database skillsetu_audit_1791216328267 and API port 5001, frontend 127.0.0.1:5173. Student: sign-in, profile save/card, repeated practice, controlled start/reload/resume/final submit, readable PDF upload (actual rules-based ATS 46), job application, final challenge work, skill addition, template roadmap and completion/reload, messages and notification reads. Recruiter: sign-in, create/edit a published internship, review application/resume/evidence, choose interview schedule and record outcome, publish challenge, final rubric review (80), campus request, company save, analytics and every navigation page. TPO: institutional student/evidence view, announcement received by student, message reply, profile save, drive reschedule, analytics/interview names, every navigation page and all seven report types. Student Report was retested after its browser-discovered render failure.

Mobile card at 390px: document width matched viewport; card content and controls visible with no horizontal page overflow. Desktop/mobile screenshots are saved in the chat visualization directory. Print / Save PDF opened a native print dialog; generated PDF bytes could not be verified with the available browser tooling.

## Regression/build/dependencies

- Server: 36 regression tests pass.
- Live local MongoDB/API: 18 groups pass; successful result recorded separately.
- Client production build passes. Existing approximately 1 MB entry chunk warning remains.
- Server dependency audit: zero advisories after removing nodemon/chokidar and using Node's built-in --watch (Node >=20). Installed unused watcher dependencies pruned.
- Client production dependencies: zero advisories with --omit=dev.
- Client development tree: five high findings propagate from braces through Tailwind 3's glob/watch dependencies. Advisory GHSA-vfj7-8cjw-p6xm has no compatible patched braces release; npm recommends a Tailwind 4 major migration. No force fix or blind downgrade applied. Source: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm

## Remaining pitch blockers / limits

- Client development dependency advisory needs a deliberate Tailwind major migration or an upstream patch.
- Organization invitation/approval and identity/enrollment verification are not implemented. Existing institution ownership must be assigned administratively; self-created organizations are not verified institutions. No proctoring or identity guarantee is supported.
- External SMTP delivery, external AI providers, optional S3 and generated print-PDF output were not validated. Offline/local fallback behavior was tested and labeled accurately.
- Populated legacy database now has no fabricated current evidence. Real evaluations must be completed before presenting competency results. No catalog/course/assessment data was reseeded.
- User-running services were left untouched; restart them to load the committed server code. Audit services used isolated ports/data.

These checks establish the exercised local journeys, not production deployment or pitch readiness on their own.
