import { useEffect, useState } from 'react';
import { ArrowLeft, Mail, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { tpoApi } from '../../services/tpoApi';

export default function TpoStudentDetails() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await tpoApi.student(id);

        setData(
          response?.data?.student ||
          response?.data ||
          response?.student ||
          response
        );
      } catch (err) {
        setError(
          err?.message || 'Unable to load student details.'
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
        Loading student details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">
        {error}
      </div>
    );
  }

  const user = data?.user || {};
  const name =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ') || 'Student';

  return (
    <div className="space-y-6">
      <Link
        to="/tpo/students"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Students
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-slate-100 p-4">
            <UserRound className="h-7 w-7 text-slate-700" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {name}
            </h1>

            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <Mail className="h-4 w-4" />
              {user.email || data?.email || '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">
            Academic Information
          </h2>

          <div className="mt-5 space-y-4 text-sm">
            <div>
              <p className="text-slate-400">Batch</p>
              <p className="mt-1 font-semibold text-slate-800">
                {data?.batch || '—'}
              </p>
            </div>

            <div>
              <p className="text-slate-400">Placement Status</p>
              <p className="mt-1 font-semibold capitalize text-slate-800">
                {data?.placementStatus?.replaceAll('_', ' ') || '—'}
              </p>
            </div>

            <div>
              <p className="text-slate-400">Interview Status</p>
              <p className="mt-1 font-semibold capitalize text-slate-800">
                {data?.interviewStatus?.replaceAll('_', ' ') || '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">
            Skills
          </h2>

          <ul className="mt-5 space-y-3 text-sm">
            {data?.skills?.map(skill => <li key={skill._id || skill.name} className="flex justify-between"><span>{skill.name}</span><span className="capitalize text-slate-500">{skill.level}</span></li>)}
            {!data?.skills?.length && <li className="text-slate-500">No skills added yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
