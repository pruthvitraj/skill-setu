# Step 2 — shared UI foundation validation

Date: 6 October 2026, Asia/Calcutta. Branch: `fix/core-workflows`. Scope: shared foundation plus Student Profile, Company Analytics and TPO Students. This is not a claim of completion of the later role redesigns or pitch readiness.

## Implemented changes

- Central warm off-white/ink/teal tokens, shared system sans-serif typography, spacing, radii, stronger control edges and visible focus. Replaced conflicting role palettes, legacy shell CSS and Company inline shell styles. No new dependency.
- One WorkspaceShell with role-specific grouped navigation, compact charcoal desktop sidebar and labeled mobile Menu. Existing routes and aliases remain unchanged; editor/detail paths highlight their parent and TPO aliases highlight canonical items.
- Mobile dialog name, focus trap, Escape/close focus restoration, background inertness, body-scroll restoration and route-change dismissal. Menu state does not conditionally mount/unmount the workflow subtree.
- Shared PageHeader/SectionHeading and Feedback, compatible Button/Input/Select refinements, explicit field labels, helper/error associations and disabled states.
- Profile: prominent platform Digital Card and unchanged print/export handler; evidence sections retain source, evaluator, full timestamp, method, rubric, feedback and limitations; personal form uses shared controls and confirmed save feedback.
- Analytics: compact recorded totals and readable stage/month/skill text; one loading/error/success-data branch. Failed requests show no totals/charts and provide safe GET retry; genuine returned zero remains zero, missing totals are Unavailable.
- TPO Students: all six existing filter keys and endpoints retained; explicit labels, accurate loading/empty/error/count states, filter-options retry, latest-request guard, scoped table, directly reachable mobile View student and meaningful evidence-score description.
- Removed nested main tags from workspace pages only; shell owns the main landmark. Other dashboards retain their layout. The existing Student dashboard shortcut now says Learning roadmap rather than AI Roadmap; actual template/provider provenance remains on the roadmap page.

## Changed files

| Area | Files |
|---|---|
| Foundation | `client/src/index.css`, `client/tailwind.config.js` |
| Shell / navigation | `client/src/layouts/WorkspaceShell.jsx`, `workspaceNavigation.js`, `TpoLayout.jsx`; `client/src/routes/AppRoutes.jsx` |
| Primitives | `client/src/components/common/Button.jsx`, `Input.jsx`, `Select.jsx`, new `PageHeader.jsx`, `Feedback.jsx` |
| Representative content / shared evidence | `client/src/pages/student/StudentProfile.jsx`; `client/src/pages/company/CompanyAnalytics.jsx`; `client/src/pages/tpo/TpoStudents.jsx`; `client/src/components/common/StudentDigitalCard.jsx`, `CompetencyEvidence.jsx` |
| Semantic main → div only | Common `ChallengesPage`, `MessagesPage`, `NetworkPage`, `NotificationsPage`; Company `CompanyDrives`; Student `StudentApplications`, `StudentAssessments`, `StudentCourses`, `StudentInterviews`, `StudentMarketplace`, `StudentRoadmap`, `StudentSettings`, `StudentSkillTracker`, `StudentSkills` (all `.jsx`) |
| Copy only | `client/src/pages/student/StudentDashboard.jsx` roadmap shortcut |
| Checks / documentation | `client/tests/workspace-navigation.test.js`; `docs/design/ui-ux-redesign-map.md`; this file; screenshots and measurement JSON below |

No backend, API service, dependency manifest/lockfile, environment, migration or seed code changed. The pre-existing modification to `docs/development/live-api-results.json` is preserved and excluded from the commit. The previously untracked Step 1 map is retained with the requested Step 2 update.

## Environment and data discipline

Used existing authorized synthetic Student, Recruiter and TPO accounts in retained local MongoDB `skillsetu_audit_1791216328267`. No fixture generator, reseed, migration or live-test harness run. Started a separate API on 5001 and frontend at `127.0.0.1:5173` with process-local settings; `.env` files unchanged. Ordinary login/logout sessions and one same-value synthetic Student profile save were the only intentional persistent writes. Draft field edits were not saved; no application, message, challenge, assessment result, review, announcement, drive decision, deletion or real business-record mutation.

For TPO's before screenshot, temporarily served the committed `49fd778` frontend from a temporary copy at the same authorized origin against the same database, then restored the current frontend. Student/Company before screenshots were captured before implementation. No server security/rate-limit settings changed. An isolated API stop/restart was used to reproduce a real network outage and recovery.

## Validation results

| Check | Result / evidence |
|---|---|
| Navigation | Browser clicks across all 17 Student, 12 Company and 15 TPO navigation destinations. Correct current item and one main tag on each entry. Source comparison confirms all 57 route declarations/order unchanged. |
| Aliases / nested paths | Browser-opened `/tpo/drives`, `/tpo/analytics`, owned `/company/jobs/:id/edit` and `/company/jobs/:id`, `/company/jobs/new`, institutional `/tpo/students/:id`; canonical parent highlighting confirmed. Three focused navigation regression tests cover alias uniqueness, prefix boundaries and account destinations. |
| Representative sizes | All three pages inspected/captured at 390, 768 and 1280px; document scroll width never exceeds viewport. Student export action visible; TPO mobile View action does not require sideways scrolling. At 768px the named table scroll region retains access to all columns. |
| Keyboard / menu | Skip link focuses `workspace-main`; focus begins on Close menu; Shift+Tab wraps from first menu link to Log out and Tab back; Escape restores Menu. Background main/header inert and menu route-change dismissal confirmed; destination main focus verified after the final refinement. A found focus-restoration bug was fixed and retested. |
| Workflow preservation | Unsaved Profile name and Company challenge title retained across menu open/Escape. A selected practice radio remains checked after menu use; left without submitting. Controlled rules remain explicit and server-timed; no new controlled attempt consumed. Candidate review and Student application selection remain reachable. |
| Profile save | Same-value synthetic profile submission shows Changes saved only after response; name/card/evidence remain rendered. Read-only email and helper association retained. No real profile changed. |
| Digital Card | Correct platform identifier, institution/batch, privacy and limitations render at all three sizes. Clicking Print / Save PDF invoked printing and blocked the browser automation in print preview; closing the test tab restored automation. Trigger exercised; PDF/physical print output not validated. Print handler is preserved. |
| Evidence | Native disclosure opened with Enter. Browser showed source title/ID, company evaluator context, full timestamp, rubric scores/weights, feedback and certification/identity limitations. Same shared component also rendered in candidate/student detail. |
| Analytics error / retry | Actual stopped-API Network error produces Analytics unavailable, no totals and Retry analytics. Retry while offline stays accurate; restart then Retry recovers actual 2 applications / 0 currently shortlisted / 2 interviews / 0 hired and per-job data. No fake zero success. |
| TPO filters | Combined Batch 2026, Skill SQL, In process and Scheduled returns the institutional Student. No-match text returns explicit no matches/count zero; Clear filters restores one student. Department has only All departments in retained data, so a populated department choice was unavailable. Error/count branches distinguish failed requests from no matches. |
| Shared controls | Checked assessment rules/practice radios, challenge create/cancel/unsaved form and existing company candidate review/Student application selection. Existing endpoints and finality/ownership logic unchanged; later full mutation journeys not claimed here. |
| Contrast | Token calculations: body 13.84:1; secondary 5.66:1; primary 6.80:1; nav 13.69:1; group labels 9.29:1; active nav 9.67:1; input edge 3.74:1; focus 6.18:1 (light nav focus 9.63:1); error 7.08:1; success 7.52:1. Pass applicable text 4.5:1/control-edge 3:1 checks for these combinations. Disabled controls excluded from contrast requirements. |
| Regression tests | `node --test client/tests/workspace-navigation.test.js`: 3/3 pass. `npm test --prefix server`: existing 36/36 pass, including ownership/privacy, expired attempts, practice separation and immutable review retry cases. These are regression evidence, not fresh complete browser mutation journeys. |
| Production build / hygiene | `npm run build --prefix client` passes after fixes; existing >500KB bundle warning remains. `git diff --check` passes. Initial TPO encoding artifact fixed, rebuild passed; final checks rerun before commit. |
| 200% zoom | **Not completed:** available in-app browser controls did not expose native zoom; Control+Equal did not change zoom. 640px reflow supplement checked for all three pages, without overflow. This is not claimed as a 200% zoom test. |

Measurements are in [browser-checks.json](screenshots/step-2/browser-checks.json). DOM snapshots sometimes capture initial loading; validation above uses settled state where stated. Dynamic native input/radio state is validated from rendered snapshots, not the HTML value/checked attribute. No full accessibility certification is claimed.

## Before / after screenshots

All committed images contain synthetic audit account data. Desktop comparisons are 1280×900 viewport captures (full page where available).

| Page | Before | After | Responsive |
|---|---|---|---|
| Student Profile | [Before](screenshots/step-2/step2-before-student-profile.png) | [After](screenshots/step-2/step2-after-student-profile.png) | [390](screenshots/step-2/step2-student-profile-390.png), [768](screenshots/step-2/step2-student-profile-768.png), [640 reflow](screenshots/step-2/step2-student-profile-reflow-640.png) |
| Company Analytics | [Before](screenshots/step-2/step2-before-company-analytics.png) | [After](screenshots/step-2/step2-after-company-analytics.png) | [390](screenshots/step-2/step2-company-analytics-390.png), [768](screenshots/step-2/step2-company-analytics-768.png), [640 reflow](screenshots/step-2/step2-company-analytics-reflow-640.png) |
| TPO Students | [Before](screenshots/step-2/step2-before-tpo-students.png) | [After](screenshots/step-2/step2-after-tpo-students.png) | [390](screenshots/step-2/step2-tpo-students-390.png), [768](screenshots/step-2/step2-tpo-students-768.png), [640 reflow](screenshots/step-2/step2-tpo-students-reflow-640.png) |

[Actual analytics outage](screenshots/step-2/step2-analytics-error.png). Original working captures also reside at `C:/Users/hario/.codex/visualizations/2026/10/05/01a10cb7-87e8-7c92-9729-769df3c29671/step2-*.png`.

## Remaining limitations / later batches

Native 200% zoom and final PDF print output require a browser/manual check. No fresh running controlled timer/expiry or irreversible final challenge review was exercised; source flow remains unchanged and existing server regressions pass. Retained data offers no populated department choice. No full screen-reader, all-page contrast or exhaustive validation/error/mutation matrix was run. The existing Company dashboard funnel warning/missing labels, custom candidate/drive overlay accessibility, legacy page-specific colors, Student interview grouping and TPO internship/directory/report mappings remain the recorded later-batch work; this step did not redesign those pages. The existing large production bundle warning remains. No push or deployment.
