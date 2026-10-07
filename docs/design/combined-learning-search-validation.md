# Combined student learning search validation

Student learning now uses one “Topic or skill” input and one “Search” button. A submission starts the existing YouTube and Tavily endpoints concurrently with the same trimmed/normalized query. Courses and Resources remain separate labeled result groups with independent loading, empty, error and retry states. Retries call only the selected group. Existing cards, backend validation/caching, provider credentials, routes and Saved catalog were preserved.

The request controller invalidates older submissions, retries and unmounts. Invalid input makes no requests. Results from one provider are published immediately without waiting for the other to complete or succeed. No backend or database files were changed for this task.

## Changed files

- `client/src/components/learning/LearningSearch.jsx`: shared form and state wiring.
- `client/src/components/learning/learningSearchController.js`: concurrent calls, independent group states and stale-response protection.
- `client/src/components/learning/YouTubeResources.jsx`, `OnlineResources.jsx`: result-only presenters retaining cards and feedback.
- `client/src/pages/student/StudentCourses.jsx`: use the combined component; Saved catalog remains intact.
- `client/tests/learning-search.test.js`: focused orchestration regression checks.
- `client/tests/learning-search.browser.cjs`: isolated browser fixtures and responsive interaction checks.
- This note and validation screenshots.

## Evidence — October 7, 2026

- All 6 combined-search unit tests and all 3 existing navigation checks passed.
- Production client build passed. Its existing large-chunk warning remains.
- Headless Edge browser tests passed at desktop 1440x1000 and mobile 390x844, using synthetic student/API fixtures with no account or provider calls.
- One click produced exactly one YouTube and one resource request with the same trimmed topic.
- Successful YouTube cards remained visible during a resource error. Resource-only retry succeeded without repeating YouTube. Unit tests also covered the inverse partial failure.
- Enter submitted both requests. Saved catalog fixture remained visible.
- Measured spacing between groups: exactly 24px on both viewports.
- Desktop input/button centers differed by less than 1px. Mobile controls stacked at full available width; neither viewport had horizontal page overflow.
- Older successes/errors and unmount callbacks could not overwrite current results in focused tests.

Screenshots show synthetic fixtures, not verified live provider results:

- `docs/design/screenshots/combined-learning-search/desktop.png`
- `docs/design/screenshots/combined-learning-search/mobile.png`

## Repeat checks

From the client directory:

```powershell
node --test tests/learning-search.test.js tests/workspace-navigation.test.js
npm run build
npm run dev -- --host 127.0.0.1 --port 5173
```

With Playwright available, run `node tests/learning-search.browser.cjs`. If using a bundled package, set `PLAYWRIGHT_MODULE` to its package path. The test uses installed Edge by default; `LEARNING_BROWSER_CHANNEL` can select another installed supported browser. `LEARNING_TEST_URL` can override the local student learning URL. The test intercepts all API traffic with synthetic fixtures and creates no server/database records.

Live YouTube/Tavily results were not reverified in this UI-only task. Their previously reported missing credentials remain a separate setup issue. No reseed, push or deployment was performed.
