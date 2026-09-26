import { useState } from 'react';
import { Star, Check, Loader2, ArrowRight, MessageSquare, ThumbsUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Place } from '@/types';

interface Props {
  place: Place;
  onDone: () => void;
  onSkip: () => void;
}

const FEEDBACK_TAGS = [
  'Easy to navigate',
  'Accurate information',
  'Accessible route',
  'Helpful information',
  'Difficult to follow',
  'Information was inaccurate',
  'Could be improved',
];

const ACCESSIBILITY_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'partially', label: 'Partially' },
  { value: 'no', label: 'No' },
  { value: 'not_sure', label: 'Not sure' },
];

export default function FeedbackPage({ place, onDone, onSkip }: Props) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [writtenFeedback, setWrittenFeedback] = useState('');
  const [accessibilityAccurate, setAccessibilityAccurate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit() {
    if (rating === 0) {
      setError('Please select a star rating before submitting.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const payload = {
      user_id: user?.id || null,
      place_id: place.id,
      rating,
      tags: selectedTags,
      written_feedback: writtenFeedback.trim() || null,
      accessibility_accurate: accessibilityAccurate,
    };

    const { error: err } = await supabase.from('feedback').insert(payload);
    if (err) {
      setError(err.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <div className="animate-fade-in-up rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/60">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-9 w-9 text-emerald-600" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-extrabold text-slate-900">
            Thank you for helping make NaviAble better.
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Your feedback helps others navigate with confidence.
          </p>
          <button onClick={onDone} className="btn-primary mt-6 w-full">
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <MessageSquare className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-slate-900">Journey completed</h1>
        <p className="mt-2 text-sm text-slate-500">How was your experience with NaviAble?</p>
        <p className="mt-1 text-xs font-medium text-slate-400">{place.name}</p>
      </div>

      {/* Rating */}
      <div className="card">
        <label className="mb-3 block text-sm font-semibold text-slate-700">Rate your experience</label>
        <div className="flex items-center justify-center gap-2">
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
                  star <= (hoverRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-100 text-slate-200'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="mt-2 text-center text-xs font-medium text-slate-400">
            {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating]}
          </p>
        )}
      </div>

      {/* Feedback tags */}
      <div className="card">
        <label className="mb-3 block text-sm font-semibold text-slate-700">Quick feedback</label>
        <p className="mb-3 text-xs text-slate-400">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`badge transition-all ${
                selectedTags.includes(tag)
                  ? 'bg-blue-600 text-white ring-1 ring-blue-600'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-blue-300'
              }`}
            >
              {selectedTags.includes(tag) && <Check className="h-3 w-3" />}
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Accessibility accuracy */}
      <div className="card">
        <label className="mb-3 block text-sm font-semibold text-slate-700">
          Was the accessibility information accurate?
        </label>
        <div className="flex flex-wrap gap-2">
          {ACCESSIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAccessibilityAccurate(opt.value)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                accessibilityAccurate === opt.value
                  ? 'bg-blue-600 text-white ring-1 ring-blue-600'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-blue-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Written feedback */}
      <div className="card">
        <label className="mb-3 block text-sm font-semibold text-slate-700">Tell us about your experience</label>
        <textarea
          value={writtenFeedback}
          onChange={(e) => setWrittenFeedback(e.target.value)}
          rows={4}
          className="input-field resize-none"
          placeholder="Optional — share details that could help other travelers..."
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3.5 ring-1 ring-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button onClick={onSkip} className="btn-secondary">
          Skip for now
        </button>
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <ThumbsUp className="h-4 w-4" />
              Submit Feedback
            </>
          )}
        </button>
      </div>
    </div>
  );
}
