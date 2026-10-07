const words = value => String(value || '').toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}+#]+/gu)?.map(word => word.length > 3 ? word.replace(/s$/, '') : word) || [];
const phrase = (text, query) => (` ${words(text).join(' ')} `).includes(` ${query.join(' ')} `);
export function selectSearchRecommendations(results) {
  const ready = ['courses', 'resources'].filter(group => results[group]?.status === 'ready');
  if (!ready.length) return [];
  const query = results[ready[0]].query;
  const tokens = words(query);
  if (!tokens.length) return [];
  const candidates = [];
  for (const group of ready) {
    const state = results[group];
    if (state.query !== query) continue;
    for (const item of state.items) {
      // Require every topic word in returned metadata, never use catalog/profile data.
      const text = [item.title, item.description, item.source].filter(Boolean).join(' ');
      const have = new Set(words(text));
      if (!tokens.every(token => have.has(token)) || !item.url) continue;
      const exactTitle = phrase(item.title, tokens), exactDescription = phrase(item.description, tokens);
      const official = group === 'resources' && item.type === 'documentation';
      candidates.push({ item, group, score: (exactTitle ? 100 : exactDescription ? 60 : 0) + (official ? 40 : 0) + tokens.filter(token => words(item.title).includes(token)).length });
    }
  }
  candidates.sort((a,b) => b.score - a.score);
  const unique = new Map();
  for (const { item, group } of candidates) if (!unique.has(item.url)) unique.set(item.url, { item, group });
  return [...unique.values()].slice(0,3);
}
