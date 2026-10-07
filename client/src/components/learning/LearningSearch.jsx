import { useEffect, useRef, useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { courseApi } from '../../services/courseApi';
import YouTubeResources from './YouTubeResources';
import OnlineResources from './OnlineResources';
import SearchRecommendations from './SearchRecommendations';
import { selectSearchRecommendations } from './searchRecommendationRanking';
import { createLearningSearch, initialLearningResults } from './learningSearchController';
export default function LearningSearch() {
  const [topic, setTopic] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [validation, setValidation] = useState('');
  const [results, setResults] = useState(initialLearningResults);
  const search = useRef(null);
  if (!search.current) search.current = createLearningSearch({ youtube: courseApi.youtube, resources: courseApi.resources, onChange: setResults });
  useEffect(() => () => search.current.invalidate(), []);
  return <>
    <form className="sm-form sm-panel" style={{ alignItems: 'center' }} onSubmit={event => {
      event.preventDefault();
      try { search.current.search(topic); setHasSearched(true); setValidation(''); }
      catch (error) { setValidation(error.message); }
    }}>
      <Input label="Topic or skill" value={topic} onChange={event => setTopic(event.target.value)} placeholder="React Hooks, SQL joins, Docker…" maxLength={100} error={validation} hint="Search YouTube courses and online resources together. 2–100 characters." />
      <Button type="submit" className="w-full sm:w-auto">Search</Button>
    </form>
    {hasSearched && <><YouTubeResources state={results.courses} onRetry={() => search.current.retry('courses')} />
    <OnlineResources state={results.resources} onRetry={() => search.current.retry('resources')} />
    <SearchRecommendations recommendations={selectSearchRecommendations(results)} /></>}
  </>;
}
