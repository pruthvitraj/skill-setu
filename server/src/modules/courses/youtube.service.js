const env = require('../../config/env');
const { AppError } = require('../../utils/AppError');
const { readBounded } = require('../../integrations/ai/json-adapter');
const ENDPOINT = 'https://www.googleapis.com/youtube/v3/search';
const LIMIT = 6;
function normalizeQuery(query) {
  if (typeof query !== 'string' || query.length > 100 || /[\x00-\x1f\x7f]/.test(query))
    throw new AppError('Enter a topic or skill of 2–100 characters.', 422, 'YOUTUBE_QUERY_INVALID');
  const value = query.trim().replace(/\s+/g, ' ');
  if (value.length < 2) throw new AppError('Enter a topic or skill of 2–100 characters.', 422, 'YOUTUBE_QUERY_INVALID');
  return value;
}
function decode(value) {
  return value.replace(/&(amp|quot|#39|apos|lt|gt);/g, (_, code) => ({ amp: '&', quot: '"', '#39': "'", apos: "'", lt: '<', gt: '>' })[code]);
}
function resource(item) {
  const type = item.id?.kind === 'youtube#video' ? 'video' : item.id?.kind === 'youtube#playlist' ? 'playlist' : null;
  const id = type === 'video' ? item.id.videoId : item.id?.playlistId;
  const snippet = item.snippet;
  if (!type || typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,150}$/.test(id) ||
      typeof snippet?.title !== 'string' || !snippet.title.trim() || typeof snippet.channelTitle !== 'string' || !snippet.channelTitle.trim()) return null;
  const thumbnail = snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url;
  let thumbnailUrl = null;
  try { const parsed = new URL(thumbnail); if (parsed.protocol === 'https:' && /(^|\.)ytimg\.com$/.test(parsed.hostname)) thumbnailUrl = parsed.href; } catch {}
  return { id, type, title: decode(snippet.title), channel: decode(snippet.channelTitle), thumbnail: thumbnailUrl,
    url: type === 'video' ? `https://www.youtube.com/watch?v=${encodeURIComponent(id)}` : `https://www.youtube.com/playlist?list=${encodeURIComponent(id)}` };
}
function createYouTubeSearch({ key = env.youtubeKey, fetchImpl = (...args) => fetch(...args), now = Date.now, timeoutMs = 10000 } = {}) {
  const cache = new Map(), pending = new Map();
  let blockedUntil = 0, blockedError;
  async function retrieve(query) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const url = new URL(ENDPOINT);
      url.search = new URLSearchParams({ part: 'snippet', type: 'video,playlist', q: `${query} tutorial`, order: 'relevance', safeSearch: 'moderate', maxResults: String(LIMIT), key });
      const response = await fetchImpl(url.href, { signal: controller.signal, redirect: 'error' });
      let payload;
      try { payload = JSON.parse(await readBounded(response, 262144)); }
      catch { if (controller.signal.aborted) throw new Error('timeout'); throw new AppError('YouTube returned an invalid response. Try again later.', 503, 'YOUTUBE_INVALID_RESPONSE'); }
      if (!response.ok) {
        const reasons = payload.error?.errors?.map(error => error.reason) || [];
        if (response.status === 429 || reasons.some(reason => ['quotaExceeded', 'dailyLimitExceeded', 'rateLimitExceeded'].includes(reason))) {
          blockedUntil = now() + 3600000;
          blockedError = new AppError('YouTube API quota or rate limit is exhausted. Searches are paused for one hour; cached results may still be available.', 503, 'YOUTUBE_QUOTA');
        } else if ([401,403].includes(response.status) || reasons.some(reason => ['keyInvalid', 'accessNotConfigured', 'ipRefererBlocked'].includes(reason))) {
          blockedUntil = Infinity;
          blockedError = new AppError('YouTube API key or API access was rejected. The server administrator must check the key, restrictions and YouTube Data API v3 enablement.', 503, 'YOUTUBE_CONFIG');
        } else throw new AppError('YouTube search is temporarily unavailable. Try again later.', 503, 'YOUTUBE_PROVIDER');
        throw blockedError;
      }
      if (!Array.isArray(payload.items)) throw new AppError('YouTube returned an invalid response. Try again later.', 503, 'YOUTUBE_INVALID_RESPONSE');
      const mapped = payload.items.slice(0, LIMIT).map(resource);
      if (mapped.some(item => !item)) throw new AppError('YouTube returned incomplete resource metadata. Try again later.', 503, 'YOUTUBE_INVALID_RESPONSE');
      const items = [...new Map(mapped.map(item => [`${item.type}:${item.id}`, item])).values()];
      return { query, items, retrievedAt: new Date(now()).toISOString() };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(controller.signal.aborted ? 'YouTube search timed out. Try again.' : 'Unable to connect to YouTube. Try again later.', 503, controller.signal.aborted ? 'YOUTUBE_TIMEOUT' : 'YOUTUBE_PROVIDER');
    } finally { clearTimeout(timer); }
  }
  async function search(input) {
    const query = normalizeQuery(input), cacheKey = query.toLowerCase();
    if (!key || key !== key.trim()) throw new AppError('YouTube search is not configured. The server administrator must set YOUTUBE_API_KEY.', 503, 'YOUTUBE_CONFIG');
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > now()) return { ...cached.value, query, cached: true };
    if (blockedUntil > now()) throw blockedError;
    if (pending.has(cacheKey)) return pending.get(cacheKey);
    if (pending.size >= 20) throw new AppError('YouTube search is busy. Try again shortly.', 503, 'YOUTUBE_BUSY');
    const request = retrieve(query).then(value => {
      if (cache.size >= 100) cache.delete(cache.keys().next().value);
      cache.set(cacheKey, { value, expires: now() + 900000 });
      return { ...value, cached: false };
    }).finally(() => pending.delete(cacheKey));
    pending.set(cacheKey, request);
    return request;
  }
  return { search };
}
const service = createYouTubeSearch();
module.exports = { search: service.search, createYouTubeSearch, normalizeQuery, ENDPOINT, LIMIT };
