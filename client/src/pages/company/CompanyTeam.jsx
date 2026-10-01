import { useMemo, useState } from 'react';
import {
  Users,
  Search,
  MoreHorizontal,
  ShieldCheck,
  Mail,
} from 'lucide-react';

export default function CompanyTeam() {
  const [members] = useState([]);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');

  const filteredMembers = useMemo(() => {
    const value = query.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !value ||
        member.name.toLowerCase().includes(value) ||
        member.email.toLowerCase().includes(value) ||
        member.department.toLowerCase().includes(value);

      const matchesRole = !role || member.role === role;

      return matchesSearch && matchesRole;
    });
  }, [members, query, role]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Company Workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#0f2447]">Team</h1>
            <p className="mt-2 text-slate-600">
              Manage recruiters, hiring managers and interviewers.
            </p>
          </div>

        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Members</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{members.length}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Recruiters</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {members.filter((m) => m.role === 'Recruiter').length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Active Members</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {members.filter((m) => m.status === 'Active').length}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search team members..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-400"
              />
            </div>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none"
            >
              <option value="">All roles</option>
              <option value="Hiring Manager">Hiring Manager</option>
              <option value="Recruiter">Recruiter</option>
              <option value="Interviewer">Interviewer</option>
            </select>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-4 p-5 md:flex-row md:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-[#22488f]">
                    {member.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{member.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                      <Mail size={13} />
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 text-sm md:w-[430px] md:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-400">Role</p>
                    <p className="mt-1 font-medium text-slate-700">{member.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Department</p>
                    <p className="mt-1 font-medium text-slate-700">{member.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Activity</p>
                    <p className="mt-1 font-medium text-slate-700">
                      {member.applications} reviews
                    </p>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <ShieldCheck size={12} />
                      {member.status}
                    </span>
                  </div>
                </div>

                <button
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  title="More actions"
                >
                  <MoreHorizontal size={19} />
                </button>
              </div>
            ))}

            {!filteredMembers.length && (
              <div className="p-12 text-center">
                <Users className="mx-auto text-slate-300" size={35} />
                <p className="mt-3 font-semibold text-slate-700">No team members found</p>
                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or role filter.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
