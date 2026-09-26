import { useState } from 'react';
import NavBar, { type PageId } from '@/components/NavBar';
import ExplorePage from '@/pages/ExplorePage';
import PlaceDetailPage from '@/pages/PlaceDetailPage';
import MapQuestPage from '@/pages/MapQuestPage';
import HelpersPage from '@/pages/HelpersPage';
import LessonsPage from '@/pages/LessonsPage';
import RoleSelectionPage from '@/pages/RoleSelectionPage';
import AuthPage from '@/pages/AuthPage';
import EmployeeApplicationPage from '@/pages/EmployeeApplicationPage';
import ApplicationSubmittedPage from '@/pages/ApplicationSubmittedPage';
import LandingPage from '@/pages/LandingPage';
import FeedbackPage from '@/pages/FeedbackPage';
import { useAuth } from '@/hooks/useAuth';
import type { Place, UserRole } from '@/types';

type View =
  | { page: 'landing' }
  | { page: 'role-select' }
  | { page: 'auth'; role: UserRole }
  | { page: 'employee-application' }
  | { page: 'application-submitted' }
  | { page: 'explore' }
  | { page: 'place-detail'; place: Place }
  | { page: 'quest'; place: Place }
  | { page: 'feedback'; place: Place }
  | { page: 'helpers' }
  | { page: 'lessons' };

export default function App() {
  const { user, profile, loading, signOut } = useAuth();
  const [navPage, setNavPage] = useState<PageId>('explore');
  const [view, setView] = useState<View>({ page: 'landing' });
  const [hasGuestBrowsed, setHasGuestBrowsed] = useState(false);

  // Route signed-in users based on role
  if (!loading && user && profile) {
    if ((view.page === 'landing' || view.page === 'role-select' || view.page === 'auth') && profile.role === 'employee') {
      setView({ page: 'employee-application' });
    } else if ((view.page === 'landing' || view.page === 'role-select' || view.page === 'auth') && profile.role === 'traveler') {
      setView({ page: 'explore' });
    }
  }

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-xl bg-blue-600" />
          <span className="font-display text-lg font-bold text-slate-400">NaviAble</span>
        </div>
      </div>
    );
  }

  // Landing page is the entry point for non-guest, non-signed-in users
  if (!user && view.page === 'landing' && !hasGuestBrowsed) {
    return (
      <LandingPage
        onGetStarted={() => setView({ page: 'role-select' })}
        onExplore={() => {
          setHasGuestBrowsed(true);
          setView({ page: 'explore' });
        }}
      />
    );
  }

  // Auth flow — not signed in
  if (!user) {
    if (view.page === 'auth') {
      return <AuthPage role={view.role} onBack={() => setView({ page: 'role-select' })} />;
    }

    // Guest browsing — show the main app
    if (hasGuestBrowsed && view.page !== 'role-select' && view.page !== 'landing') {
      return <MainApp view={view} navPage={navPage} setView={setView} setNavPage={setNavPage} profile={null} onSignOut={signOut} />;
    }

    // Role selection
    return (
      <RoleSelectionPage
        onSelectRole={(role: UserRole) => setView({ page: 'auth', role })}
        onContinueAsGuest={() => {
          setHasGuestBrowsed(true);
          setView({ page: 'explore' });
        }}
      />
    );
  }

  // Signed in — employee application flow
  if (view.page === 'employee-application') {
    return (
      <EmployeeApplicationPage
        onBack={() => setView({ page: 'explore' })}
        onComplete={() => setView({ page: 'application-submitted' })}
      />
    );
  }

  if (view.page === 'application-submitted') {
    return <ApplicationSubmittedPage onContinue={() => setView({ page: 'explore' })} />;
  }

  // Signed in — feedback page
  if (view.page === 'feedback') {
    return (
      <MainApp view={{ page: 'explore' }} navPage={navPage} setView={setView} setNavPage={setNavPage} profile={profile} onSignOut={signOut}>
        <FeedbackPage
          place={view.place}
          onDone={() => setView({ page: 'explore' })}
          onSkip={() => setView({ page: 'explore' })}
        />
      </MainApp>
    );
  }

  return <MainApp view={view} navPage={navPage} setView={setView} setNavPage={setNavPage} profile={profile} onSignOut={signOut} />;
}

interface MainAppProps {
  view: View;
  navPage: PageId;
  setView: (v: View) => void;
  setNavPage: (p: PageId) => void;
  profile: ReturnType<typeof useAuth>['profile'];
  onSignOut: () => void;
  children?: React.ReactNode;
}

function MainApp({ view, navPage, setView, setNavPage, profile, onSignOut, children }: MainAppProps) {
  function navigate(page: PageId) {
    setNavPage(page);
    if (page === 'explore') setView({ page: 'explore' });
    else if (page === 'helpers') setView({ page: 'helpers' });
    else if (page === 'lessons') setView({ page: 'lessons' });
    else if (page === 'quest') setView({ page: 'explore' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectPlace(place: Place) {
    setView({ page: 'place-detail', place });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startQuest(place: Place) {
    setView({ page: 'quest', place });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function completeQuest(place: Place) {
    setView({ page: 'feedback', place });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function backToExplore() {
    setNavPage('explore');
    setView({ page: 'explore' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const activeNav: PageId = view.page === 'quest' ? 'quest' : navPage;

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar current={activeNav} onNavigate={navigate} profile={profile} onSignOut={onSignOut} />

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8">
          {children}
          {view.page === 'explore' && <ExplorePage onSelectPlace={selectPlace} />}
          {view.page === 'place-detail' && (
            <PlaceDetailPage place={view.place} onBack={backToExplore} onStartQuest={startQuest} />
          )}
          {view.page === 'quest' && (
            <MapQuestPage place={view.place} onBack={backToExplore} onComplete={completeQuest} />
          )}
          {view.page === 'helpers' && <HelpersPage />}
          {view.page === 'lessons' && <LessonsPage />}
        </div>
      </main>
    </div>
  );
}
