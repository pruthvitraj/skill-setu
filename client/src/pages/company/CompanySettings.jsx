import { useState } from 'react';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Save,
  Bell,
  ShieldCheck,
  Lock,
  CheckCircle2,
} from 'lucide-react';

const initialSettings = {
  companyName: 'Nimbus Labs',
  email: 'recruiter@skillsetu.dev',
  phone: '+91 98765 43210',
  website: 'https://nimbuslabs.example',
  location: 'Bengaluru, Karnataka',
  industry: 'Technology & Software',
  companySize: '51-200 employees',
  description:
    'Nimbus Labs builds modern software products and hires engineers across frontend, backend, data and cloud roles.',
};

export default function CompanySettings() {
  const [form, setForm] = useState(initialSettings);
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    applications: true,
    interviews: true,
    hiring: true,
    marketing: false,
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function saveSettings(event) {
    event.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-[1200px]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Company Workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#0f2447]">Settings</h1>
          <p className="mt-2 text-slate-600">
            Manage your company profile, notifications and account preferences.
          </p>
        </div>

        {saved && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={18} />
            Company settings saved successfully.
          </div>
        )}

        <form onSubmit={saveSettings} className="mt-8 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#eef2ff] p-2.5 text-[#22488f]">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-[#0f2447]">Company Profile</h2>
                  <p className="text-sm text-slate-500">
                    Information shown to candidates.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Company Name
                </span>
                <input
                  value={form.companyName}
                  onChange={(e) => update('companyName', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Industry
                </span>
                <input
                  value={form.industry}
                  onChange={(e) => update('industry', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Company Email
                </span>
                <div className="relative">
                  <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-400"
                  />
                </div>
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone
                </span>
                <div className="relative">
                  <Phone size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-400"
                  />
                </div>
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Website
                </span>
                <div className="relative">
                  <Globe size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={form.website}
                    onChange={(e) => update('website', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-400"
                  />
                </div>
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Location
                </span>
                <div className="relative">
                  <MapPin size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={form.location}
                    onChange={(e) => update('location', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-400"
                  />
                </div>
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Company Size
                </span>
                <select
                  value={form.companySize}
                  onChange={(e) => update('companySize', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none"
                >
                  <option>1-10 employees</option>
                  <option>11-50 employees</option>
                  <option>51-200 employees</option>
                  <option>201-500 employees</option>
                  <option>500+ employees</option>
                </select>
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Company Description
                </span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-[#22488f]" />
                <div>
                  <h2 className="font-bold text-[#0f2447]">Notifications</h2>
                  <p className="text-sm text-slate-500">
                    Choose which hiring events you want to receive.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {[
                ['applications', 'New applications', 'Notify me when candidates apply to my jobs.'],
                ['interviews', 'Interview updates', 'Notify me about interview scheduling and changes.'],
                ['hiring', 'Hiring activity', 'Notify me when candidate status changes.'],
                ['marketing', 'Product updates', 'Receive occasional SkillSetu product updates.'],
              ].map(([key, title, description]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between gap-6 p-5"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{title}</p>
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications[key]}
                    onChange={(e) =>
                      setNotifications((current) => ({
                        ...current,
                        [key]: e.target.checked,
                      }))
                    }
                    className="h-5 w-5 accent-[#22488f]"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-[#22488f]" />
                <div>
                  <h2 className="font-bold text-[#0f2447]">Security</h2>
                  <p className="text-sm text-slate-500">
                    Account security and access information.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Lock size={16} />
                  Authentication
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Your recruiter account is protected by authenticated API access.
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">Account Role</p>
                <p className="mt-2 text-sm text-slate-500">Company / Recruiter</p>
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[#22488f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1a3872]"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </form>

        <div className="mt-6 rounded-xl border border-blue-100 bg-[#eef2ff] p-5">
          <p className="font-semibold text-[#0f2447]">Demo settings data</p>
          <p className="mt-1 text-sm text-slate-600">
            Profile and notification values are currently local demonstration data.
          </p>
        </div>
      </div>
    </div>
  );
}
