# SkillSetu UI/UX redesign map — Steps 1–2

**Step 2 status:** shared foundation and three representative pages implemented. See [validation](step-2-validation.md), including incomplete native zoom and PDF-output checks. The inspection evidence and original issue list below describe the Step 1 baseline.

Inspection: 6 October 2026 (Asia/Calcutta). Branch: `fix/core-workflows`; application baseline `49fd778` / `485148b`. **Planning only:** no application code, API contracts, permissions, database rules, environment files or business records changed. No reseeding, migration or fixture-generator run.

## 1. Step 1 baseline evidence and complete route inventory

Read [latest core-workflow audit](../development/core-workflow-audit.md), [AppRoutes.jsx](../../client/src/routes/AppRoutes.jsx), actual role layouts/pages and shared controls. No applicable AGENTS.md found in repository/parents; Harvey instructions concern a different project.

Ran the existing app on API5001/frontend127.0.0.1:5173 against **retained** local MongoDB `skillsetu_audit_1791216328267`, using its existing authorized Student, Recruiter and TPO audit accounts. Credentials are not included here. Ordinary sign-in/sign-out session writes were the only intentional database changes. No new application, message, announcement, review, privacy change, assessment submission or deletion. Practice questions were opened without submitting. Main database and environment files retained.

Every static role page was opened in the browser, plus both TPO aliases, a real institutional student detail, an owned job editor and its alias. Desktop: DOM/accessibility snapshots plus representative screenshots. Mobile: 390×844 route/layout inspection and read-only dimensions. Settled populated views were checked after initial loading captures. Mobile measurements cover checked data, not every possible long string/state. Repeated full reloads reached the existing400-request API limit; only the isolated inspection API was restarted, without changing limits. Sign-in then showed generic “Unable to sign in.” Finally, stopping that API and navigating to Company Analytics showed real “Network error” feedback alongside zero totals.

**Evidence legend:** **O** observed live this step; **S** source-supported but not exercised; **R** recommendation. Previous functional audit is background, not fresh UI inspection. O defects state what appeared; source explanations do not prove wider backend failure.

Screenshots: [Company dashboard](C:/Users/hario/.codex/visualizations/2026/10/05/01a10cb7-87e8-7c92-9729-769df3c29671/ux-company-dashboard.jpg), [TPO mobile](C:/Users/hario/.codex/visualizations/2026/10/05/01a10cb7-87e8-7c92-9729-769df3c29671/ux-tpo-mobile.jpg).

### Page-by-page tasks and proposed hierarchy

All URLs below are current routes. Components under `client/src/pages/` unless noted. Hierarchy column gives **R reading order**; primary actions are R, not claims that those controls already occupy that position. Read-only pages need no artificial create button. U references resolve in section2. All listed page entry views were browser-inspected; alias views share canonical treatment.

### Student — next action, learning progress, evidence and applications

| Route | Component | Task / primary action (R) | Needed information and hierarchy (R) | O problems / focus |
|---|---|---|---|---|
| /student/dashboard | StudentDashboard.jsx | Decide next action; Open relevant task | Interview/application next action → current roadmap step → sourced evidence summary → resume guidance → notices → small community preview | U01/U02/U06/U12; feed before learning, five metrics |
| /student/profile | StudentProfile.jsx; common card/evidence components | Understand profile; Save personal details when editing | Name/institution/link status → evidence → self-reported context → personal form; Digital Card readily accessible with Print / Save PDF | U05/U07; card/form precede evidence, long technical ID |
| /student/resume | StudentResume.jsx | Improve readable PDF; Upload PDF | Current file/evaluator/limitations → top recommendations → keyword/structure details → history/retention | U05/U08/U12; nested interactive controls, many score blocks |
| /student/skills | StudentSkills.jsx | Maintain self-reported skills; Add skill | Skills/levels → add form → evaluated score/evidence link → catalog/assessment links | U06/U12; “Assessed skills” includes company review, repeated metrics |
| /student/skill-tracker | StudentSkillTracker.jsx | Understand evaluation history; View evidence | Latest evaluations/source → attempts with mode/status/date → practice link | U06/U09; keep practice and Legacy (unverified) separate |
| /student/roadmap | StudentRoadmap.jsx | Continue learning; Mark next item complete | Target/provenance → next incomplete item → phases → regenerate secondary | U06/U12; Role template honest, stored topics still say Gap |
| /student/courses | StudentCourses.jsx | Find resource; Open course if available | Filter → catalog → optional relevant recommendations → pagination | U10/U12; two empty panels, empty pagination |
| /student/marketplace | StudentMarketplace.jsx | Evaluate/apply; Apply now in selected detail | Filter/list → requirements/deadline → selected resume/cover note → apply | U07/U12; resume selector before job selection, duplicated applications |
| /student/assessments | StudentAssessments.jsx | Choose mode; Practice / Read rules | Mode distinction → skill/duration → eligible attempt state if available → rules → questions/timer → final result | U11; honest rules, final-history state not visible in list |
| /student/challenges | common/ChallengesPage.jsx | Inspect bounded work; View brief / Submit final work if eligible | Skill/effort/deadline/state → brief → rubric → work or final review → evidence | U11; reviewed status hidden until detail |
| /student/applications | StudentApplications.jsx | Track progress; Open application | Current stage/company/job → timeline → interview context → cover note/date; match secondary | U07/U12; repeated score boxes and two panels |
| /student/interviews | StudentInterviews.jsx | Prepare; Open meeting for active schedule | Date/time/timezone/company/job → logistics → outcome/history | U04/U12; future-dated completed record under Upcoming |
| /student/feed | StudentFeed.jsx | Read/publish; Post | Title/context → labeled composer → posts → concise empty state | U05/U08/U10; no h1, placeholder-only inputs |
| /student/network | common/NetworkPage.jsx | Find selected connections; Message | Selection-created access explanation → person/company/job → authorized Message | U10; empty view O, populated state S |
| /student/messages | common/MessagesPage.jsx | Communicate with authorized contact; Send | Recipient identity → sender/time thread → composer → conversation selection | U07/U10; empty canvas/no loading distinction, targeted composer lacks recipient name |
| /student/notifications | common/NotificationsPage.jsx | Act on event; Open related module (R), Mark read secondary | Unread/context → action → timestamp → read history | U06/U07; raw status and historical Round: undefined |
| /student/settings | StudentSettings.jsx | Control recruiter visibility; Save visibility settings | Independent controls → institution/submitted-work limits → Save → profile link | U10; no fetch loading text; privacy explanation good |

### Company / Recruiter — candidate review, hiring actions, challenge evaluation

| Route | Component | Task / primary action (R) | Needed information and hierarchy (R) | O problems / focus |
|---|---|---|---|---|
| /company/dashboard | CompanyDashboard.jsx | Find hiring work; Review applications | Candidate review → interviews needing outcome → challenge evaluation → active jobs → compact stages/notices | U01/U02/U03/U12; metric wall and unnamed stage bars |
| /company/jobs | CompanyJobs.jsx | Maintain owned jobs; Post new job | Status/search → job/application/deadline list → Edit; Duplicate/Delete secondary | U05/U08/U12; cards, nested Edit link/button, unnamed select |
| /company/jobs/new | CompanyJobForm.jsx | Create opening; Create job | Title/location → role/skills → requirements/pay/positions → eligibility/selection → deadline/status → submit | U05/U12; inline serif title/large form groups |
| /company/jobs/:id/edit | CompanyJobForm.jsx | Edit owned job; Save changes | Same form, preserve loaded values; publication context; Cancel to jobs | U01/U05; Jobs not active on editor |
| /company/jobs/:id | CompanyJobForm.jsx (editor alias) | Same owned editor; Save changes | Same editor; do not present as public detail or alter route semantics | O populated alias opened |
| /company/applications | CompanyApplications.jsx | Review candidate; Review then deliberate stage action | Job/status/search → candidate → resume/evidence/source/limits → note/current stage → explicit decision or schedule | U03/U07/U08/U09/U12; six competing stage buttons, inaccessible overlay |
| /company/interviews | CompanyInterviews.jsx | Record outcome; Record outcome | Candidate/job/date/logistics → result/feedback → outcome dialog; scheduling link secondary | O shared Modal Escape/focus restoration worked; U05 formatting |
| /company/challenges | common/ChallengesPage.jsx | Evaluate/publish; Review pending work / Create challenge | Queue → brief/rubric → work → final criterion scores/feedback → evidence | U11; create/reviewed detail O, pending-review form S |
| /company/drives | CompanyDrives.jsx | Request campus drive; Request drive | Current requests/decisions → campus/job/date/eligibility form → submission | U12; creation always expanded; retain TPO decision ownership |
| /company/analytics | CompanyAnalytics.jsx | Inspect recorded hiring activity | Scope → useful totals → labeled stages → monthly activity → per-job data → requested skills | U03/U06/U10/U12; offline error plus zero totals, stale conversion/period prose |
| /company/network | common/NetworkPage.jsx | Contact selected connection; Message | Person/company/job → permitted contact | U10; populated state unavailable |
| /company/messages | common/MessagesPage.jsx | Communicate; Send | Named recipient → sender/time thread → composer → conversation list | U07/U10 shared issues |
| /company/team | CompanyTeam.jsx | Inspect associated recruiters; Search | Member list/contact/designation → useful role filter | U12; three identical1 totals/blank department; no invitation feature |
| /company/notifications | common/NotificationsPage.jsx | Follow drive/hiring event; Open module (R) | Unread actionable events → timestamp → mark-read | U07; only read controls |
| /company/settings | CompanySettings.jsx | Maintain public company information; Save changes | Name/industry/location → website/about → feedback → supported-feature limits | U05/U10; fetch-state guidance limited; keep displayed-field contract |

### TPO — institutional evidence context, placement coordination and reporting

Readiness means recorded evidence plus administrative placement context, **not** invented employability/readiness percentages.

| Route | Component | Task / primary action (R) | Needed information and hierarchy (R) | O problems / focus |
|---|---|---|---|---|
| /tpo/dashboard | TpoDashboard.jsx | Coordinate current work; Manage drives | Pending coordination → students/evidence → drives/interviews → compact totals → skill participation | U01/U02/U09/U12; six large tiles |
| /tpo/students | TpoStudents.jsx | Find institutional student; View | Scope → search/filters → student/evidence/status table → paging | U05/U09; oversized heading, unnamed selects/wide table |
| /tpo/students/:id | TpoStudentDetails.jsx | Understand evidence; Message student | Identity/batch → evidence provenance → self-reported skills → placement → contact | U07; evaluator/source technical IDs; keyboard disclosure worked |
| /tpo/skills | TpoSkills.jsx | Inspect evidence coverage | Scope/coverage → score distribution/text table → department/batch → unavailable gap explanation | U06/U09/U12; gaps0 vs not calculated, redundant intelligence panel |
| /tpo/internships | TpoInternships.jsx | Monitor opportunities/applicants; Inspect context | Search/status → aligned opportunity/company/location/deadline/status/applicant table | U03/U08/U09/U12; body/header mismatch, identical metrics |
| /tpo/companies | TpoCompanies.jsx | Find published openings; Inspect directory context | Scope/search → company/industry/location/opening count/website → drive request link | U03/U09/U12; hiring cells missing count |
| /tpo/placement-drives | TpoPlacementDrives.jsx | Coordinate campus requests; Review pending | Pending/upcoming → table → review/date dialog → new request secondary | U02/U07/U08/U09/U12; request form and five metrics before queue |
| /tpo/drives | TpoPlacementDrives.jsx alias | Same coordination task | Same hierarchy, canonical nav /tpo/placement-drives | O alias opened; no duplicate nav |
| /tpo/applications | TpoApplications.jsx | Monitor allowed interventions; Review | Search/status → candidate/company/job/stage → permitted detail/actions | U07/U08/U09/U12; five metrics, custom overlay; only supported Shortlist/Reject |
| /tpo/interviews | TpoInterviews.jsx | Coordinate schedules; Inspect logistics | Upcoming/completed → student/company/job/date/time/mode/round/outcome | U05/U09/U12; metric tiles/cards/unnamed filters |
| /tpo/placement-analytics | TpoPlacementAnalytics.jsx | Understand institutional activity | Scope → essential totals → departments → monthly → stages/drives | U09/U12; eight repeated metrics |
| /tpo/analytics | TpoPlacementAnalytics.jsx alias | Same activity analysis | Canonical nav /tpo/placement-analytics | O alias opened |
| /tpo/announcements | TpoAnnouncements.jsx | Publish notice; New announcement | Notices/date → composer with actual recipient scope → title/body → Publish/confirmation | U08; placeholder-only fields/custom overlay; no audience selector in UI |
| /tpo/messages | common/MessagesPage.jsx | Contact institutional student; Send | Named student → thread → composer → conversation selection | U07/U10; targeted composer opened via actual Message student URL |
| /tpo/notifications | common/NotificationsPage.jsx | Follow request/update; Open module (R) | Unread coordination context → action/date → read controls | U07; contextual links absent |
| /tpo/reports | TpoReports.jsx | Generate scoped report; Generate then Print / Save | Type/student scope → generated date/context → relevant summary → table → print | U03/U08/U09/U12; universal metric wall/unnamed selectors |
| /tpo/settings | TpoSettings.jsx | Maintain TPO profile/security; Save profile in section | Profile/designation → institution/access → separate security → actual account/email state | U08/U12; anonymous password visibility buttons/many panels |
| /tpo/challenges | common/ChallengesPage.jsx | Monitor institutional work; View brief & submissions | Brief/effort/deadline → institution submissions/reviews → evidence | U11; actual institution-only reviewed work O, no grading exposed |

### Public/account entry

| Current route | O screen / task | Primary action and hierarchy (R) | Limits |
|---|---|---|---|
| / | Explain platform | Role explanation → supported capabilities/limits → Sign in/Get started | U06 unsupported Study planner/exact gap claims; demo figures honestly labeled; oversized hero/grid |
| /login | Role + credentials | Compact role choice → credentials → Sign in → recovery | Generic failed login O; role cards consume mobile viewport; arrow-key role behavior unverified |
| /register | Registration form | Role → identity/credentials → appropriate organization field → Create account | Student form O; other role fields S; no account created; organization verification unsupported |
| /forgot-password | Recovery email | Email → Send recovery link → accurate delivery/error → Sign in | Form O; delivery not retried |
| /reset-password | Password form | Token status → password → Update → Sign in | O absent token silently disables; valid token not inspected |
| /verify-email | Verification | Token status → Verify → Sign in | O absent token silently disables; valid token not inspected |
| * | Page not found, via /ux-not-found | Explanation → Return home | O rendered; distinct from role/permission denial |

## 2. Step 1 baseline state coverage and prioritized issues

### State inspection ledger

O means rendered browser observation; S means source evidence only. Opening a form does not establish its submission behavior. Mobile route coverage means the page and shell were opened at 390 × 844; it does not mean every dialog, row, or asynchronous state was checked at that size.

| Page family | Observed states | Source-only or unavailable states |
|---|---|---|
| Student dashboard/profile | Populated dashboard, Digital Card, profile fields, four evidence records | Profile save, fresh validation/success, Card export in this step |
| Student resume | Two existing resumes, rules-based ATS scores 46/50, gaps/keywords, upload/history controls | Upload progress/failure, deletion confirmation, new ATS result |
| Student skills/tracker | Two self-reported skills, company-reviewed score, practice/controlled/legacy attempt history | Skill save/delete, new evaluated result |
| Student roadmap | Template Data Engineer roadmap, existing progress, source/limitation text | Checklist save feedback; recommendations are not validated personal gaps |
| Student courses | Empty catalog and empty recommendations | Populated course rows, external learning destination |
| Student marketplace/applications | Three opportunities, selected job and application form, two submitted applications, selected timeline | New application submission/duplicate response and upload/error states |
| Student interviews | Scheduled and completed records; completed future interview incorrectly grouped as upcoming | Fresh outcome/status transition |
| Student feed | Initial loading then empty feed, composer | Populated posts, publish/like/comment feedback; like failure logging S |
| Practice/controlled assessments | Catalog, rules, practice question with native radio group; final history visible in tracker | New controlled attempt, running/expired timer, final submission/result; intentionally not consumed |
| Challenges | Two briefs, existing final reviewed submission, score and rationale; company create form opened | New submission, pending rubric review, validation/final review success |
| Shared network/messages | Empty lists; targeted TPO student composer and disabled empty Send | Populated network/thread, send/duplicate/error feedback |
| Shared notifications | Existing read/unread rows and disabled/enabled mark-read controls | Fresh events and mark-read feedback; old stored malformed interview text distinguished from new event generation |
| Student settings | Loaded two privacy settings and limitations | Save/error/validation; initial loading behavior S |
| Company dashboard | Populated totals and funnel; funnel category labels absent visually | Loading/retry; funnel data contract mismatch S |
| Company jobs/new/edit | Published jobs, new form, owned populated edit form and editor alias | Save/duplicate/delete and permission failure |
| Company applications | Two candidates, filters/table, opened candidate review and six decision actions | Decision validation/success; Escape failure O; no decision submitted |
| Company interviews | Scheduled/completed rows; outcome dialog opens, Escape closes and restores focus | Outcome submission/validation/success |
| Company drives | Existing requests and new request fields | Request/save/conflict states |
| Company analytics | Populated totals/rows; actual offline Network error accompanied by misleading zero totals | Recovery after Retry: no Retry control exists |
| Company team/settings | Existing one-member team, populated company fields | Team mutation unsupported; settings save not performed |
| TPO overview/skills/analytics | Populated institutional totals, evidence average, charts; unavailable gap calculation shown alongside zero gap count | Chart keyboard/text equivalents S; no readiness prediction justified |
| TPO students/detail | One institutional student, filters, populated detail, evidence disclosure opened using Enter | New student/history cases, filter combinations, export |
| TPO internships/companies | Populated tables; internship cells misaligned; hiring cells omit available opening counts | Empty/filter-error states |
| TPO drives/applications/interviews | Populated queues; request review and candidate review opened; scheduled/completed interviews | Decisions not submitted; drive Escape failure O |
| TPO announcements | Existing announcement; new composer opened | Publish/edit/delete feedback; no publication performed |
| TPO reports | All seven report types generated with GET; Student report includes evidence/attempt/application/outcome history | Printed/PDF output; every generated report at mobile size |
| TPO settings | Profile/security forms, email status, password visibility controls | Password change and profile save |
| Public/account | Landing, login success for all roles, failed login feedback, Student registration, recovery, tokenless reset/verify, not-found | Other registration roles, valid recovery/verification tokens, mail delivery; only login inspected on mobile |

Keyboard observations are limited: native evidence disclosure works with Enter; the shared interview Modal moves focus and handles Escape/restoration; custom company candidate and TPO drive overlays leave Escape ineffective. A full keyboard, screen-reader, zoom, and contrast audit remains required. Wide tables generally stay inside their own scroll region; no general document-width overflow was established.

### Confirmed observations and recommendations

Priorities: P1 blocks understanding, accurate decisions, or accessible operation; P2 creates substantial task friction; P3 is polish. File references are repository-relative and identify the current implementation, not a claim that the proposed change is implemented.

| ID / priority | Observation (O), source evidence (S) | Recommendation (R) / files |
|---|---|---|
| U01 / P2 | O: Student has 17 flat navigation entries; mobile navigation relies on horizontal scrolling. TPO shell consumes about 322px before main content, versus about 175px for Student. Job editor and TPO alias paths lose the expected active navigation item. | Group modules without removing routes; compact mobile menu and account area; match editor prefixes and aliases. `client/src/routes/AppRoutes.jsx`, `client/src/layouts/TpoLayout.jsx`, `client/src/index.css` |
| U02 / P2 | O: Student dashboard leads with community/feed content and five metrics. TPO overview and operational pages place large totals before working queues. Company quick actions are below large dashboard blocks. | Put next action and relevant queue/progress first; move secondary summary totals into compact context. `client/src/pages/student/StudentDashboard.jsx`, `client/src/pages/company/CompanyDashboard.jsx`, `client/src/pages/tpo/TpoDashboard.jsx` |
| U03 / P1 | O: Company funnel bars have no visible stage names. TPO internship rows do not align with headers: applicant text appears under Company and later values shift. Company directory Hiring cells show a dash despite available opening counts. Department report hides the unassigned department identity. S: funnel expects name fields, directory reads active flags, generic report suppresses `_id`. | Repair display mappings against existing contracts; verify each column with real rows. Do not add fabricated data. `client/src/pages/company/CompanyDashboard.jsx` (HiringFunnel), `client/src/pages/tpo/TpoInternships.jsx` (table), `client/src/pages/tpo/TpoCompanies.jsx`, `client/src/pages/tpo/TpoReports.jsx` |
| U04 / P1 | O: A completed interview dated in the future is counted under Upcoming. S: grouping excludes cancelled but not completed records. | Group by lifecycle status and date together; completed outcomes belong to history. `client/src/pages/student/StudentInterviews.jsx` |
| U05 / P2 | O: Serif headings, emoji tiles, oversized headings, border-heavy forms and repeated cards differ across workspaces. Feed has no visible page heading. | Use shared type, spacing and header rules; reserve cards for meaningful groups. `client/src/index.css`, `client/src/pages/student/StudentDashboard.jsx`, `client/src/pages/student/StudentResume.jsx`, `client/src/pages/company/CompanyJobForm.jsx`, `client/src/pages/student/StudentFeed.jsx` |
| U06 / P1 | O: Dashboard says AI Roadmap while the opened roadmap identifies a template; roadmap topic strings say Gap. TPO shows zero Skill Gaps while also stating that gap thresholds are not configured; participation copy implies assessments although company-reviewed evidence contributes. Landing advertises Study planner/exact gaps without a supported matching workspace route. | Use honest labels below; unavailable gap calculations must not look like measured zero. Preserve limitations beside conclusions. `client/src/pages/student/StudentDashboard.jsx`, `client/src/pages/student/StudentRoadmap.jsx`, `client/src/pages/tpo/TpoSkills.jsx`, `client/src/routes/AppRoutes.jsx` |
| U07 / P2 | O: Evidence details display evaluator/source IDs; notifications expose raw status enums and an old stored Round: undefined event. Targeted message composer lacks clear recipient identity. | Show available human-readable context and retain identifiers as secondary audit detail; do not invent names. Format status text at presentation boundary; retain historical truth. Show selected recipient when supported. `client/src/components/common/CompetencyEvidence.jsx`, `client/src/pages/common/NotificationsPage.jsx`, `client/src/pages/common/MessagesPage.jsx` |
| U08 / P1 | O: Custom candidate/drive review overlays have no dialog semantics, anonymous close buttons and ineffective Escape. Shared interview Modal behaves correctly. Some selects, pagination arrows and password visibility buttons have no accessible name. Resume upload/history and job Edit contain nested interactive controls. | Reuse the shared dialog pattern; label every control; remove nested interactions during implementation. Test focus and keyboard, not only markup. `client/src/pages/company/CompanyApplications.jsx`, `client/src/pages/tpo/TpoPlacementDrives.jsx`, `client/src/pages/tpo/TpoApplications.jsx`, `client/src/pages/tpo/TpoAnnouncements.jsx`, `client/src/pages/tpo/TpoSettings.jsx`, `client/src/pages/student/StudentResume.jsx`, `client/src/pages/company/CompanyJobs.jsx` |
| U09 / P2 | O: Candidate, institutional and attempt tables require substantial horizontal reading on mobile, although page width remains contained. Charts offer little readable category/data context. | Prioritize identity, state and action on small screens; provide named scroll regions or equivalent list/detail views and textual chart summaries. `client/src/pages/student/StudentSkillTracker.jsx`, `client/src/pages/company/CompanyApplications.jsx`, `client/src/pages/tpo/TpoStudents.jsx`, `client/src/pages/tpo/TpoDashboard.jsx`, `client/src/pages/tpo/TpoSkills.jsx`, `client/src/pages/tpo/TpoReports.jsx` |
| U10 / P1 | O: Offline analytics shows Network error together with four zero totals/empty charts, which can be read as real results; no Retry. Tokenless reset/verify silently disable the action. S: several settings/network/message views initially resemble empty content rather than explicit loading. | Separate loading, unavailable/error, confirmed empty and populated states; preserve prior valid data only when clearly labeled stale; offer Retry where safe. Explain invalid/missing token. `client/src/pages/company/CompanyAnalytics.jsx`, `client/src/pages/common/NetworkPage.jsx`, `client/src/pages/common/MessagesPage.jsx`, `client/src/pages/student/StudentSettings.jsx`, `client/src/pages/auth/AccountRecovery.jsx` |
| U11 / P2 | O: Challenge lists require opening each brief to discover existing submission/review state. Assessment entry repeats rules while completed history is elsewhere. Company challenge review needs a clearer evaluation queue. | Surface existing own submission/review/attempt state where current responses support it; link history; preserve practice versus controlled rules and immutable finals. Missing response fields are a separate contract proposal, not permission to invent values. `client/src/pages/common/ChallengesPage.jsx`, `client/src/pages/student/StudentAssessments.jsx`, `client/src/pages/student/StudentSkillTracker.jsx` |
| U12 / P2 | O: One-member team repeats 1/1/1 metrics; one internship repeats 1/1/1; TPO analytics shows eight large totals before analysis; reports repeat general metrics. Resume analysis and Marketplace applications repeat information available elsewhere. | Retain task-relevant summaries and make detailed destinations explicit; replace metric cards with compact labeled totals where appropriate. `client/src/pages/company/CompanyTeam.jsx`, `client/src/pages/tpo/TpoInternships.jsx`, `client/src/pages/tpo/TpoPlacementAnalytics.jsx`, `client/src/pages/tpo/TpoReports.jsx`, `client/src/pages/student/StudentResume.jsx`, `client/src/pages/student/StudentMarketplace.jsx` |
| U13 / P3 | O: Raw status text, inconsistent date presentation, empty disabled pagination and stale analytics period/conversion wording reduce clarity. S: plural/text fallbacks include awkward opportunity wording. | Centralize presentation labels and dates; show pagination only when useful; remove claims of a selected reporting period until a real selector exists. `client/src/pages/common/NotificationsPage.jsx`, `client/src/pages/company/CompanyAnalytics.jsx`, `client/src/pages/student/StudentCourses.jsx`, `client/src/pages/tpo/TpoInternships.jsx` |

Additional source risks, not reproduced failures: feed like failures are console-only; compact uppercase labels and colored notices need contrast testing. Avoid presenting these as browser-confirmed accessibility failures.

## 3. Proposed navigation grouping

These are labels/groups over existing routes, not new modules or permission changes. Every supported destination remains reachable. Keep notifications available from the shell as well as its full page. Settings/account actions must not dominate the mobile viewport. Use a compact labeled Menu on mobile, with expandable groups, current-page indication and keyboard access; do not rely solely on a horizontally scrolling strip.

| Role | Group | Current destinations retained |
|---|---|---|
| Student | Overview | Dashboard |
| Student | Learn | Roadmap, Courses, Assessments, Challenges |
| Student | Skills & evidence | Skills, Skill tracker, Profile / Digital Card |
| Student | Opportunities | Marketplace, Applications, Interviews, Resume / ATS |
| Student | Community | Feed, Network, Messages |
| Student | Account | Notifications, Settings |
| Company | Overview | Dashboard |
| Company | Hiring | Applications, Interviews, Jobs (including New and both editor paths) |
| Company | Evaluation | Challenges |
| Company | Campus coordination | Placement drives |
| Company | People & communication | Network, Messages, Team |
| Company | Insights | Analytics |
| Company | Account | Notifications, Settings |
| TPO | Overview | Dashboard |
| TPO | Students & evidence | Students and student detail, Skills, Challenges |
| TPO | Placement coordination | Placement drives, Companies, Internships, Applications, Interviews |
| TPO | Communication | Announcements, Messages |
| TPO | Insights | Placement analytics, Reports |
| TPO | Account | Notifications, Settings |

Retain `/tpo/drives` and `/tpo/analytics` as supported aliases with canonical navigation highlighting. All `/company/jobs/...` editor paths highlight Jobs. Evidence remains inside the existing profile/student detail; an anchor is sufficient, without inventing a new competency route. Resume stays accessible as its own route despite its Opportunities grouping. TPO challenge access retains its current permissions; grouping it under evidence does not confer rubric-review authority.

Role emphasis: Student overview prioritizes next learning/career action, progress and evidence; Company overview prioritizes candidate decisions, interview actions and challenge evaluation; TPO overview prioritizes institutional evidence coverage, coordination queues and reporting scope. Do not turn these into the same generic metric dashboard.

## 4. Shared interaction patterns

| Pattern | Proposed standard | Acceptance |
|---|---|---|
| Page header | One visible H1, short task/scope description, one primary action where the task has one. Secondary actions use quieter treatment. Filters belong near their results. | No unexplained competing primary buttons; Feed has a heading; role/institution scope remains visible. |
| Forms | Persistent explicit labels; helper/required text; grouped related fields; field errors with `aria-invalid` and descriptions; submission error near action; preserve entered values after failure. | Keyboard order follows reading order; HTML and server errors accurately communicated; no misleading success before confirmed response. |
| Filters | Named controls, clear/reset, result count, meaningful options; distinguish no matches from no data. | No anonymous select; reset does not change institutional permissions; avoid advertising filters absent from existing API. |
| Tables | Identity/context first, state/date next, action last; headers and cells correspond; format enums/units/dates consistently. At mobile use concise row summaries/detail or a named keyboard-accessible scroll region. | Header/cell contract checked against real records; missing differs from zero; all actions retained and reachable. |
| Charts/totals | Small labeled totals near the task; chart categories plus equivalent textual summary/table. | Never show fetch failure as measured zero; scope/denominator/method explicit; no readiness prediction from evidence averages. |
| Details/evidence | Source, evaluator, timestamp, method/rubric, score and limitations together; audit identifiers secondary. Selected person/job visible in hiring/message context. | No invented evaluator name or verification claim; evidence accessible from existing profile. |
| Dialogs | Shared Modal semantics, accessible name, initial focus, trapped focus, Escape close, focus restored to trigger; explicit named close. Long candidate reviews may use an accessible sheet/detail layout. | Company review and TPO review match the working interview dialog behavior; no accidental decision on open/close. |
| Final work | Distinguish draft/input from submitted/final; server timer and deadline remain authoritative; final submissions/reviews remain immutable. | No fake autosave, reversible-final wording, local timer reset, extra submission attempt or unsupported edit action. |
| Feedback | Explicit loading, confirmed empty, filtered empty, recoverable error, validation and confirmed success. Safe Retry retains context. Status announcements use appropriate live regions. | Network error does not imply no records; invalid recovery tokens explained; success describes the actual completed operation. |
| Navigation | One main landmark, skip link, compact mobile menu, named controls, current route/group, account area after primary destinations. | Every current route/alias reachable by keyboard; no hidden-only module; no assessment timer reset due to shell changes. |
| Destructive actions | Clear object/context and consequence, distinguish from ordinary stage change, use existing confirmation behavior. | No nested interactive controls; deletion/irreversible review never masquerades as navigation. |

### Honest labels to preserve

| Capability | Required meaning |
|---|---|
| Practice | Repeatable practice, distinct from a controlled assessment; no controlled-attempt or verified competency claim from practice alone. |
| Controlled assessment | Server-timed assessment, with stated submission rules and limitations; no proctoring or identity verification claim. |
| Company-reviewed evidence | Named source/method, evaluator context, timestamp, rubric/feedback and limitations; not independent certification. |
| Evidence average / coverage | Describe included evaluated evidence and denominator; not employability, placement probability or universal readiness. |
| Roadmap | Template roadmap with actual source/limitations. Personal gap or AI personalization only when genuinely supported by the current returned data. |
| Digital Card | Platform Digital Card/identifier; not an institution-issued ID or identity verification. Preserve existing PDF limitations. |
| ATS | Rules-based ATS guidance and actual computed results; not a guarantee of employer screening or selection. |
| Skill gaps | Unavailable/not configured when calculation is absent; zero means a real calculated zero, not a placeholder. |

## 5. Shared visual direction — revised and implemented in Step 2

The following replaces the Step 1 white/slate/blue proposal, at the user's request. All roles share SkillSetu's palette; existing page-specific styling outside the three representative pages is reserved for later batches.

| Token / rule | Implemented direction |
|---|---|
| Background / surface | Warm off-white `#F5F4F0`; white `#FFFFFF` only for useful content groups/controls |
| Navigation / active | Charcoal `#202827`; pale green active item `#DDEDE5` with `#123F37` text |
| Text | Dark ink `#202725`; secondary `#59635E` |
| Action | Deep teal `#17665B`, white text; hover `#125248` |
| Borders | Decorative/group border `#D8DDD7`; interactive control edges strengthened to `#7B8780` for contrast |
| Focus | 3px teal outline with 3px offset; light green `#A4DAC7` on charcoal navigation |
| Feedback | Error `#A52A2A`, success `#176044`, warning token `#805416`; meaning also expressed in text |
| Typography | Segoe UI/system sans-serif; body 16/24px, controls 14/20px, supporting text 13/20px, representative H1 24/32px, H2 18/26px |
| Spacing / corners | Central 4px scale: 4/8/12/16/24/32px; shell 24px desktop, 16px horizontal mobile; 6–8px corners |
| Density | Sections/dividers and compact labeled totals; a surface only for an independent group such as Digital Card, table or mobile student row |
| Controls | One task primary where appropriate, quieter secondary actions, explicit labels and disabled states; no decorative gradients/images/emoji metrics added |

Numerical contrast checks: body/background 13.84:1, secondary/background 5.66:1, primary action 6.80:1, navigation text 13.69:1, group label 9.29:1, active navigation 9.67:1, control edge/white 3.74:1, teal focus/background 6.18:1, light focus/navigation 9.63:1, error/white 7.08:1, success/white 7.52:1. Decorative borders are not relied upon as the sole boundary of an input. Disabled controls are visually differentiated; comprehensive contrast checks of untouched pages remain in Step 7.

### Bounded Handshake reference research and decisions

Research: 6 October 2026. Public documentation and two official product screenshots were accessed. No signed-in Handshake account or inaccessible product screen was inspected. Marketing text is not evidence of signed-in interaction behavior. No branding, assets, wording or whole layout was copied.

| Official source / observed evidence | Adaptation in this step |
|---|---|
| [Student job search help](https://support.joinhandshake.com/hc/en-us/articles/218693408-Searching-for-Jobs-and-Internships) and its [official product screenshot](https://support.joinhandshake.com/hc/article_attachments/39288032478103): left navigation, nearby filters, compact opportunity list, selected detail with a contextual apply action | Retain Jobs/Applications/Interviews as distinct Student destinations inside Opportunities; make profile identity and evidence coherent sections. Search/detail redesign itself remains Step 3. No saved-search or recommendation feature added. |
| [Employer Jobs help](https://support.joinhandshake.com/hc/en-us/articles/360039550293-Navigating-the-Jobs-Page) and its [official product screenshot](https://support.joinhandshake.com/hc/article_attachments/26001216098583): action at page header, filters next to table, row-specific actions with permissions | Group Company Hiring separately from Evaluation/Campus coordination; use restrained page headers and readable job activity rows in Analytics. Existing candidate decisions stay intact; applicant review redesign is Step 4. |
| [Career staff student-profile help](https://support.joinhandshake.com/hc/en-us/articles/218693448-How-to-View-a-Student-s-Profile): documented Manage navigation, search/filters and student detail | Give TPO a Students & evidence group, labels beside every filter, working results ahead of redundant metrics, direct View student on mobile. No activity AI, impersonation or expanded permissions added. This is documentation evidence, not a live career-staff session. |
| [Employer marketing page](https://joinhandshake.com/employers/): public hiring product positioning | Context only. Marketing claims, totals and illustrations were not treated as UI behavior or imported into SkillSetu. |

Implementation evidence and limitations: [Step 2 validation](step-2-validation.md). Honest capability labels in section 4 remain mandatory.

Step 2 issue progress: U01 grouped shell/aliases/mobile navigation addressed; U05 addressed in shared primitives and representative pages, with inline legacy page styling remaining; U08 menu, representative labels and single-main issues addressed, with custom hiring/drive overlays remaining for later batches; U10 Company Analytics loading/error/retry addressed and TPO Students state distinctions refined. Other baseline findings remain assigned to their later implementation batches; the dashboard/report/table defects are not claimed fixed here. Next implementation batch: Step 3 Student task hierarchy.

## 6. Remaining implementation steps and acceptance checks

Each batch should compare the same populated pages before/after at agreed viewports, preserve current routes and API payloads, and run shared role smoke checks. UI work that needs new API fields must be proposed separately; never fill absent fields with invented results. Business records, environment files and unrelated changes stay intact. Existing authorized audit accounts may be used; no reseeding or migration as a design shortcut.

| Step / batch | Scope | Acceptance checks |
|---|---|---|
| 2. Shared foundation — recommended first | Shared typography/spacing/color tokens, shell/navigation groups, page headers, accessible buttons/labels and feedback primitives. Apply to a representative page in each role before rollout. | Every route/alias still reachable and highlighted appropriately; 390/768/1280px and 200% zoom checked; mobile menu/skip-link/focus tested; no API, permission or database changes; production build and role navigation smoke checks pass. |
| 3. Student task hierarchy | Dashboard next actions; Profile/Digital Card/evidence; Skills/tracker; honest roadmap/courses; Resume/ATS; Marketplace/applications/interviews. Fix completed-interview grouping and misleading labels. | Card remains rendered and export behavior preserved; practice/control history distinct; correct lifecycle grouping; resume and application actions intact; privacy boundaries and accurate unavailable/empty/error states checked. |
| 4. Company hiring workspace | Jobs/new/edit, candidate review, interview outcome, drives, analytics and company settings/team. Correct funnel labels and error totals; reduce competing stage actions. | Owned editor aliases work; every existing permitted decision remains; review dialog keyboard behavior; institution/candidate visibility unchanged; actual mutation feedback verified in authorized functional checks; analytics errors never display authoritative zero. |
| 5. Evaluation and shared communication | Assessment entry/practice/control presentation; challenge submission/review state and rubric hierarchy; evidence provenance; Network/Messages/Notifications/Feed. | Repeated practice isolated from controlled attempts; server deadline/expiry authoritative; duplicate requests and immutable final submissions/reviews retained; company evaluator boundaries retained; source/evaluator/time/limitations visible; populated and empty communication states verified using authorized existing data or explicitly approved test records. |
| 6. TPO coordination and reporting | Institutional students/detail, skills, companies/internships, drives, applications/interviews, announcements, analytics, all seven reports and settings. Correct table/display mappings and unavailable gap representation. | Real header/cell values align; institutional scope never broadens; review actions retained; no unsupported TPO grading; all seven report scopes and unassigned department identity checked; print layout separately verified; no claim of PDF validation until actually tested. |
| 7. Integrated usability and regression | Full responsive, keyboard and accessibility pass across roles; loading/empty/error/validation/success; consistent copy and final visual refinement. | 390/768/1280px, zoom, landscape and long content; keyboard/focus/contrast and chart text; complete authorized role journeys against local MongoDB; relevant regression tests and production build; failures fixed and affected flows retested. External services only claimed tested when configured. Passing unit tests alone is not pitch readiness. |

For each batch, record changed files, observed before/after evidence, affected functional regressions and untested states. Shared changes require Student, Company and TPO smoke checks immediately, not only in Step 7. Keep controlled-attempt consumption and irreversible final work deliberate; use the existing functional-audit procedures rather than casually submitting during visual inspection.

## 7. Historical Step 1 conclusion and inspection limits

Largest observed problems: task actions displaced by metric/card sections; flat mobile navigation and oversized TPO shell; inconsistent typography/layout; inaccurate lifecycle/display mappings; custom review dialogs and unnamed controls; misleading zero results on fetch failure; labels that imply unsupported gap/AI capabilities.

Recommended structure is grouped navigation over all existing routes, task-first page headers/content and shared forms/tables/dialog/feedback rules, with distinct priorities for learning/evidence, hiring/evaluation and institutional coordination. **Start Step 2 with the shared shell, navigation, header and feedback foundation.** At the end of Step 1 this was planning only. Step 2 now implements the shared foundation and three representative pages; see section 5 and the validation record.

Accessible page routes were inspected as listed. Screens/states not inspected live: populated Courses, Feed, Network and message threads (retained account data was empty); a fresh controlled attempt/timer expiry/result; new challenge work or a pending rubric-review editor (existing submissions were final); upload progress/new ATS result, deletion, new application, saved profile/privacy/settings, new interview/drive decision and fresh announcement success; valid reset/verification token, non-Student registration forms, external mail/AI/storage destinations; printed reports/PDFs and every generated report on mobile. Full screen-reader, contrast, zoom, tablet/landscape and exhaustive keyboard testing remain Step 7 checks. These are limits of this inspection, not fabricated passes or permission to change database fixtures.
