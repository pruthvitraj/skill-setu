import PageHeader, { SectionHeading } from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Feedback from '../../components/common/Feedback';
import CompetencyEvidence from '../../components/common/CompetencyEvidence';
import StudentDigitalCard from '../../components/common/StudentDigitalCard';
import api from '../../services/api';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function StudentProfile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
  }

  async function handleSubmit(event) {
    event.preventDefault(); setBusy(true); setSaved(false); setError('');
    try {
      const response = await api.patch('/auth/me', { firstName: form.firstName, lastName: form.lastName, phone: form.phone });
      updateUser(response.data.user); setSaved(true);
    } catch (e) { setError(e.message || 'Unable to save profile.'); }
    finally { setBusy(false); }
  }

  return <div className="ui-page">
    <PageHeader title="My profile" description="Your platform Digital Card, evaluated evidence and personal information." />
    <StudentDigitalCard />
    <CompetencyEvidence />
    <section className="ui-section" aria-labelledby="personal-details-heading">
      <SectionHeading title={<span id="personal-details-heading">Personal details</span>} description="Update your name and contact details. Your account email is read-only." />
      <form onSubmit={handleSubmit}>
        <div className="ui-form-grid">
          <Input label="First name" id="firstName" name="firstName" autoComplete="given-name" value={form.firstName} onChange={handleChange} />
          <Input label="Last name" id="lastName" name="lastName" autoComplete="family-name" value={form.lastName} onChange={handleChange} />
          <Input label="Email" id="email" name="email" type="email" readOnly value={form.email} hint="Email changes are not available in this form." />
          <Input label="Phone" id="phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} />
        </div>
        {error && <Feedback kind="error" title="Profile not saved">{error}</Feedback>}
        <div className="ui-form-actions"><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button>{saved && <Feedback kind="success">Changes saved.</Feedback>}</div>
      </form>
    </section>
  </div>;
}
