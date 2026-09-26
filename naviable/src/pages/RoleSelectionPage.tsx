import { Navigation2, Accessibility, HandHeart, ArrowRight, ShieldCheck, MapPinned } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import type { UserRole } from '@/types';

interface Props {
  onSelectRole: (role: UserRole) => void;
  onContinueAsGuest: () => void;
}

export default function RoleSelectionPage({ onSelectRole, onContinueAsGuest }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-10">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Navigation2 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 leading-none">NaviAble</h1>
            <p className="text-xs text-slate-400 mt-0.5">Navigate with confidence</p>
          </div>
        </div>

        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Welcome. How would you like to join?
          </h2>
          <p className="mt-3 max-w-xl text-sm text-slate-500 sm:text-base">
            Choose how you want to use NaviAble. You can always switch later, or continue as a guest
            to browse without an account.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid w-full gap-5 sm:grid-cols-2">
          {/* Traveler */}
          <button
            onClick={() => onSelectRole('traveler')}
            className="group relative overflow-hidden rounded-2xl bg-white p-7 text-left shadow-sm ring-1 ring-slate-200/60 transition-all hover:shadow-xl hover:ring-blue-300"
>
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-50 blur-2xl transition-opacity group-hover:opacity-80" />
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md">
                <Accessibility className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-slate-900">I'm a Traveler</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Find accessible places to go, plan game-like route quests, connect with trained helpers,
                and learn about wheelchair assistance — all tailored to your accessibility needs.
              </p>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-blue-600 transition-transform group-hover:gap-3">
                Sign in or create account
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </button>

          {/* Employee / Helper */}
          <button
            onClick={() => onSelectRole('employee')}
            className="group relative overflow-hidden rounded-2xl bg-white p-7 text-left shadow-sm ring-1 ring-slate-200/60 transition-all hover:shadow-xl hover:ring-teal-300"
>
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-teal-50 blur-2xl transition-opacity group-hover:opacity-80" />
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-md">
                <HandHeart className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-slate-900">I'm a Helper / Employee</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Offer your assistance to travelers who need it. Complete an application with your skills,
                experience, certifications, and availability — similar to applying for a job.
              </p>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-teal-600 transition-transform group-hover:gap-3">
                Apply to become a helper
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </button>
        </div>

        {/* Feature highlights */}
        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/60 p-4 ring-1 ring-slate-200/50">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
            <p className="text-xs text-slate-500">Verified helper profiles with background checks</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/60 p-4 ring-1 ring-slate-200/50">
            <MapPinned className="h-5 w-5 shrink-0 text-blue-500" />
            <p className="text-xs text-slate-500">Game-like route quests with waypoints and progress</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/60 p-4 ring-1 ring-slate-200/50">
            <HandHeart className="h-5 w-5 shrink-0 text-pink-500" />
            <p className="text-xs text-slate-500">Consent-first wheelchair assistance training</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="mt-6 flex justify-center">
          <LanguageSelector />
        </div>

        {/* Continue as guest */}
        <button
          onClick={onContinueAsGuest}
          className="mt-8 text-sm font-medium text-slate-400 underline underline-offset-4 transition-colors hover:text-slate-600"
>
          Continue as guest — browse without an account
        </button>
      </div>
    </div>
  );
}
