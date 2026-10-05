import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../services/authApi';
export default function AccountRecovery({ mode }) {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setMessage(''); setError(''); }, [mode, token]);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (mode === 'forgot') { const r = await authApi.forgot(email); setMessage(r.message); return; }
      if (!token) throw new Error('This link is missing its token.');
      if (mode === 'verify') await authApi.verify(token);
      else await authApi.reset({ token, password });
      setMessage(mode === 'verify' ? 'Email verified.' : 'Password updated. Sign in again.');
    } catch (e) { setError(e.message || 'Unable to complete this request.'); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-slate-50 p-6"><form className="card mx-auto mt-16 max-w-md space-y-4" onSubmit={submit}><h1 className="text-2xl font-bold">{mode === 'forgot' ? 'Password recovery' : mode === 'verify' ? 'Verify your email' : 'Reset your password'}</h1>{error && <p role="alert" className="text-red-700">{error}</p>}{message ? <p role="status">{message}</p> : <>{mode === 'forgot' && <label className="block">Email<input className="input mt-2" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>}{mode === 'reset' && <label className="block">New password<input className="input mt-2" type="password" minLength={8} maxLength={200} autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>}<button className="btn-primary" disabled={busy || (mode !== 'forgot' && !token)}>{busy ? 'Saving...' : mode === 'forgot' ? 'Send recovery link' : mode === 'verify' ? 'Verify email' : 'Update password'}</button></>}<Link className="block text-sm underline" to="/login">Back to sign in</Link></form></main>;
}
