export function learningQuery(input) {
  if (typeof input !== 'string' || input.length > 100 || /[\x00-\x1f\x7f]/.test(input)) throw new Error('Enter a topic or skill of 2–100 characters.');
  const query = input.trim().replace(/\s+/g, ' ');
  if (query.length < 2) throw new Error('Enter a topic or skill of 2–100 characters.');
  return query;
}
const idle = () => ({ status: 'idle', query: '', items: [], error: '' });
export const initialLearningResults = () => ({ courses: idle(), resources: idle() });
export function createLearningSearch({ youtube, resources, onChange }) {
  const calls = { courses: youtube, resources };
  const versions = { courses: 0, resources: 0 };
  let query = '', states = initialLearningResults();
  function update(group, state) {
    states = { ...states, [group]: state }; onChange(states);
  }
  async function run(group) {
    const id = ++versions[group], requestedQuery = query;
    update(group, { status: 'loading', query: requestedQuery, items: [], error: '' });
    try {
      const result = await calls[group](requestedQuery);
      if (id !== versions[group]) return;
      update(group, { status: 'ready', query: requestedQuery, items: result.data.items, cached: result.data.cached, error: '' });
    } catch (error) {
      if (id !== versions[group]) return;
      update(group, { status: 'error', query: requestedQuery, items: [], error: error?.message || 'Unable to search. Try again.' });
    }
  }
  function invalidate() { versions.courses++; versions.resources++; }
  function search(input) {
    invalidate();
    try { query = learningQuery(input); }
    catch (error) { states = initialLearningResults(); onChange(states); throw error; }
    states = initialLearningResults(); onChange(states);
    // Both calls start immediately; each group publishes results independently.
    return Promise.all([run('courses'), run('resources')]);
  }
  function retry(group) {
    if (!query || !Object.hasOwn(calls, group)) return Promise.resolve();
    return run(group);
  }
  return { search, retry, invalidate };
}
