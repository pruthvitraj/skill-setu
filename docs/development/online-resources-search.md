# Student Resources: online search

The Resources search now retrieves online documentation, educational articles and public indexed GitHub repositories through the backend. YouTube remains in the separate Courses section. Database entries are retained in a separately labeled Saved catalog, with existing catalog pagination and profile recommendations intact. No catalog records or competency evidence are written by search.

## Configure a free search provider

This implementation uses Tavily Basic Search (`https://api.tavily.com/search`). Obtain a free-plan API key from https://app.tavily.com and privately set `TAVILY_API_KEY` in the server environment. Keep the Tavily account on its free plan with paid billing/pay-as-you-go disabled; the application does not configure billing or enable a paid fallback. Restart the backend after configuring the key. The committed example field is blank; private environment files were not changed.

Tavily documents 1,000 free credits per month without a credit card. Each uncached skill search uses three basic searches, one per requested resource type (approximately three basic credits). Advanced search, automatic search-depth selection, generated answers, raw page content and images are disabled. Free account quota is enforced by the provider; process caches do not replace account-level limits.

Official references: [Tavily pricing](https://www.tavily.com/pricing) and [Search API](https://docs.tavily.com/documentation/api-reference/endpoint/search).

## API and provenance

Authenticated students submit `GET /api/courses/resources?q=React`. The response includes `query`, `items`, `provider`, `retrievedAt` and `cached`. Results contain title, source hostname, type, short description and the exact URL returned by the search API. Descriptions are provider search excerpts, not generated answers. No LLM constructs links, and no fallback turns catalog entries or fixed URLs into search results.

Separate searches restrict results to curated official technical documentation domains, established educational article sites and github.com. Local URL checks enforce these domains, HTTPS, no embedded credentials and actual repository paths; GitHub profiles, issues and topic pages are excluded. Unsupported or unsafe result URLs are omitted. Labels describe source category, not independently verified quality. GitHub results are publicly indexed search results, not a live verification of every repository's current access or maintenance status. The service never fetches user- or model-selected URLs. YouTube is excluded by the request and source filtering.

Inputs must be strings of 2–100 characters without control characters. Each category is limited to three results, with at most nine unique resources per search. Response bodies are bounded; requests time out after 12 seconds and redirects are rejected. Identical simultaneous searches share the same request. Results are cached for 15 minutes, retaining original retrieval dates, with at most 100 entries and ten distinct searches in flight per process. Caches/cooldowns are not shared between server processes.

Provider credit/rate-limit failures pause uncached requests for an hour. Authentication failures pause requests until the key is corrected and the backend restarted. Cached results remain accessible until expiry. Missing credentials produce an actionable `RESOURCE_CONFIG` error naming TAVILY_API_KEY and setup/restart steps; errors never reveal raw provider bodies or keys. Failed retrieval never produces fictional results or silently switches to scraping/AI/catalog links.

## UI behavior

Resources is an independent dark-themed section below Courses, retaining 24px spacing. Search runs only on explicit submit or retry. It provides validation, loading, empty, error/retry and clear states. Request IDs prevent older successful or failed responses from replacing newer submissions, and clear/unmount invalidate pending updates. Results show resource type, title, source, description and an accessible external link. A missing description is labeled unavailable rather than invented. The saved catalog remains available independently of provider success.

## Validation on October 7, 2026

- All 8 focused mocked search tests passed. These cover React/SQL/Docker query contracts, exact returned metadata, exclusion of generated answers and YouTube, URL safety, cache/deduplication/expiry, invalid/empty responses, safe quota/auth/network/timeout failures and student-only route permissions.
- All 92 server regression tests passed, including existing YouTube, AI learning, catalog-related and ownership checks.
- Client production build and navigation checks were run; the existing large-chunk warning remains.
- Actual checks for **React, SQL and Docker each returned RESOURCE_CONFIG** because `TAVILY_API_KEY` is missing. No actual search requests were sent. Live results remain unverified and are not claimed to work until a key is configured.

After privately configuring the free-plan key, from `D:\Setup\skill-setu\server` run:

```powershell
node src/scripts/check-resource-search.js
```

This exercises the three requested topics through the actual service and prints only resource metadata or safe errors. It writes no database records and prints no key. A zero exit code means requests completed; inspect returned resources as well to assess relevance and source coverage. Browser generation/search journeys were not claimed from mocked tests or source inspection.

## Files changed for this task

- `server/src/config/env.js`, `server/.env.example`: backend search key configuration.
- `server/src/modules/courses/resource-search.service.js`: legitimate search API, source checks, metadata, cache and safe errors.
- `server/src/modules/courses/course.routes.js`: student-only resource search endpoint.
- `server/src/scripts/check-resource-search.js`: credential-safe React/SQL/Docker live check.
- `server/tests/resource-search.test.js`: mocked service and route tests.
- `client/src/services/courseApi.js`: call the backend resource endpoint.
- `client/src/components/learning/OnlineResources.jsx`: online resource search UI and stale-response protection.
- `client/src/pages/student/StudentCourses.jsx`: connect Resources search and retain stored entries under Saved catalog.
- This document.

The existing YouTube integration, Roadmap retrieval, AI practice flows, navigation routes and database names remain unchanged. Unrelated changes were preserved. No accounts, data, private credentials, deployment or push were changed.
