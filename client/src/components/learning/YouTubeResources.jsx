import { ArrowUpRight } from 'lucide-react';
import Button from '../common/Button';
import Feedback from '../common/Feedback';
import { LearningEmpty } from './LearningWorkspace';

export default function YouTubeResources({ state, onRetry }) {
  return <section className="sm-section" style={{ marginTop: 24 }} aria-labelledby="youtube-resources" aria-busy={state.status === 'loading'}>
    <div className="sm-section-heading"><div><p className="sm-overline">YouTube learning resources</p><h2 id="youtube-resources" className="mt-2">Courses</h2><p className="sm-muted mt-2">Find videos and playlists from YouTube. Relevance does not verify teaching quality or course completeness. Viewing resources creates no competency evidence.</p></div></div>
    {state.status === 'idle' && <LearningEmpty>Enter a topic or skill to search for YouTube videos and playlists.</LearningEmpty>}
    {state.status === 'loading' && <Feedback>Searching YouTube for “{state.query}”…</Feedback>}
    {state.status === 'error' && <Feedback kind="error" title="YouTube search unavailable" action={<Button variant="ghost" onClick={onRetry}>Retry search</Button>}>{state.error}</Feedback>}
    {state.status === 'ready' && <><p className="sm-meta my-4" role="status">{state.items.length} resource{state.items.length === 1 ? '' : 's'} for “{state.query}”{state.cached ? ' / Cached results' : ''}</p>
      {state.items.length ? <div className="sm-course-grid">{state.items.map(item => <article className="sm-panel sm-course" key={`${item.type}:${item.id}`}>
        {item.thumbnail && <img src={item.thumbnail} alt="" loading="lazy" className="w-full aspect-video object-cover" />}
        <p className="sm-meta sm-cyan">{item.type === 'playlist' ? 'Playlist' : 'Video'}</p><h3>{item.title}</h3><p className="sm-meta">{item.channel}</p>
        <div className="sm-course-footer"><a href={item.url} target="_blank" rel="noreferrer" className="btn-primary">Open {item.type}<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only">: {item.title} (opens in a new tab)</span></a></div>
      </article>)}</div> : <LearningEmpty>No YouTube videos or playlists matched “{state.query}”. Try a more specific topic.</LearningEmpty>}
    </>}
  </section>;
}
