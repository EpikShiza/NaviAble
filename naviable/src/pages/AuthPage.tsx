import { useState } from 'react';
import { Navigation2, Mail, Lock, ArrowLeft, User, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LanguageSelector from '@/components/LanguageSelector';
import type { UserRole } from '@/types';

interface Props {
  role: UserRole;
  onBack: () => void;
}

export default function AuthPage({ role, onBack }: Props) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTraveler = role === 'traveler';
  const accentColor = isTraveler ? 'blue' : 'teal';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      const { error: err } = await signUp(email.trim(), password, role, fullName.trim());
      if (err) setError(err);
    } else {
      const { error: err } = await signIn(email.trim(), password);
      if (err) setError(err);
    }
    setLoading(false);
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isTraveler ? 'from-blue-50 via-sky-50 to-cyan-50' : 'from-teal-50 via-emerald-50 to-cyan-50'}`}>
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        {/* Back link + language */}
        <div className="mb-6 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-600">
            <ArrowLeft className="h-4 w-4" />
            Choose a different role
          </button>
          <LanguageSelector compact />
        </div>

        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg ${isTraveler ? 'bg-blue-600 shadow-blue-200' : 'bg-teal-600 shadow-teal-200'}`}>
            <Navigation2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-xl font-extrabold text-slate-900 leading-none">NaviAble</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">{isTraveler ? 'Traveler Portal' : 'Helper Portal'}</p>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h2 className="font-display text-2xl font-extrabold text-slate-900">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            {mode === 'signin'
              ? isTraveler
                ? 'Sign in to access your travel tools and saved routes.'
                : 'Sign in to manage your helper profile and applications.'
              : isTraveler
                ? 'Join NaviAble to find accessible places and connect with helpers.'
                : 'Create an account to start your helper application.'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="input-field pl-12"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field pl-12"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                className="input-field pl-12 pr-12"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3.5 ring-1 ring-red-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 ${isTraveler ? 'bg-blue-600 hover:bg-blue-700' : 'bg-teal-600 hover:bg-teal-700'}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : mode === 'signin' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          {isTraveler
            ? 'Your personal information is only shared with helpers when you choose to.'
            : 'Helper applications are reviewed before profiles go live. We verify skills and conduct.'}
        </p>
      </div>
    </div>
  );
}
