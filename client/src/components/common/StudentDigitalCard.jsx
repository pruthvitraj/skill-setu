import { SectionHeading } from './PageHeader';
import Button from './Button';
import Feedback from './Feedback';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
export default function StudentDigitalCard() {
  const { user } = useAuth(); const [student, setStudent] = useState(null); const [error, setError] = useState('');
  useEffect(() => { let active = true; api.get('/students/me').then(r => { if (active) setStudent(r.data.student); }).catch(e => { if (active) setError(e.message || 'Unable to load digital card.'); }); return () => { active = false; }; }, []);
  function printCard() {
    const card = document.getElementById('student-digital-card'); if (!card) return;
    const frame = document.createElement('iframe'); frame.title = 'Print student digital card'; frame.style.position = 'fixed'; frame.style.width = '0'; frame.style.height = '0'; document.body.appendChild(frame);
    const doc = frame.contentDocument; doc.open(); doc.write('<!doctype html><html><head><title>SkillSetu Student Card</title><style>body{font:16px Arial;padding:32px;color:#182d37}article{border:1px solid #bbb;padding:28px;max-width:560px}h3{font-size:24px}p{line-height:1.6}small{display:block;margin-top:24px}</style></head><body></body></html>'); doc.close(); doc.body.appendChild(card.cloneNode(true)); frame.contentWindow.focus(); frame.contentWindow.print(); setTimeout(() => frame.remove(), 60000);
  }
  return <section aria-label="Student digital card" className="ui-section">
    <SectionHeading title="Student Digital Card" description="Your SkillSetu platform identifier." actions={student && <Button variant="secondary" type="button" onClick={printCard}>Print / Save PDF</Button>} />
    {error && <Feedback kind="error">{error}</Feedback>}
    {!student && !error && <Feedback kind="loading">Loading card…</Feedback>}
    {student && <article id="student-digital-card" className="ui-digital-card">
      <p><strong>SkillSetu · Student Card</strong></p><h3>{user?.firstName} {user?.lastName}</h3>
      <p>{student.university?.name || 'Institution not linked'}</p>
      <p>{student.department?.name || 'Department not linked'}{student.batch ? ` · ${student.batch}` : ''}</p>
      {student.enrollmentNo && <p>Enrollment: {student.enrollmentNo}</p>}
      <p className="break-all font-mono">STU-{String(student._id).toUpperCase()}</p>
      <p>Account linked · {student.privacy?.showProfile === false ? 'Profile private' : 'Profile visible to platform recruiters'}</p>
      <small>Platform identifier. This card is not an institution-issued ID or identity verification. Competency evidence is available in the authenticated profile.</small>
    </article>}
  </section>;
}
