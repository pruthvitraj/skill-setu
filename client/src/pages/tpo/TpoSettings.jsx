
import React, { useEffect, useState } from 'react';
import {
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Lock,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Eye,
  EyeOff,
  Monitor,
  Moon,
  Sun,
} from 'lucide-react';
import api from '../../services/api';

const Section = ({ icon: Icon, title, description, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-start gap-4 border-b border-slate-100 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
        <Icon size={19} className="text-slate-700" />
      </div>
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const Field = ({ label, value, onChange, type = 'text', placeholder, disabled }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
    />
  </label>
);

const Toggle = ({ label, description, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-100 p-4 hover:bg-slate-50">
    <div>
      <p className="text-sm font-medium text-slate-800">{label}</p>
      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
    </div>

    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${
        checked ? 'bg-slate-900' : 'bg-slate-300'
      }`}
      aria-label={label}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  </label>
);

export default function TpoSettings() {
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    designation: '',
  });

  const [notifications, setNotifications] = useState({
    placementDrives: true,
    interviews: true,
    applications: true,
    placements: true,
    companies: true,
    announcements: true,
    system: true,
    email: true,
    inApp: true,
  });

  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    pageSize: '25',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/tpo/settings');
      const user = response?.data?.user || response?.user || response;

      setEmailVerified(Boolean(user.isEmailVerified));
      setNotifications(current => ({ ...current, ...user.notificationPreferences }));
      setPreferences(current => ({ ...current, ...user.preferences }));
      setProfile({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        designation: user?.designation || 'Training and Placement Officer',
      });
    } catch (err) {
      setError(err?.message || 'Unable to load account settings.');
    } finally {
      setLoading(false);
    }
  }

  function updateProfile(key, value) {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateNotification(key, value) {
    setNotifications((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updatePreference(key, value) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveProfile() {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.patch('/tpo/settings/profile', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        designation: profile.designation,
      });

      setMessage('Profile settings saved successfully.');
    } catch (err) {
      setError(err?.message || 'Unable to save profile settings.');
    } finally {
      setSaving(false);
    }
  }

  async function saveNotifications() {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.patch('/tpo/settings/notifications', notifications);
      setMessage('Notification preferences saved.');
    } catch (err) {
      setError(err?.message || 'Unable to save notification preferences.');
    } finally {
      setSaving(false);
    }
  }

  async function savePreferences() {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.patch('/tpo/settings/preferences', preferences);
      setMessage('Application preferences saved.');
    } catch (err) {
      setError(err?.message || 'Unable to save preferences.');
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setMessage('');
    setError('');

    if (!passwords.current || !passwords.next || !passwords.confirm) {
      setError('Please fill all password fields.');
      return;
    }

    if (passwords.next.length < 8) {
      setError('New password must contain at least 8 characters.');
      return;
    }

    if (passwords.next !== passwords.confirm) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSaving(true);

    try {
      await api.patch('/tpo/settings/password', {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });

      setPasswords({
        current: '',
        next: '',
        confirm: '',
      });

      localStorage.removeItem('skillsetu_token');
      window.location.href = '/login';
    } catch (err) {
      setError(err?.message || 'Unable to change password.');
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    api.post('/auth/logout').finally(() => {
      localStorage.removeItem('skillsetu_token');
      window.location.href = '/login';
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-slate-500">Loading account settings...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your TPO account, profile and account security.
        </p>
      </div>

      {(message || error) && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
            error
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{error || message}</span>
        </div>
      )}

      <Section
        icon={User}
        title="Profile & Account"
        description="Manage the personal information associated with your TPO account."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="First name"
            value={profile.firstName}
            onChange={(v) => updateProfile('firstName', v)}
          />

          <Field
            label="Last name"
            value={profile.lastName}
            onChange={(v) => updateProfile('lastName', v)}
          />

          <Field
            label="Email address"
            value={profile.email}
            disabled
          />

          <Field
            label="Designation"
            value={profile.designation}
            onChange={(v) => updateProfile('designation', v)}
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </Section>

      <Section
        icon={Building2}
        title="University Information"
        description="Information connected to your TPO account."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Role
            </p>
            <p className="mt-1 font-medium text-slate-900">
              Training & Placement Officer
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Access Scope
            </p>
            <p className="mt-1 font-medium text-slate-900">
              Assigned University
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 md:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Account permissions
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Your TPO account can access placement and student information belonging
              to the university assigned to your account.
            </p>
          </div>
        </div>
      </Section>

      <p className="text-sm text-slate-600">Event notifications are available in Notifications. Subscription preferences are not available.</p>

      <Section
        icon={Shield}
        title="Security"
        description="Protect your SkillSetu TPO account."
      >
        <div className="space-y-5">
          {[
            ['current', 'Current password'],
            ['next', 'New password'],
            ['confirm', 'Confirm new password'],
          ].map(([key, label]) => (
            <div key={key} className="relative">
              <Field
                label={label}
                type={showPasswords[key] ? 'text' : 'password'}
                value={passwords[key]}
                onChange={(v) =>
                  setPasswords((current) => ({
                    ...current,
                    [key]: v,
                  }))
                }
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((current) => ({
                    ...current,
                    [key]: !current[key],
                  }))
                }
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-700"
              >
                {showPasswords[key] ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
          <Lock size={18} className="mt-0.5 text-slate-600" />
          <div>
            <p className="text-sm font-medium text-slate-800">
              Password requirements
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Use at least 8 characters. Never share your password or authentication
              credentials.
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={changePassword}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <Lock size={16} />
            {saving ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      </Section>



      <Section
        icon={Mail}
        title="Account Information"
        description="Basic account and session information."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">Account status</p>
            <p className="mt-1 flex items-center gap-2 font-medium text-emerald-600">
              <CheckCircle2 size={16} />
              Active
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">Email status</p>
            <p className="mt-1 font-medium text-slate-900">{emailVerified ? 'Verified' : 'Not verified'}</p>
          </div>

          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">Role</p>
            <p className="mt-1 font-medium text-slate-900">TPO</p>
          </div>
        </div>
      </Section>

      <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2 className="font-semibold text-red-900">Sign out</h2>
            <p className="mt-1 text-sm text-red-700">
              Sign out from this SkillSetu session on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}

