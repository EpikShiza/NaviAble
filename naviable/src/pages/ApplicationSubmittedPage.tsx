import { Navigation2, CheckCircle2, ArrowRight, Clock } from 'lucide-react';

interface Props {
  onContinue: () => void;
}

export default function ApplicationSubmittedPage({ onContinue }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white">
            <Navigation2 className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl font-extrabold text-slate-900">NaviAble</h1>
        </div>

        <div className="w-full rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/60">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
            <CheckCircle2 className="h-9 w-9 text-teal-600" />
          </div>

          <h2 className="mt-5 font-display text-2xl font-extrabold text-slate-900">Application Submitted!</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Thank you for applying to become a helper on NaviAble. Your Helper Dashboard is ready to use —
            you can start receiving and responding to assistance requests right away.
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/60">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600">
              <Clock className="h-4 w-4 text-teal-500" />
              Verification review typically takes 3-5 business days
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Our team will still verify your references and background check details — your verified badge
              will appear once that review is complete.
            </p>
          </div>

          <button
            onClick={onContinue}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow-md active:scale-[0.98]"
          >
            Go to Helper Dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          You can update your application anytime from your Helper Dashboard.
        </p>
      </div>
    </div>
  );
}
