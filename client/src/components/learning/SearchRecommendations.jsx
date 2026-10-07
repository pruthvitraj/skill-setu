import { ArrowUpRight } from 'lucide-react';
const labels = { video: 'Video', playlist: 'Playlist', documentation: 'Official documentation', article: 'Educational article', repository: 'Public GitHub repository' };
export default function SearchRecommendations({ recommendations }) {
  if (!recommendations.length) return null;
  return <section className="sm-section" style={{ marginTop: 24 }} aria-labelledby="search-recommendations">
    <div className="sm-section-heading"><div><p className="sm-overline">From your search results</p><h2 id="search-recommendations" className="mt-2">Recommended for you</h2><p className="sm-muted mt-2">Topic matches from retrieved results, with priority for official learning documentation.</p></div></div>
    <div className="sm-course-grid">{recommendations.map(({ item }) => <article className="sm-panel sm-course" key={item.url}>
      {item.thumbnail && <img src={item.thumbnail} alt="" loading="lazy" className="w-full aspect-video object-cover" />}
      <p className="sm-meta sm-cyan">{labels[item.type]}</p><h3>{item.title}</h3><p className="sm-meta">{item.source || item.channel}</p>
      {item.description && <p className="sm-description">{item.description}</p>}
      <div className="sm-course-footer"><a href={item.url} target="_blank" rel="noreferrer" className="btn-primary">Open resource<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only">: {item.title} (opens in a new tab)</span></a></div>
    </article>)}</div>
  </section>;
}
