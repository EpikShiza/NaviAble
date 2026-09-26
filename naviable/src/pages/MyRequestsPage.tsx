import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarClock, CheckCircle2, Clock3, Loader2, MapPin, MessageSquare, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { AssistanceRequest, RequestStatus } from '@/types';

interface Props {
  onLeaveFeedback: (request: AssistanceRequest) => void;
}

const STATUS_META: Record<RequestStatus, { label: string; className: string; icon: typeof Clock3 }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 ring-amber-200', icon: Clock3 },
  accepted: { label: 'Accepted', className: 'bg-blue-50 text-blue-700 ring-blue-200', icon: CheckCircle2 },
  in_progress: { label: 'In progress', className: 'bg-cyan-50 text-cyan-700 ring-cyan-200', icon: Loader2 },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: CheckCircle2 },
  declined: { label: 'Declined', className: 'bg-rose-50 text-rose-700 ring-rose-200', icon: XCircle },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600 ring-slate-200', icon: XCircle },
};

function formatDate(value: string | null) {
  if (!value) return 'Time not specified';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function MyRequestsPage({ onLeaveFeedback }: Props) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackRequestIds, setFeedbackRequestIds] = useState<Set<string>>(new Set());

  async function load() {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('assistance_requests')
      .select('*, helper:helpers(id,name,service_area,avatar_url)')
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false });
    if (err) {
      setError('Unable to load your assistance requests.');
      setLoading(false);
      return;
    }

    const nextRequests = (data || []) as AssistanceRequest[];
    setRequests(nextRequests);

    const completedIds = nextRequests.filter((request) => request.status === 'completed').map((request) => request.id);
    if (completedIds.length) {
      const { data: feedbackRows } = await supabase
        .from('feedback')
        .select('assistance_request_id')
        .eq('user_id', user.id)
        .in('assistance_request_id', completedIds);
      setFeedbackRequestIds(new Set((feedbackRows || []).map((row) => row.assistance_request_id).filter(Boolean)));
    } else {
      setFeedbackRequestIds(new Set());
    }
    setLoading(false);
  }

  useEffect(() => { void load(); }, [user]);

  const activeCount = useMemo(() => requests.filter((r) => ['pending', 'accepted', 'in_progress'].includes(r.status)).length, [requests]);
  const completedCount = useMemo(() => requests.filter((r) => r.status === 'completed').length, [requests]);

  async function cancelRequest(request: AssistanceRequest) {
    const { error: err } = await supabase
      .from('assistance_requests')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', request.id)
      .eq('requester_id', user?.id);
    if (err) setError('We could not cancel that request. Please try again.');
    else void load();
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-6 text-white sm:p-8">
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">Your assistance</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">My Requests</h1>
          <p className="mt-2 max-w-xl text-sm text-blue-50">Track requests from the moment you ask for help through completion and feedback.</p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
            <span className="rounded-full bg-white/15 px-3 py-1.5">{activeCount} active</span>
            <span className="rounded-full bg-white/15 px-3 py-1.5">{completedCount} completed</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-blue-500" /></div>
      ) : error ? (
        <div className="card flex items-start gap-3"><AlertCircle className="h-5 w-5 shrink-0 text-rose-500" /><p className="text-sm text-rose-600">{error}</p></div>
      ) : requests.length === 0 ? (
        <div className="card py-14 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 font-display text-lg font-bold text-slate-800">No assistance requests yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Choose a helper from the Helpers page when you need support.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const meta = STATUS_META[request.status];
            const Icon = meta.icon;
            return (
              <article key={request.id} className="card">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-base font-bold text-slate-900">{request.request_type}</h2>
                      <span className={`badge ring-1 ${meta.className}`}><Icon className={`h-3.5 w-3.5 ${request.status === 'in_progress' ? 'animate-spin' : ''}`} />{meta.label}</span>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="h-4 w-4" />{request.location}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400"><CalendarClock className="h-3.5 w-3.5" />{formatDate(request.requested_for)}</p>
                    {request.description && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">{request.description}</p>}
                  </div>
                  <div className="shrink-0 rounded-xl bg-slate-50 p-3 sm:min-w-48">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Helper</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{request.helper?.name || 'Assigned helper'}</p>
                    {request.helper?.service_area && <p className="mt-0.5 text-xs text-slate-400">{request.helper.service_area}</p>}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  {request.status === 'pending' && (
                    <button className="btn-secondary text-rose-600" onClick={() => void cancelRequest(request)}>Cancel request</button>
                  )}
                  {request.status === 'completed' && (
                    feedbackRequestIds.has(request.id) ? (
                      <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">Feedback submitted</span>
                    ) : (
                      <button className="btn-primary" onClick={() => onLeaveFeedback(request)}>Leave feedback</button>
                    )
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
