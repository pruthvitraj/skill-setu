# Student Courses: YouTube resources

Only Student Courses was extended. The existing catalog, role-based recommendations and dark learning UI remain in place. YouTube results are separate learning resources, explicitly labeled Video or Playlist; neither is presented as a complete course or verified competency evidence.

## Configuration and contract

Set `YOUTUBE_API_KEY` privately in the server environment and enable YouTube Data API v3 for that Google Cloud project. Apply appropriate server-side key restrictions. Restart the server after changing the environment. The blank `.env.example` entry is documentation only; no private environment file was changed.

Authenticated students submit `GET /api/courses/youtube?q=React%20Hooks`. The existing catalog and recommendation routes retain their permissions. The API returns `query`, `items`, `retrievedAt` and `cached`. Each resource has an actual YouTube ID, type, title, channel name, thumbnail URL (or null if unavailable/unsafe), and canonical video/playlist link. Titles are rendered as text, not HTML. Channel results are excluded.

The official `https://www.googleapis.com/youtube/v3/search` endpoint is called with `part=snippet`, `type=video,playlist`, relevance ordering and a tutorial-oriented query. Results are limited to six; no pagination, scraping, generated results, AI provider or web-search plugin is involved. Searches improve relevance but do not independently verify educational quality.

Inputs must be strings of 2–100 characters, without control characters. Searches occur only on explicit submission or an explicit retry. Repeated normalized queries are cached for 15 minutes (maximum 100 entries), concurrent identical queries share a request, and at most 20 distinct searches can be in flight in one server process. Reducing result count bounds output; cache/deduplication reduce the number of official search requests. Caches and cooldowns are process-local.

Requests have a ten-second timeout, bounded response size and no redirects. Quota/rate errors pause uncached searches for one hour; genuine cached results remain available until their normal expiry. Credential/access errors pause uncached searches until configuration is corrected and the backend is restarted. Raw provider messages, URLs containing credentials and keys are not returned or logged by this service.

## UI states

The distinct “Search YouTube resources” section provides an initial prompt, input validation, loading status, actual empty results, safe error messages and a retry action. A newer submission invalidates older responses, including failures; unmount invalidates pending updates. Typing does not trigger requests. Results show actual channel names and thumbnails, clear resource-type labels and accessible external links. Catalog loading/errors do not hide the YouTube section.

## Validation and current blocker

On October 7, 2026 (Asia/Calcutta):

- All 9 focused mocked tests passed: actual metadata mapping, query validation, deduplication/cache expiry, empty and malformed output, thumbnail restrictions, auth/quota cooldowns, timeout/network errors and authenticated student access. The existing catalog permission boundary was checked too.
- All 84 server regression tests passed.
- The client production build passed; its existing large main-chunk warning remains.
- The live configuration check found **YOUTUBE_API_KEY missing**. No live search was made and no successful live retrieval is claimed. Configure the private server key, restart, then submit one topic in Student Courses to verify real results.

No database records, competency evidence, accounts or private configuration files were changed. No push, deployment or reseed was performed. Other pre-existing uncommitted work was preserved.

## Changed files

- `server/src/config/env.js` and `server/.env.example`: backend key configuration.
- `server/src/modules/courses/youtube.service.js`: official API retrieval, validation, safe errors, cache and cooldown.
- `server/src/modules/courses/course.routes.js`: authenticated student search route.
- `client/src/services/courseApi.js`: client call to the backend (no key).
- `client/src/components/learning/YouTubeResources.jsx`: isolated search UI and stale-response protection.
- `client/src/pages/student/StudentCourses.jsx`: include the new section alongside the catalog.
- `server/tests/youtube-resources.test.js`: focused mocked retrieval and route checks.
- This document.

Official references: [search.list](https://developers.google.com/youtube/v3/docs/search/list) and [YouTube API errors](https://developers.google.com/youtube/v3/docs/errors).
