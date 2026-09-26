import { Navigation2, MapPinned, Users, GraduationCap, LogOut, Compass, MessageSquare, LayoutDashboard } from 'lucide-react';
import type { Profile } from '@/types';
import LanguageSelector from '@/components/LanguageSelector';

export type PageId = 'explore' | 'quest' | 'helpers' | 'lessons' | 'requests' | 'helper-dashboard';

interface Props {
  current: PageId;
  onNavigate: (page: PageId) => void;
  profile: Profile | null;
  onSignOut: () => void;
}

const TRAVELER_NAV: { id: PageId; label: string; icon: typeof Compass }[] = [
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'quest', label: 'Route Quest', icon: MapPinned },
  { id: 'helpers', label: 'Helpers', icon: Users },
  { id: 'requests', label: 'My Requests', icon: MessageSquare },
  { id: 'lessons', label: 'Lessons', icon: GraduationCap },
];

const HELPER_NAV: { id: PageId; label: string; icon: typeof Compass }[] = [
  { id: 'helper-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'lessons', label: 'Lessons', icon: GraduationCap },
];

export default function NavBar({ current, onNavigate, profile, onSignOut }: Props) {
  const initials = profile?.full_name?.charAt(0)?.toUpperCase() || '?';
  const isEmployee = profile?.role === 'employee';
  const navItems = isEmployee ? HELPER_NAV : TRAVELER_NAV;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Navigation2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-lg font-extrabold text-slate-900 leading-none">NaviAble</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Navigate with confidence</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                current === id
                  ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${current === id ? 'text-blue-600' : 'text-slate-400'}`} />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-2">
          <LanguageSelector compact />
        </div>

        {profile ? (
          <div className="border-t border-slate-100 px-4 py-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${isEmployee ? 'bg-teal-500' : 'bg-blue-500'}`}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-slate-700">{profile.full_name}</p>
                <p className="text-[11px] capitalize text-slate-400">{profile.role}</p>
              </div>
              <button
                onClick={onSignOut}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-5">
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <p className="text-xs font-semibold text-slate-700">Privacy First</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                You choose what personal information to share. Nothing is stored without your say-so.
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white px-2 py-2 lg:hidden">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-colors ${
              current === id ? 'text-blue-600' : 'text-slate-400'
            }`}
            aria-label={label}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
        {profile && (
          <button
            onClick={onSignOut}
            className="flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-slate-400 transition-colors hover:text-slate-600"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-medium">Exit</span>
          </button>
        )}
      </nav>
    </>
  );
}
