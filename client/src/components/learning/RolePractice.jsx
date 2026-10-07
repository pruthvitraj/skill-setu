import { useEffect, useState } from 'react';
import Button from '../common/Button';
import Feedback from '../common/Feedback';
import api from '../../services/api';

export default function RolePractice() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState('');
  const [busy, setBusy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const dirty = selected && response !== (selected.response || '');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const result = await api.get('/skills/practice-assignments');
      setItems(result.data.items || []);
    } catch (e) {
      setError(e.message || 'Unable to load saved assignments.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function choose(item) {
    setSelected(item);
    setResponse(item.response || '');
    setError('');
    setNotice('');
  }

  function remember(item) {
    setItems(current => [item, ...current.filter(existing => existing._id !== item._id)].slice(0, 30));
    setSelected(item);
    setResponse(item.response || '');
  }

  async function generate() {
    setBusy('generate');
    setError('');
    setNotice('');
    try {
      const result = await api.post('/skills/practice-assignments', {});
      remember(result.data.item);
      setNotice('Assignment generated and saved.');
    } catch (e) {
      setError(e.message || 'Generation unavailable. Please retry.');
    } finally {
      setBusy('');
    }
  }

  async function save(submit) {
    if (submit && !window.confirm('Submit this practice work? Submitted work cannot be edited.')) return;
    setBusy(submit ? 'submit' : 'save');
    setError('');
    setNotice('');
    try {
      const url = '/skills/practice-assignments/' + selected._id;
      const result = submit
        ? await api.post(url + '/submit', { response })
        : await api.patch(url, { response });
      remember(result.data.item);
      setNotice(submit ? 'Practice work submitted. No competency evidence was created.' : 'Draft saved.');
    } catch (e) {
      setError(e.message || 'Unable to save. Your text remains available here.');
    } finally {
      setBusy('');
    }
  }

  return <section className="sm-panel" aria-labelledby="role-practice-title">
    <p className="sm-overline">Target-role practice</p>
    <h2 id="role-practice-title" className="mt-2">AI practice assignments</h2>
    <p className="sm-muted mt-3">
      Uses the target role saved in Learning Roadmap. AI-generated tasks are learning guidance.
      Submitting records your work; it does not grade it or create competency evidence.
    </p>
    <div className="sm-actions mt-4">
      <Button disabled={loading || Boolean(busy) || Boolean(dirty)} onClick={generate}>
        {busy === 'generate' ? 'Generating...' : 'Generate assignment'}
      </Button>
    </div>

    {loading && <Feedback>Loading saved assignments...</Feedback>}
    {error && <Feedback kind="error" title="Practice action failed">{error}</Feedback>}
    {!loading && error && !selected &&
      <Button variant="ghost" disabled={Boolean(busy)} onClick={load}>Reload assignments</Button>}
    {notice && <Feedback kind="success">{notice}</Feedback>}

    {!loading && <div className="sm-actions mt-4">
      <label htmlFor="saved-practice" className="sm-meta">Saved assignments</label>
      <select id="saved-practice" value={selected?._id || ''}
        disabled={Boolean(busy) || Boolean(dirty)}
        className="w-full max-w-full border border-white/20 bg-[#0C0C0C] p-3 text-[#F8FAFC]"
        onChange={event => choose(items.find(item => item._id === event.target.value) || null)}>
        <option value="">Choose saved work</option>
        {items.map(item => <option key={item._id} value={item._id}>
          {item.title} ? {item.status}
        </option>)}
      </select>
      {!items.length && <p className="sm-muted">No saved assignments yet.</p>}
    </div>}

    {selected && <div className="mt-6">
      <p className="sm-meta">{selected.targetRole} / {selected.status} / AI-generated</p>
      <h3 className="mt-3">{selected.title}</h3>
      <p className="sm-muted mt-3 whitespace-pre-wrap">{selected.brief}</p>
      <h4 className="mt-6 font-semibold">Objectives</h4>
      <ul className="sm-rule-list">{selected.objectives.map((text, i) => <li key={i}>{text}</li>)}</ul>
      <h4 className="mt-6 font-semibold">Deliverables</h4>
      <ul className="sm-rule-list">{selected.deliverables.map((text, i) => <li key={i}>{text}</li>)}</ul>
      <h4 className="mt-6 font-semibold">Practice rubric</h4>
      <ul className="sm-rule-list">{selected.rubric.map((item, i) =>
        <li key={i}>{item.criterion} ({item.weight}%)</li>)}</ul>

      <label htmlFor="practice-response" className="mt-6 block font-semibold">Your work</label>
      <p id="practice-response-help" className="sm-muted mt-2">
        Add your explanation, code or project link. Maximum 20,000 characters.
      </p>
      <textarea id="practice-response" aria-describedby="practice-response-help"
        value={response} maxLength={20000} rows={10}
        readOnly={selected.status === 'submitted'} disabled={Boolean(busy)}
        onChange={event => setResponse(event.target.value)}
        className="mt-3 w-full border border-white/20 bg-black p-4 text-[#F8FAFC]" />

      {selected.status === 'draft' && <div className="sm-actions mt-4">
        <Button variant="ghost" disabled={Boolean(busy)} onClick={() => save(false)}>
          {busy === 'save' ? 'Saving...' : 'Save draft'}
        </Button>
        <Button disabled={Boolean(busy) || !response.trim()} onClick={() => save(true)}>
          {busy === 'submit' ? 'Submitting...' : 'Submit practice work'}
        </Button>
        {dirty && <Button variant="ghost" disabled={Boolean(busy)}
          onClick={() => {
            if (window.confirm('Discard changes since your last save?')) setResponse(selected.response || '');
          }}>Discard unsaved changes</Button>}
      </div>}
      {dirty && <p role="status" className="sm-muted mt-3">
        Unsaved changes. Save or discard before switching assignments. Leaving this page will lose unsaved text.
      </p>}
    </div>}
  </section>;
}
