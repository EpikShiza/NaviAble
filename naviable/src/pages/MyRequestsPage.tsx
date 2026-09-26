import { useEffect, useMemo, useState } from 'react';
import {
  ClipboardList,
  MapPin,
  Clock,
  Calendar,
  Loader2,
  AlertCircle,
  X,
  Star,
  Send,
  HandHeart,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_STYLES } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import type { AssistanceRequest, HelperFeedback } from '@/types';

interface HelperInfo {
  name: string;
  service_area: string | null;
}

interface Props {
  onBrowseHelpers: () => void;
}

export default function MyRequestsPage({ onBrowseHelpers }: Props) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [helpers, setHelpers] = useState<Record<string, HelperInfo>>({});
  const [placeNames, setPlaceNames] = useState<Record<string, string>>({});
  const [feedbackByRequest, setFeedbackByRequest] = useState<Record<string, HelperFeedback>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [feedbackModalFor, setFeedbackModalFor] = useState<AssistanceRequest | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('assistance_requests')
        .select('*')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (err) {
        setError('Unable to load your requests. Please try again.');
        setLoading(false);
        return;
      }

      const reqs = (data || []) as AssistanceRequest[];
      setRequests(reqs);

      const helperIds = Array.from(new Set(reqs.map((r) => r.helper_id)));
      const placeIds = Array.from(new Set(reqs.map((r) => r.place_id).filter((id): id is string => !!id)));
      const completedIds = reqs.filter((r) => r.status === 'completed').map((r) => r.id);

      if (helperIds.length > 0) {
        const { data: helperRows } = await supabase.from('helpers').select('id, name, service_area').in('id', helperIds);
        const map: Record<string, HelperInfo> = {};
        (helperRows || []).forEach((h) => {
          map[h.id] = { name: h.name, service_area: h.service_area };
        });
        setHelpers(map);
      }

      if (placeIds.length > 0) {
        const { data: placeRows } = await supabase.from('places').select('id, name').in('id', placeIds);
        const map: Record<string, string> = {};
        (placeRows || []).forEach((p) => {
          map[p.id] = p.name;
        });
        setPlaceNames(map);
      }

      if (completedIds.length > 0) {
        const { data: fbRows } = await supabase
          .from('helper_feedback')
          .select('*')
          .in('assistance_request_id', completedIds);
        const map: Record<string, HelperFeedback> = {};
        (fbRows || []).forEach((f) => {
          map[f.assistance_request_id] = f as HelperFeedback;
        });
        setFeedbackByRequest(map);
      }

      setLoading(false);
    }
    load();
  }, [user]);

  const sorted = useMemo(() => requests, [requests]);

  async function cancelRequest(id: string) {
    setBusyId(id);
    setActionError(null);
    const { error: err } = await supabase
      .from('assistance_requests')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id);
    if (err) {
      setActionError('Could not cancel this request. Please try again.');
      setBusyId(null);
      return;
    }
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)));
    setBusyId(null);
  }

  function handleFeedbackSubmitted(request: AssistanceRequest, fb: HelperFeedback) {
    setFeedbackByRequest((prev) => ({ ...prev, [request.id]: fb }));
    setFeedbackModalFor(null);
  }

  if (!user) {
    return (
      <div className="card py-12 text-center">
        <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm text-slate-500">Sign in to view your assistance requests.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-slate-400">Loading your requests…</p>
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

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-6 text-white sm:p-8">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">My Requests</h1>
          <p className="mt-2 max-w-lg text-sm text-cyan-50 sm:text-base">
            Track the assistance you've requested, see status updates from your helper, and leave feedback
            once assistance is complete.
          </p>
        </div>
      </div>

      {actionError && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3.5 ring-1 ring-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-600">{actionError}</p>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="card py-14 text-center">
          <HandHeart className="mx-auto h-9 w-9 text-slate-300" />
          <h2 className="mt-4 font-display text-lg font-bold text-slate-900">No requests yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            Browse the Helpers directory and request assistance from someone whose skills match what you need.
          </p>
          <button onClick={onBrowseHelpers} className="btn-primary mt-6">
            Find a Helper
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((r) => {
            const helper = helpers[r.helper_id];
            const existingFeedback = feedbackByRequest[r.id];
            const isBusy = busyId === r.id;
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
                    <p className="mt-1 text-sm text-slate-500">
                      Helper: <span className="font-medium text-slate-700">{helper?.name || 'Assigned helper'}</span>
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

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {(r.status === 'pending' || r.status === 'accepted') && (
                      <button
                        onClick={() => cancelRequest(r.id)}
                        disabled={isBusy}
                        className="btn-secondary !py-2 !px-3.5 text-xs"
                      >
                        {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                        Cancel
                      </button>
                    )}
                    {r.status === 'completed' && !existingFeedback && (
                      <button
                        onClick={() => setFeedbackModalFor(r)}
                        className="btn-primary !py-2 !px-3.5 text-xs"
                      >
                        <Star className="h-3.5 w-3.5" />
                        Leave Feedback
                      </button>
                    )}
                  </div>
                </div>

                {existingFeedback && (
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-3.5 w-3.5 ${n <= existingFeedback.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
                        />
                      ))}
                      <span className="ml-1 text-xs font-medium text-slate-500">Your feedback</span>
                    </div>
                    {existingFeedback.comment && (
                      <p className="mt-1.5 text-sm text-slate-600">{existingFeedback.comment}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {feedbackModalFor && (
        <FeedbackModal
          request={feedbackModalFor}
          helperName={helpers[feedbackModalFor.helper_id]?.name || 'your helper'}
          onClose={() => setFeedbackModalFor(null)}
          onSubmitted={(fb) => handleFeedbackSubmitted(feedbackModalFor, fb)}
        />
      )}
    </div>
  );
}

function FeedbackModal({
  request,
  helperName,
  onClose,
  onSubmitted,
}: {
  request: AssistanceRequest;
  helperName: string;
  onClose: () => void;
  onSubmitted: (fb: HelperFeedback) => void;
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!user) return;
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload = {
      assistance_request_id: request.id,
      helper_id: request.helper_id,
      requester_id: user.id,
      rating,
      comment: comment.trim() || null,
    };
    const { data, error: err } = await supabase.from('helper_feedback').insert(payload).select('*').maybeSingle();
    if (err) {
      setError(
        err.message.includes('duplicate')
          ? 'You have already left feedback for this request.'
          : 'Unable to submit feedback. Please try again.',
      );
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    if (data) onSubmitted(data as HelperFeedback);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900">Rate your assistance</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500">How was your experience with {helperName}?</p>

        <div className="mt-5 flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="rounded-lg p-1 transition-transform hover:scale-110 active:scale-95"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Comment (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="Share how the assistance went..."
          />
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 ring-1 ring-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={submitting} className="btn-primary mt-5 w-full">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Feedback
            </>
          )}
        </button>
      </div>
    </div>
  );
}
