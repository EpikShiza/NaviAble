import { useEffect, useState } from 'react';
import {
  ShieldQuestion,
  Accessibility,
  Lock,
  DoorOpen,
  HandHeart,
  ChevronRight,
  ChevronLeft,
  Check,
  Clock,
  Loader2,
  GraduationCap,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Lesson } from '@/types';

const CATEGORY_ICONS: Record<string, typeof Accessibility> = {
  consent: ShieldQuestion,
  basics: Accessibility,
  safety: Lock,
  technique: DoorOpen,
};

const CATEGORY_LABELS: Record<string, string> = {
  consent: 'Consent & Respect',
  basics: 'Wheelchair Basics',
  safety: 'Safety',
  technique: 'Technique',
};

const CATEGORY_COLORS: Record<string, string> = {
  consent: 'from-rose-500 to-pink-600',
  basics: 'from-blue-500 to-cyan-600',
  safety: 'from-amber-500 to-orange-600',
  technique: 'from-teal-500 to-emerald-600',
};

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('lessons')
        .select('*')
        .order('order_index');
      if (err) {
        setError('Unable to load lessons.');
      } else {
        setLessons(data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  function markComplete(id: string) {
    setCompletedLessons((prev) => new Set(prev).add(id));
  }

  function nextLesson() {
    if (!activeLesson) return;
    const idx = lessons.findIndex((l) => l.id === activeLesson.id);
    if (idx < lessons.length - 1) {
      setActiveLesson(lessons[idx + 1]);
    }
  }

  function prevLesson() {
    if (!activeLesson) return;
    const idx = lessons.findIndex((l) => l.id === activeLesson.id);
    if (idx > 0) {
      setActiveLesson(lessons[idx - 1]);
    }
  }

  const progress = lessons.length > 0 ? Math.round((completedLessons.size / lessons.length) * 100) : 0;

  if (activeLesson) {
    const CatIcon = CATEGORY_ICONS[activeLesson.category] || Accessibility;
    const colorClass = CATEGORY_COLORS[activeLesson.category] || 'from-blue-500 to-cyan-600';
    const idx = lessons.findIndex((l) => l.id === activeLesson.id);
    const isComplete = completedLessons.has(activeLesson.id);

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <button onClick={() => setActiveLesson(null)} className="btn-ghost -ml-3">
          <ChevronLeft className="h-4 w-4" />
          All Lessons
        </button>

        {/* Lesson header */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClass} p-6 text-white sm:p-8`}>
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                <CatIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-white/70">
                  Lesson {idx + 1} of {lessons.length} • {CATEGORY_LABELS[activeLesson.category]}
                </p>
                <h1 className="font-display text-xl font-extrabold sm:text-2xl">{activeLesson.title}</h1>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {activeLesson.duration_minutes} min read
              </span>
              {isComplete && (
                <span className="flex items-center gap-1 text-emerald-200">
                  <Check className="h-4 w-4" />
                  Completed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card">
          <p className="text-sm font-semibold text-slate-700">Quick Summary</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{activeLesson.summary}</p>
        </div>

        {/* Content */}
        <div className="card space-y-4">
          <div className="prose-sm max-w-none">
            {activeLesson.content.split('\n').map((line, i) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={i} className="h-2" />;
              if (trimmed.startsWith('- ')) {
                return (
                  <div key={i} className="flex items-start gap-2 py-0.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    <p className="text-sm leading-relaxed text-slate-600">{trimmed.slice(2)}</p>
                  </div>
                );
              }
              return (
                <p key={i} className="text-sm leading-relaxed text-slate-600">
                  {trimmed}
                </p>
              );
            })}
          </div>
        </div>

        {/* Key points */}
        <div className="rounded-2xl bg-blue-50 p-5 ring-1 ring-blue-100">
          <h3 className="flex items-center gap-2 text-sm font-bold text-blue-800">
            <Check className="h-4 w-4" />
            Key Takeaways
          </h3>
          <ul className="mt-3 space-y-2">
            {activeLesson.key_points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-700">
                  {i + 1}
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Important note */}
        <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
            <p className="text-xs leading-relaxed text-amber-800">
              Wheelchair designs and safe procedures differ between models and manufacturers. These
              lessons provide general guidance — always follow the specific instructions of the person you
              are assisting and their equipment manufacturer.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={prevLesson}
            disabled={idx === 0}
            className="btn-secondary disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          {isComplete ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <Check className="h-4 w-4" />
              Completed
            </span>
          ) : (
            <button onClick={() => markComplete(activeLesson.id)} className="btn-primary">
              <Check className="h-4 w-4" />
              Mark Complete
            </button>
          )}
          <button
            onClick={nextLesson}
            disabled={idx === lessons.length - 1}
            className="btn-secondary disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 p-6 text-white sm:p-8">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Wheelchair Assistance Lessons</h1>
              <p className="mt-1 text-sm text-blue-200">
                Practical, consent-first guidance for helpers
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
            Short lessons covering how to ask before assisting, engage brakes safely, push a wheelchair,
            and more. Every lesson emphasizes consent and respect — the person in the wheelchair is the
            expert on their own needs.
          </p>

          {/* Progress */}
          {lessons.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-blue-200">
                <span>Your progress</span>
                <span>{completedLessons.size}/{lessons.length} completed</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-blue-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lessons list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, i) => {
            const CatIcon = CATEGORY_ICONS[lesson.category] || Accessibility;
            const colorClass = CATEGORY_COLORS[lesson.category] || 'from-blue-500 to-cyan-600';
            const isComplete = completedLessons.has(lesson.id);

            return (
              <button
                key={lesson.id}
                onClick={() => setActiveLesson(lesson)}
                className="card group animate-fade-in-up flex w-full items-center gap-4 text-left transition-all hover:shadow-md hover:ring-slate-300/60"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colorClass} text-white`}
                >
                  {isComplete ? <Check className="h-6 w-6" /> : <CatIcon className="h-6 w-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      {CATEGORY_LABELS[lesson.category]}
                    </p>
                    {isComplete && (
                      <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-[10px]">
                        Done
                      </span>
                    )}
                  </div>
                  <h3 className="mt-0.5 font-display text-base font-bold text-slate-900 group-hover:text-blue-700">
                    {lesson.title}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-sm text-slate-500">{lesson.summary}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    {lesson.duration_minutes} min
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
              </button>
            );
          })}
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
        <div className="flex gap-3">
          <Info className="h-5 w-5 shrink-0 text-slate-400" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-700">Why helper knowledge matters</p>
            <p className="text-xs leading-relaxed text-slate-500">
              Safe wheelchair assistance requires real knowledge — of the equipment, of consent, and of the
              persons preferences. These lessons build that foundation. They do not replace hands-on
              training or the guidance of the person you are assisting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
