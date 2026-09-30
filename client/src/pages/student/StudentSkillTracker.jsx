import { useState } from 'react';
import { skillApi } from '../../services/skillApi';
import { useFetch } from '../../hooks/useFetch';

function CircleScore({ score, size=80, label }) {
  const deg = Math.round((score||0) * 3.6);
  const color = (score||0)>=70?'#22c55e':(score||0)>=40?'#f59e0b':'#ef4444';
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ width:size, height:size, borderRadius:'50%',
        background:`conic-gradient(${color} ${deg}deg, #e2e8f0 0)`,
        display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 6px' }}>
        <div style={{ width:size-16, height:size-16, borderRadius:'50%', background:'#fff',
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:size*0.22, fontWeight:800, color:'#0f2447' }}>{score??0}</span>
        </div>
      </div>
      <p style={{ fontSize:12, color:'#64748b', margin:0, fontWeight:600 }}>{label}</p>
    </div>
  );
}

export default function StudentSkillTracker() {
  const { data, loading } = useFetch(skillApi.tracker, []);
  const [activeTab, setActiveTab] = useState('scores');

  const scores = data?.scores || [];
  const history = data?.history || [];
  const overall = data?.overall || 0;

  const tabs = ['scores', 'history'];

  if (loading) return <div style={{ padding:32, color:'#64748b' }}>Loading skill tracker…</div>;

  return (
    <div style={{ maxWidth:1100, padding:'28px 24px 48px' }}>
      <h1 style={{ fontSize:26, fontWeight:800, color:'#0f2447', fontFamily:'Georgia,serif', margin:'0 0 4px' }}>
        📊 Skill Tracker
      </h1>
      <p style={{ fontSize:14, color:'#64748b', margin:'0 0 24px' }}>
        Take assessments to measure and improve your skill scores.
      </p>

      {/* Overall */}
      <div style={{ background:'linear-gradient(135deg,#0f2447,#22488f)', borderRadius:16,
        padding:'24px 28px', color:'#fff', marginBottom:24, display:'flex', gap:32, alignItems:'center' }}>
        <div>
          <CircleScore score={overall} size={100} label="Overall Score" />
        </div>
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 6px', fontFamily:'Georgia,serif' }}>
            Your Skill Score: {overall}/100
          </h2>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.75)', margin:'0 0 12px' }}>
            {overall >= 70 ? '🌟 Great performance! Keep it up.' :
             overall >= 40 ? '📈 Good start. Take more assessments to improve.' :
             '🚀 Take skill assessments to boost your score.'}
          </p>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.6)', margin:0 }}>
            Based on {scores.length} skill{scores.length!==1?'s':''} assessed
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:20,
        background:'#f1f5f9', borderRadius:10, padding:4, width:'fit-content' }}>
        {tabs.map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)}
            style={{ padding:'7px 20px', borderRadius:8, border:'none', cursor:'pointer',
              fontWeight:600, fontSize:13, textTransform:'capitalize',
              background: activeTab===t?'#fff':'transparent',
              color: activeTab===t?'#0f2447':'#64748b',
              boxShadow: activeTab===t?'0 1px 4px rgba(0,0,0,0.1)':'none' }}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'scores' && (
        scores.length === 0 ? (
          <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16,
            padding:48, textAlign:'center', color:'#94a3b8' }}>
            <p style={{ fontSize:32, margin:'0 0 12px' }}>🧪</p>
            <p style={{ fontWeight:700, fontSize:16, color:'#0f2447', margin:'0 0 6px' }}>No assessments taken yet</p>
            <p style={{ fontSize:13, margin:'0 0 20px' }}>Take a skill assessment to see your score here.</p>
            <a href="/student/assessments" style={{ padding:'10px 24px', background:'#1e40af',
              color:'#fff', borderRadius:10, fontWeight:700, fontSize:14, textDecoration:'none' }}>
              Browse Assessments →
            </a>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {scores.map(s=>{
              const color = (s.overall||0)>=70?'#22c55e':(s.overall||0)>=40?'#f59e0b':'#ef4444';
              return (
                <div key={s._id} style={{ background:'#fff', border:'1px solid #e2e8f0',
                  borderRadius:14, padding:'18px 20px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                    <h3 style={{ fontSize:16, fontWeight:700, color:'#0f2447', margin:0 }}>
                      {s.skill?.name || 'Skill'}
                    </h3>
                    <span style={{ fontSize:20, fontWeight:800, color }}>{s.overall ?? 0}</span>
                  </div>
                  <div style={{ height:8, background:'#f1f5f9', borderRadius:8, overflow:'hidden', marginBottom:12 }}>
                    <div style={{ width:`${s.overall||0}%`, height:'100%', background:color, borderRadius:8 }} />
                  </div>
                  {s.topics?.length > 0 && (
                    <div>
                      {s.topics.map(t=>(
                        <div key={t.name} style={{ display:'flex', justifyContent:'space-between',
                          fontSize:12, color:'#64748b', marginBottom:4 }}>
                          <span>{t.name}</span>
                          <span style={{ fontWeight:700 }}>{t.score}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {activeTab === 'history' && (
        history.length === 0 ? (
          <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16,
            padding:48, textAlign:'center', color:'#94a3b8' }}>
            <p style={{ fontSize:15, fontWeight:600 }}>No assessment history yet.</p>
          </div>
        ) : (
          <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
                  {['Skill','Score','Topics','Date'].map(h=>(
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left',
                      fontSize:12, fontWeight:700, color:'#64748b', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(h=>{
                  const color = (h.score||0)>=70?'#22c55e':(h.score||0)>=40?'#f59e0b':'#ef4444';
                  return (
                    <tr key={h._id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                      <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:'#0f2447' }}>
                        {h.skill?.name || '—'}
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ fontSize:16, fontWeight:800, color }}>{h.score ?? 0}</span>
                      </td>
                      <td style={{ padding:'12px 16px', fontSize:12, color:'#64748b' }}>
                        {h.topicScores?.length ? h.topicScores.map(t=>`${t.topic}:${t.score}%`).join(', ') : '—'}
                      </td>
                      <td style={{ padding:'12px 16px', fontSize:12, color:'#94a3b8' }}>
                        {new Date(h.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}