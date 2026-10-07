import { ArrowUpRight } from 'lucide-react';
import Button from '../common/Button';
import Feedback from '../common/Feedback';
import { LearningEmpty } from './LearningWorkspace';
const labels = { documentation: 'Official documentation', article: 'Educational article', repository: 'Public GitHub repository' };
export default function OnlineResources({ state, onRetry }) {
  return <section className="sm-section" style={{ marginTop: 24 }} aria-labelledby="online-resources" aria-busy={state.status === 'loading'}>
    <div className="sm-section-heading"><div><p className="sm-overline">Online learning resources</p><h2 id="online-resources" className="mt-2">Resources</h2><p className="sm-muted mt-2">Search official documentation, educational articles and public GitHub repositories. Search results do not verify teaching quality or create competency evidence.</p></div></div>
    {state.status === 'idle' && <LearningEmpty>Enter a skill to search real online resources. The saved catalog remains available below.</LearningEmpty>}
    {state.status === 'loading' && <Feedback>Searching online resources for “{state.query}”…</Feedback>}
    {state.status === 'error' && <Feedback kind="error" title="Online resources unavailable" action={<Button variant="ghost" onClick={onRetry}>Retry search</Button>}>{state.error}</Feedback>}
    {state.status === 'ready' && <><p className="sm-meta my-4" role="status">{state.items.length} result{state.items.length === 1 ? '' : 's'} for “{state.query}” / {state.cached ? 'Cached search results' : 'Retrieved search results'}</p>
      {state.items.length ? <div className="sm-course-grid">{state.items.map(item => <article className="sm-panel sm-course" key={item.url}>
        <p className="sm-meta sm-cyan">{labels[item.type]}</p><h3>{item.title}</h3><p className="sm-meta">{item.source}</p>
        <p className="sm-description">{item.description || 'No description was returned by the search provider.'}</p>
        <div className="sm-course-footer"><a href={item.url} target="_blank" rel="noreferrer" className="btn-primary">Open resource<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only">: {item.title} (opens in a new tab)</span></a></div>
      </article>)}</div> : <LearningEmpty>No supported online resources matched “{state.query}”. Try a more specific skill.</LearningEmpty>}
    </>}
  </section>;
}
