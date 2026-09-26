import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Inbox,
  TrendingUp,
  Star,
  Check,
  X,
  Loader2,
  Clock,
  MapPin,
  User,
  MessageSquare,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Calendar,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_STYLES } from '@/lib/constants';
import { formatDate, formatRating } from '@/lib/format';
import type { AssistanceRequest, Helper, HelperFeedback, RequestStatus } from '@/types';
import VerificationBadge from '@/components/VerificationBadge';

interface RequesterInfo {
  full_name: string;
  phone: string | null;
  city: string | null;
}

type Tab = 'overview' | 'requests' | 'activity' | 'feedback';

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'requests', label: 'Incoming Requests', icon: Inbox },
  { id: 'activity', label: 'Monthly Activity', icon: TrendingUp },
  { id: 'feedback', label: 'Feedback', icon: Star },
];

const STATUS_FILTERS: { id: RequestStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'declined', label: 'Declined' },
  { id: 'cancelled', label: 'Cancelled' },
];

interface Props {
  onEditApplication: () => void;
}

export default function HelperDashboardPage({ onEditApplication }: Props) {
  const { user } = useAuth();
  const [helper, setHelper] = useState<Helper | null>(null);
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [requesters, setRequesters] = useState<Record<string, RequesterInfo>>({});
  const [placeNames, setPlaceNames] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<HelperFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      setError(null);

      const { data: helperRow, error: helperErr } = await supabase
        .from('helpers')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (helperErr) {
        setError('Unable to load your helper profile. Please try again.');
        setLoading(false);
        return;
      }
      if (!helperRow) {
        setHelper(null);
        setLoading(false);
        return;
      }
      setHelper(helperRow as Helper);

      const [reqResult, fbResult] = await Promise.all([
        supabase
          .from('assistance_requests')
          .select('*')
          .eq('helper_id', helperRow.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('helper_feedback')
          .select('*')
          .eq('helper_id', helperRow.id)
          .order('created_at', { ascending: false }),
      ]);

      if (reqResult.error) {
        setError('Unable to load your assistance requests. Please try again.');
        setLoading(false);
        return;
      }

      const reqs = (reqResult.data || []) as AssistanceRequest[];
      setRequests(reqs);
      setFeedback((fbResult.data || []) as HelperFeedback[]);

      const requesterIds = Array.from(new Set(reqs.map((r) => r.requester_id)));
      const placeIds = Array.from(new Set(reqs.map((r) => r.place_id).filter((id): id is string => !!id)));

      if (requesterIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name, phone, city')
          .in('id', requesterIds);
        const map: Record<string, RequesterInfo> = {};
        (profs || []).forEach((p) => {
          map[p.id] = { full_name: p.full_name, phone: p.phone, city: p.city };
        });
        setRequesters(map);
      }

      if (placeIds.length > 0) {
        const { data: places } = await supabase.from('places').select('id, name').in('id', placeIds);
        const map: Record<string, string> = {};
        (places || []).forEach((p) => {
          map[p.id] = p.name;
        });
        setPlaceNames(map);
      }

      setLoading(false);
    }
    load();
  }, [user]);

  const stats = useMemo(() => {
    const now = new Date();
    const counts: Record<RequestStatus, number> = {
      pending: 0,
      accepted: 0,
      declined: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };
    let monthlyCompleted = 0;
    requests.forEach((r) => {
      counts[r.status] += 1;
      if (r.status === 'completed' && r.completed_at) {
        const d = new Date(r.completed_at);
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) monthlyCompleted += 1;
      }
    });
    const avgRating = feedback.length > 0 ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length : 0;
    return {
      counts,
      total: requests.length,
      monthlyCompleted,
      workload: counts.accepted + counts.in_progress,
      avgRating,
      reviewCount: feedback.length,
    };
  }, [requests, feedback]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  const last7Days = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const count = requests.filter((r) => {
        const created = new Date(r.created_at);
        return (
          created.getDate() === d.getDate() &&
          created.getMonth() === d.getMonth() &&
          created.getFullYear() === d.getFullYear()
        );
      }).length;
      days.push({ label: d.toLocaleDateString('en-GB', { weekday: 'short' }), count });
    }
    return days;
  }, [requests]);

  const maxDayCount = Math.max(1, ...last7Days.map((d) => d.count));

  async function handleAction(request: AssistanceRequest, nextStatus: RequestStatus) {
    setActionId(request.id);
    setActionError(null);
    const patch: Partial<AssistanceRequest> & { updated_at: string } = {
      status: nextStatus,
      updated_at: new Date().toISOString(),
    };
    if (nextStatus === 'accepted') patch.accepted_at = new Date().toISOString();
    if (nextStatus === 'completed') patch.completed_at = new Date().toISOString();

    const { error: err } = await supabase.from('assistance_requests').update(patch).eq('id', request.id);
    if (err) {
      setActionError('Could not update this request. Please try again.');
      setActionId(null);
      return;
    }
    setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, ...patch } : r)));
    setActionId(null);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        <p className="text-sm text-slate-400">Loading your dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card py-12 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
        <p className="mt-3 text-sm text-slate-500">{error}</p>
      </div>
    );
  }

  if (!helper) {
    return (
      <div className="card py-12 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-teal-400" />
        <h2 className="mt-4 font-display text-lg font-bold text-slate-900">Set up your helper profile</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          We could not find a helper profile linked to your account yet. Complete your application to appear
          in the helpers directory and start receiving assistance requests.
        </p>
        <button onClick={onEditApplication} className="btn-primary mt-6">
          <Pencil className="h-4 w-4" />
          Complete Your Application
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 p-6 text-white sm:p-8">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Helper Dashboard</h1>
            <p className="mt-2 max-w-lg text-sm text-emerald-50 sm:text-base">
              Manage incoming assistance requests, track your activity, and see feedback from the travelers
              you've helped.
            </p>
            <div className="mt-3">
              <VerificationBadge status={helper.verification_status} size="md" />
            </div>
          </div>
          <button
            onClick={onEditApplication}
            className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30 transition-all hover:bg-white/25"
          >
            <Pencil className="h-4 w-4" />
            Edit Application
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              tab === id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Pending" value={stats.counts.pending} accent="amber" />
            <StatCard label="Accepted" value={stats.counts.accepted} accent="blue" />
            <StatCard label="In Progress" value={stats.counts.in_progress} accent="cyan" />
            <StatCard label="Completed" value={stats.counts.completed} accent="emerald" />
            <StatCard label="Total Requests" value={stats.total} accent="slate" />
            <StatCard label="Completed This Month" value={stats.monthlyCompleted} accent="emerald" />
            <StatCard label="Current Workload" value={stats.workload} accent="blue" />
            <div className="card">
              <p className="text-xs font-medium text-slate-400">Rating</p>
              <div className="mt-2 flex items-center gap-2">
                <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                <span className="font-display text-2xl font-extrabold text-slate-900">
                  {stats.reviewCount > 0 ? formatRating(stats.avgRating) : '—'}
                </span>
                <span className="text-xs text-slate-400">({stats.reviewCount})</span>
              </div>
            </div>
          </div>

          {stats.total === 0 && (
            <div className="card text-center py-10">
              <Inbox className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                You don't have any assistance requests yet. Once travelers find your profile in the Helpers
                directory, their requests will show up here.
              </p>
            </div>
          )}
        </div>
      )}

      {tab === 'requests' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`badge transition-all ${
                  statusFilter === f.id
                    ? 'bg-teal-600 text-white ring-1 ring-teal-600'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {actionError && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3.5 ring-1 ring-red-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <p className="text-sm text-red-600">{actionError}</p>
            </div>
          )}

          {filteredRequests.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-sm text-slate-500">No requests match this filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((r) => {
                const requester = requesters[r.requester_id];
                const isActing = actionId === r.id;
                return (
                  <div key={r.id} className="card">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-base font-bold capitalize text-slate-900">
                            {r.request_type}
                          </h3>
                          <span className={`badge ${REQUEST_STATUS_STYLES[r.status]}`}>
                            {REQUEST_STATUS_LABELS[r.status]}
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                          <User className="h-3.5 w-3.5" />
                          {requester?.full_name || 'A traveler'}
                        </p>
                        {(r.location_text || placeNames[r.place_id || '']) && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                            <MapPin className="h-3.5 w-3.5" />
                            {r.location_text || placeNames[r.place_id || '']}
                          </p>
                        )}
                        {r.preferred_time && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                            <Clock className="h-3.5 w-3.5" />
                            {r.preferred_time}
                          </p>
                        )}
                        {r.description && <p className="mt-2 text-sm text-slate-600">{r.description}</p>}
                        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Calendar className="h-3 w-3" />
                          Requested {formatDate(r.created_at)}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {r.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(r, 'accepted')}
                              disabled={isActing}
                              className="btn-primary !bg-emerald-600 !py-2 !px-3.5 text-xs hover:!bg-emerald-700"
                            >
                              {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                              Accept
                            </button>
                            <button
                              onClick={() => handleAction(r, 'declined')}
                              disabled={isActing}
                              className="btn-secondary !py-2 !px-3.5 text-xs"
                            >
                              <X className="h-3.5 w-3.5" />
                              Decline
                            </button>
                          </>
                        )}
                        {r.status === 'accepted' && (
                          <button
                            onClick={() => handleAction(r, 'in_progress')}
                            disabled={isActing}
                            className="btn-primary !bg-cyan-600 !py-2 !px-3.5 text-xs hover:!bg-cyan-700"
                          >
                            {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                            Mark In Progress
                          </button>
                        )}
                        {(r.status === 'accepted' || r.status === 'in_progress') && (
                          <button
                            onClick={() => handleAction(r, 'completed')}
                            disabled={isActing}
                            className="btn-primary !bg-emerald-600 !py-2 !px-3.5 text-xs hover:!bg-emerald-700"
                          >
                            {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Completed This Month" value={stats.monthlyCompleted} accent="emerald" />
            <StatCard label="Requests Handled" value={stats.total} accent="slate" />
            <StatCard label="Current Workload" value={stats.workload} accent="blue" />
          </div>

          <div className="card">
            <h3 className="section-title">Requests received — last 7 days</h3>
            <div className="mt-5 flex items-end justify-between gap-2">
              {last7Days.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full max-w-[28px] rounded-t-lg bg-teal-500"
                    style={{ height: `${Math.max(6, (d.count / maxDayCount) * 96)}px` }}
                    title={`${d.count} request${d.count === 1 ? '' : 's'}`}
                  />
                  <span className="text-[11px] text-slate-400">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">Recent activity</h3>
            {requests.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No activity yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {requests.slice(0, 6).map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg px-1 py-2 text-sm ring-1 ring-slate-100">
                    <div className="min-w-0 px-2">
                      <p className="truncate font-medium capitalize text-slate-700">{r.request_type}</p>
                      <p className="text-xs text-slate-400">{requesters[r.requester_id]?.full_name || 'A traveler'}</p>
                    </div>
                    <span className={`badge shrink-0 ${REQUEST_STATUS_STYLES[r.status]}`}>
                      {REQUEST_STATUS_LABELS[r.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'feedback' && (
        <div className="space-y-4">
          <div className="card flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
              <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-slate-900">
                {stats.reviewCount > 0 ? formatRating(stats.avgRating) : '—'}
              </p>
              <p className="text-xs text-slate-400">
                Average rating from {stats.reviewCount} review{stats.reviewCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {feedback.length === 0 ? (
            <div className="card py-12 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                No feedback yet. Feedback will appear here once travelers rate completed assistance.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedback.map((f) => {
                const request = requests.find((r) => r.id === f.assistance_request_id);
                return (
                  <div key={f.id} className="card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`h-4 w-4 ${n <= f.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">{formatDate(f.created_at)}</span>
                    </div>
                    {request && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium capitalize text-slate-400">
                        <ShieldCheck className="h-3 w-3" />
                        {request.request_type}
                      </p>
                    )}
                    {f.comment && <p className="mt-2 text-sm text-slate-600">{f.comment}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: 'amber' | 'blue' | 'cyan' | 'emerald' | 'slate' }) {
  const accentClass = {
    amber: 'text-amber-600',
    blue: 'text-blue-600',
    cyan: 'text-cyan-600',
    emerald: 'text-emerald-600',
    slate: 'text-slate-700',
  }[accent];
  return (
    <div className="card">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={`mt-2 font-display text-2xl font-extrabold ${accentClass}`}>{value}</p>
    </div>
  );
}
