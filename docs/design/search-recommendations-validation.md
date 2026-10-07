# Search-based recommendations validation

Recommended for you on StudentCourses now selects at most three items from successful YouTube/Tavily results for the current submitted query. It is hidden before search and when there are no relevant results. It uses no profile or catalog fallbacks, no new provider calls, and no generated links. The page's unused profile recommendation request/state was removed. Other pages and backend endpoints were left unchanged; the catalog request and pre-existing page layout were preserved.

Matching requires all query words in returned titles, descriptions or source metadata. Exact topic phrases rank first, with official documentation preferred at equivalent specificity. URLs are deduplicated and original result objects are retained, preserving titles, sources/channels and links. Search start clears both previous result snapshots before publishing new group states; existing request versions prevent stale success/error/retry callbacks from restoring old recommendations.

Validation on October 7, 2026:

- All 13 focused client checks passed: topic ranking for React Hooks, SQL joins and Docker, metadata preservation, maximum three items, no unrelated fill, duplicate handling, empty/failed searches, partial successes, clearing and stale response rejection, plus existing search/navigation checks.
- Client production build passed; its existing large-chunk warning remains.
- Rendered headless Edge browser checks passed for all three topics using synthetic retrieved-result fixtures. Recommendations were hidden initially, cleared immediately on every new submission, ranked exact official documentation first and preserved original links.
- Browser checks observed six search requests for three submissions (one per existing endpoint per topic), and zero profile recommendation requests. No extra recommendation API calls occurred.
- Mocked/browser fixtures do not establish live provider availability; the previously reported YouTube/Tavily credential blockers were not changed or reverified.

Changed files: `StudentCourses.jsx`, `LearningSearch.jsx`, `learningSearchController.js`, new `SearchRecommendations.jsx` and `searchRecommendationRanking.js`, plus `client/tests/search-recommendations.test.js` and `client/tests/search-recommendations.browser.cjs`.

Repeat focused checks from the client directory:

```powershell
node --test tests/search-recommendations.test.js tests/learning-search.test.js tests/workspace-navigation.test.js
npm run build
```

The browser check runs with Playwright (or the bundled package via PLAYWRIGHT_MODULE) and a local client on port 5173: `node tests/search-recommendations.browser.cjs`. It intercepts all API requests and changes no accounts or data.
