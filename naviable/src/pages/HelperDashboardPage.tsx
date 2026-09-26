import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertCircle, CheckCircle2, Clock3, HandHeart, Loader2, MapPin, MessageSquare, Play, ShieldCheck, Star, Users, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { AssistanceRequest, Feedback, Helper, Profile, RequestStatus } from '@/types';

interface RequestWithRequester extends AssistanceRequest { requester?: Pick<Profile, 'full_name' | 'city'> | null; }

const statusLabel: Record<RequestStatus, string> = {
  pending: 'Pending', accepted: 'Accepted', in_progress: 'In progress', completed: 'Completed', declined: 'Declined', cancelled: 'Cancelled',
};

function formatDate(value: string | null) {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function HelperDashboardPage({ onOpenApplication }: { onOpenApplication: () => void }) {
  const { user, profile } = useAuth();
  const [helper, setHelper] = useState<Helper | null>(null);
  const [requests, setRequests] = useState<RequestWithRequester[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    setLoading(true);
    setError(null);
    const helperResult = await supabase.from('helpers').select('*').eq('user_id', user.id).maybeSingle();
    if (helperResult.error) {
      setError('Unable to load your helper profile.');
      setLoading(false);
      return;
    }
    setHelper((helperResult.data || null) as Helper | null);
    if (!helperResult.data) {
      setRequests([]);
      setFeedback([]);
      setLoading(false);
      return;
    }
    const [requestResult, feedbackResult] = await Promise.all([
      supabase.from('assistance_requests').select('*').eq('helper_id', helperResult.data.id).order('created_at', { ascending: false }),
      supabase.from('feedback').select('*').eq('helper_id', helperResult.data.id).order('created_at', { ascending: false }),
    ]);
    if (requestResult.error || feedbackResult.error) setError('Some dashboard information could not be loaded.');
    const requestRows = (requestResult.data || []) as RequestWithRequester[];
    const requesterIds = [...new Set(requestRows.map((r) => r.requester_id))];
    if (requesterIds.length) {
      const profilesResult = await supabase.from('profiles').select('id,full_name,city').in('id', requesterIds);
      if (!profilesResult.error) {
        const profileMap = new Map((profilesResult.data || []).map((p) => [p.id, p]));
        requestRows.forEach((r) => { r.requester = profileMap.get(r.requester_id) || null; });
      }
    }
    setRequests(requestRows);
    setFeedback((feedbackResult.data || []) as Feedback[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, [user]);

  const stats = useMemo(() => ({
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    inProgress: requests.filter((r) => r.status === 'in_progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
  }), [requests]);
  const averageRating = feedback.length ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length : 0;
  const monthKey = new Date().toISOString().slice(0, 7);
  const completedThisMonth = requests.filter((r) => r.status === 'completed' && r.completed_at?.slice(0, 7) === monthKey).length;

  async function updateStatus(request: RequestWithRequester, status: RequestStatus) {
    setActionId(request.id);
    setError(null);
    const now = new Date().toISOString();
    const patch: Record<string, string> = { status };
    if (status === 'accepted') patch.accepted_at = now;
    if (status === 'in_progress') patch.started_at = now;
    if (status === 'completed') patch.completed_at = now;
    if (status === 'declined') patch.declined_at = now;
    const { error: err } = await supabase.from('assistance_requests').update(patch).eq('id', request.id).eq('helper_id', helper?.id);
    if (err) setError('That request could not be updated. Please try again.');
    else await load();
    setActionId(null);
  }

  if (loading) return <div className="card flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-500" /></div>;

  if (!helper) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-500 p-7 text-white sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-100">Helper Portal</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Complete your helper profile</h1>
          <p className="mt-2 max-w-xl text-sm text-teal-50">Your helper dashboard becomes active after you submit the existing NaviAble helper application.</p>
        </div>
        <div className="card flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-display text-lg font-bold text-slate-900">Ready to help?</h2><p className="mt-1 text-sm text-slate-500">Add your skills, experience and availability so assistance requests can be assigned to your account.</p></div>
          <button className="btn-primary bg-teal-600 hover:bg-teal-700" onClick={onOpenApplication}><HandHeart className="h-4 w-4" /> Open helper application</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 p-6 text-white sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-teal-100">Helper dashboard</p><h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Welcome, {profile?.full_name?.split(' ')[0] || helper.name}</h1><p className="mt-2 text-sm text-teal-50">Manage incoming assistance, track your workload, and review traveler feedback.</p></div>
          <div className="rounded-2xl bg-white/10 px-4 py-3"><div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4" /> Helper profile active</div><p className="mt-1 text-xs text-teal-100">{helper.service_area || 'Service area not set'}</p></div>
        </div>
      </div>

      {error && <div className="card flex items-start gap-3"><AlertCircle className="h-5 w-5 shrink-0 text-rose-500" /><p className="text-sm text-rose-600">{error}</p></div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {([
          { label: 'Pending', value: stats.pending, icon: Clock3 },
          { label: 'Accepted', value: stats.accepted, icon: CheckCircle2 },
          { label: 'In progress', value: stats.inProgress, icon: Activity },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2 },
          { label: 'This month', value: completedThisMonth, icon: Users },
        ] as const).map(({ label, value, icon: Icon }) => (
          <div key={label} className="card"><div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-500">{label}</span><Icon className="h-4 w-4 text-teal-500" /></div><p className="mt-2 font-display text-2xl font-extrabold text-slate-900">{value}</p></div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-bold text-slate-900">Incoming requests</h2><p className="mt-1 text-xs text-slate-400">Requests assigned to your helper profile.</p></div><span className="badge bg-teal-50 text-teal-700 ring-1 ring-teal-200">{requests.length} total</span></div>
          <div className="mt-5 space-y-3">
            {requests.length === 0 ? <div className="rounded-xl bg-slate-50 p-8 text-center"><MessageSquare className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-600">No requests yet</p><p className="mt-1 text-xs text-slate-400">New assistance requests will appear here.</p></div> : requests.slice(0, 8).map((request) => (
              <div key={request.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{request.request_type}</h3><span className="badge bg-slate-100 text-slate-600 ring-1 ring-slate-200">{statusLabel[request.status]}</span></div><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{request.location}</p><p className="mt-1 text-xs text-slate-400">{formatDate(request.requested_for)} · {request.requester?.full_name || 'Traveler'}</p>{request.description && <p className="mt-2 text-sm text-slate-600">{request.description}</p>}</div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {request.status === 'pending' && <><button disabled={actionId === request.id} className="btn-primary bg-teal-600 hover:bg-teal-700" onClick={() => void updateStatus(request, 'accepted')}><CheckCircle2 className="h-4 w-4" />Accept</button><button disabled={actionId === request.id} className="btn-secondary text-rose-600" onClick={() => void updateStatus(request, 'declined')}><XCircle className="h-4 w-4" />Decline</button></>}
                    {request.status === 'accepted' && <button disabled={actionId === request.id} className="btn-primary" onClick={() => void updateStatus(request, 'in_progress')}><Play className="h-4 w-4" />Start</button>}
                    {request.status === 'in_progress' && <button disabled={actionId === request.id} className="btn-primary bg-emerald-600 hover:bg-emerald-700" onClick={() => void updateStatus(request, 'completed')}><CheckCircle2 className="h-4 w-4" />Complete</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="flex items-center gap-2"><Star className="h-5 w-5 fill-amber-400 text-amber-400" /><h2 className="font-display text-lg font-bold text-slate-900">Feedback</h2></div>
          <div className="mt-4 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100"><p className="text-xs font-medium text-amber-700">Average rating</p><p className="mt-1 font-display text-3xl font-extrabold text-slate-900">{averageRating ? averageRating.toFixed(1) : '—'}</p><p className="mt-1 text-xs text-slate-500">{feedback.length} completed-assistance review{feedback.length === 1 ? '' : 's'}</p></div>
          <div className="mt-4 space-y-3">
            {feedback.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">Feedback will appear here after travelers complete assistance.</p> : feedback.slice(0, 5).map((item) => <div key={item.id} className="rounded-xl border border-slate-100 p-3"><div className="flex items-center gap-1 text-amber-500">{[1,2,3,4,5].map((star) => <Star key={star} className={`h-3.5 w-3.5 ${star <= item.rating ? 'fill-amber-400' : 'text-slate-200'}`} />)}</div>{item.written_feedback && <p className="mt-2 text-xs leading-relaxed text-slate-600">“{item.written_feedback}”</p>}<p className="mt-2 text-[11px] text-slate-400">{new Date(item.created_at).toLocaleDateString()}</p></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
