import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function StudentProfile() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [saved, setSaved] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSaved(true);
  }

  const initials =
    `${form.firstName?.[0] || ''}${form.lastName?.[0] || ''}`.toUpperCase() || 'S';

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f2447]">
            My Profile
          </h1>

          <p className="mt-2 text-slate-600">
            Manage your personal information and profile details.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-8 flex items-center gap-4 border-b border-slate-200 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22488f] text-xl font-bold text-white">
              {initials}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {form.firstName || 'Student'} {form.lastName}
              </h2>

              <p className="text-sm text-slate-500">
                {user?.role || 'student'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  First Name
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-[#22488f] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Last Name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-[#22488f] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Phone
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-[#22488f] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4 border-t border-slate-200 pt-6">
              <button
                type="submit"
                className="rounded-lg bg-[#22488f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3872]"
              >
                Save Changes
              </button>

              {saved && (
                <span className="text-sm font-medium text-emerald-600">
                  Changes saved.
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}