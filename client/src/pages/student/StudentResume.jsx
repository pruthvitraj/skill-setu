import { useRef, useState } from 'react';
import { resumeApi } from '../../services/resumeApi';
import { useFetch } from '../../hooks/useFetch';

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function scoreColor(v) {
  return v >= 70 ? '#22c55e' : v >= 40 ? '#f59e0b' : '#ef4444';
}

function ScoreBar({ label, value }) {
  const color = scoreColor(value);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{value ?? 0}</span>
      </div>
      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ width: `${value || 0}%`, height: '100%', background: color, borderRadius: 8, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function TagList({ items, bg, color, border }) {
  if (!items?.length) return <span style={{ fontSize: 12, color: '#94a3b8' }}>None</span>;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map((k, i) => (
        <span key={i} style={{ padding: '3px 10px', borderRadius: 20, background: bg, color, border: `1px solid ${border}`, fontSize: 12, fontWeight: 600 }}>
          {k}
        </span>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', marginBottom: 14 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f2447', margin: '0 0 10px' }}>{title}</h3>
      {children}
    </div>
  );
}

function BulletList({ items, color }) {
  if (!items?.length) return <span style={{ fontSize: 12, color: '#94a3b8' }}>None</span>;
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {items.map((s, i) => (
        <li key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
          <span style={{ color, flexShrink: 0 }}>{'•'}</span>
          {s}
        </li>
      ))}
    </ul>
  );
}

function ScoredByBadge({ scoredBy }) {
  const map = {
    gemini: { label: '✨ Scored by Gemini AI',   bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
    openai: { label: '🤖 Scored by OpenAI',      bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd' },
    rules:  { label: '📐 Rule-based Score',       bg: '#fefce8', color: '#92400e', border: '#fde68a' },
  };
  const s = map[scoredBy] || map.rules;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
      {s.label}
    </span>
  );
}

export default function StudentResume() {
  const inputRef = useRef(null);
  const { data, loading, setData } = useFetch(resumeApi.list, []);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const resumes = data?.resumes || [];
  const active = selected || resumes[0];
  const ats = active?.ats || {};
  const sb = ats.scoreBreakdown || {
    keywordMatch: ats.keywordMatch || 0,
    skillsMatch: ats.skillsMatch || 0,
    experienceMatch: ats.experienceMatch || 0,
    educationMatch: ats.educationMatch || 0,
    projectRelevance: ats.projectRelevance || 0,
    atsReadability: ats.formatting || ats.atsReadability || 0,
  };

  async function upload(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const ext = (file.name || '').split('.').pop().toLowerCase();
    const validExts = ['pdf'];
    const okMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/x-pdf'];
    if (!validExts.includes(ext) || file.type !== 'application/pdf') return setErr('Choose a PDF resume.');
    if (file.size > 5 * 1024 * 1024) return setErr('File must be under 5 MB.');
    setBusy(true); setErr(''); setMsg('Uploading and analysing with AI…');
    try {
      const res = await resumeApi.upload(file);
      const uploaded = res.data.resume;
      setData({ resumes: [uploaded, ...resumes] });
      setSelected(uploaded);
      setMsg('✅ Resume uploaded and AI-analysed!');
    } catch (e2) { setMsg(''); setErr(e2.message || 'Upload failed.'); }
    finally { setBusy(false); }
  }

  async function remove(id) {
    setBusy(true);
    try {
      await resumeApi.remove(id);
      const next = resumes.filter(r => r._id !== id);
      setData({ resumes: next }); setSelected(next[0] || null); setMsg('Removed.');
    } catch (e2) { setErr(e2.message || 'Could not remove.'); }
    finally { setBusy(false); }
  }

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading resumes…</div>;

  return (
    <div style={{ maxWidth: 1100, padding: '28px 24px 48px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f2447', fontFamily: 'Georgia,serif', margin: '0 0 4px' }}>
        📄 Resume &amp; ATS Score
      </h1>
      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px' }}>
        Upload your resume to get an AI-powered ATS analysis with keyword matching, skill gaps, and actionable recommendations.
      </p>

      {(msg || err) && (
        <div style={{ padding: '10px 16px', borderRadius: 10, marginBottom: 20, background: err ? '#fef2f2' : '#f0fdf4', color: err ? '#b91c1c' : '#15803d', border: `1px solid ${err ? '#fca5a5' : '#86efac'}`, fontSize: 13, fontWeight: 600 }}>
          {err || msg}
        </div>
      )}

      {/* Upload zone */}
      <div
        onClick={() => inputRef.current?.click()}
        style={{ border: '2px dashed #bfdbfe', borderRadius: 16, padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: '#eff6ff', marginBottom: 28, transition: 'border-color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#bfdbfe'}
      >
        <p style={{ fontSize: 36, margin: '0 0 8px' }}>📎</p>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#1d4ed8', margin: '0 0 4px' }}>
          {busy ? 'Analysing with AI…' : 'Click to upload your Resume'}
        </p>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>PDF — max 5 MB</p>
        <input ref={inputRef} type="file" className="sr-only" accept=".pdf" onChange={upload} />
      </div>

      {resumes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16 }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>📭</p>
          <p style={{ fontWeight: 600, fontSize: 15 }}>No resumes uploaded yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>

          {/* Left: history */}
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f2447', margin: '0 0 12px', fontFamily: 'Georgia,serif' }}>Upload History</h2>
            {resumes.map(r => (
              <div key={r._id} onClick={() => setSelected(r)}
                style={{ border: `2px solid ${active?._id === r._id ? '#3b82f6' : '#e2e8f0'}`, background: active?._id === r._id ? '#eff6ff' : '#fff', borderRadius: 12, padding: '12px 14px', marginBottom: 8, cursor: 'pointer' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#0f2447' }}>{r.fileName}</p>
                <p style={{ margin: '2px 0 6px', fontSize: 11, color: '#94a3b8' }}>Uploaded {fmt(r.createdAt)}</p>
                <div style={{ marginBottom: 6 }}><ScoredByBadge scoredBy={r.ats?.scoredBy} /></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: scoreColor(r.ats?.overall || 0) }}>
                    {r.ats?.overall ?? '—'}
                  </span>
                  <button onClick={ev => { ev.stopPropagation(); remove(r._id); }}
                    style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right: analysis */}
          {active && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f2447', margin: 0, fontFamily: 'Georgia,serif' }}>
                  ATS Analysis — {active.fileName}
                </h2>
                <ScoredByBadge scoredBy={ats.scoredBy} />
              </div>

              {/* Overall ring + score breakdown */}
              <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ width: 110, height: 110, borderRadius: '50%', background: `conic-gradient(${scoreColor(ats.overall || 0)} ${(ats.overall || 0) * 3.6}deg, #f1f5f9 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#0f2447', lineHeight: 1 }}>{ats.overall ?? 0}</span>
                    <span style={{ fontSize: 10, color: '#64748b' }}>ATS Score</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <ScoreBar label="Keyword Match" value={sb.keywordMatch} />
                  <ScoreBar label="Skills Match" value={sb.skillsMatch} />
                  <ScoreBar label="Experience Match" value={sb.experienceMatch} />
                  <ScoreBar label="Education Match" value={sb.educationMatch} />
                  <ScoreBar label="Project Relevance" value={sb.projectRelevance} />
                  <ScoreBar label="ATS Readability" value={sb.atsReadability} />
                </div>
              </div>

              {/* AI Summary */}
              {ats.summary && (
                <Section title="📋 AI Summary">
                  <p style={{ fontSize: 13, color: '#334155', margin: 0, lineHeight: 1.6 }}>{ats.summary}</p>
                </Section>
              )}

              {/* Strengths & Weaknesses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <Section title="✅ Strengths">
                  <BulletList items={ats.strengths} color="#22c55e" />
                </Section>
                <Section title="⚠️ Weaknesses">
                  <BulletList items={ats.weaknesses} color="#ef4444" />
                </Section>
              </div>

              {/* Matched & Missing Keywords */}
              <Section title="🔍 Keyword Analysis">
                <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: '0 0 6px' }}>MATCHED KEYWORDS</p>
                <TagList items={ats.matchedKeywords} bg="#dcfce7" color="#15803d" border="#86efac" />
                <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: '12px 0 6px' }}>MISSING KEYWORDS</p>
                <TagList items={ats.missingKeywords} bg="#fef3c7" color="#92400e" border="#fde68a" />
              </Section>

              {/* Matched & Missing Skills */}
              <Section title="🛠️ Skills Gap">
                <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: '0 0 6px' }}>MATCHED SKILLS</p>
                <TagList items={ats.matchedSkills} bg="#dbeafe" color="#1e40af" border="#93c5fd" />
                <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: '12px 0 6px' }}>MISSING SKILLS</p>
                <TagList items={ats.missingSkills} bg="#fee2e2" color="#991b1b" border="#fca5a5" />
              </Section>

              {/* Recommendations */}
              <Section title="💡 Recommendations to Improve Your Score">
                <BulletList items={ats.recommendations} color="#f59e0b" />
              </Section>

              {/* Extracted skills from parser */}
              {(active.parsed?.skills || []).length > 0 && (
                <Section title="📄 Skills Extracted from Resume">
                  <TagList items={active.parsed.skills} bg="#f0fdf4" color="#15803d" border="#bbf7d0" />
                </Section>
              )}

              {ats.disclaimer && (
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, lineHeight: 1.5 }}>{ats.disclaimer}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}