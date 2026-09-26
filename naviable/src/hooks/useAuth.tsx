import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { ApplicationStatus, Profile, UserRole } from '@/types';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  applicationStatus: ApplicationStatus | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string, role: UserRole, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshApplicationStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthProvider(): AuthContextValue {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    applicationStatus: null,
    loading: true,
  });

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.warn('Profile load error:', error.message);
      return null;
    }
    return data as Profile | null;
  }, []);

  const loadApplicationStatus = useCallback(async (userId: string): Promise<ApplicationStatus | null> => {
    const { data, error } = await supabase
      .from('helper_applications')
      .select('status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .maybeSingle();
    if (error) {
      console.warn('Application status load error:', error.message);
      return null;
    }
    return (data?.status as ApplicationStatus | undefined) ?? null;
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session) {
        (async () => {
          const profile = await loadProfile(session.user.id);
          const applicationStatus =
            profile?.role === 'employee' ? await loadApplicationStatus(session.user.id) : null;
          if (!mounted) return;
          setState({ session, user: session.user, profile, applicationStatus, loading: false });
        })();
      } else {
        setState({ session: null, user: null, profile: null, applicationStatus: null, loading: false });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setState({ session: null, user: null, profile: null, applicationStatus: null, loading: false });
        return;
      }
      (async () => {
        const profile = await loadProfile(session.user.id);
        const applicationStatus =
          profile?.role === 'employee' ? await loadApplicationStatus(session.user.id) : null;
        if (!mounted) return;
        setState({ session, user: session.user, profile, applicationStatus, loading: false });
      })();
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadProfile, loadApplicationStatus]);

  const signUp = useCallback(
    async (email: string, password: string, role: UserRole, fullName: string): Promise<{ error: string | null }> => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
      if (!data.user) return { error: 'Sign-up failed. Please try again.' };

      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        role,
        full_name: fullName,
      });
      if (profileError) {
        return { error: `Account created, but profile setup failed: ${profileError.message}` };
      }

      if (role === 'employee') {
        // Provision a helpers-directory row right away so this account can
        // start receiving assistance requests as soon as they apply. It is
        // filled in with real details when the application is submitted.
        const { error: helperError } = await supabase.from('helpers').insert({
          profile_id: data.user.id,
          name: fullName,
          bio: '',
          skills: [],
          languages: [],
          verification_status: 'unverified',
          rating: 0,
          review_count: 0,
        });
        if (helperError) {
          console.warn('Helper profile provisioning failed:', helperError.message);
        }
      }

      return { error: null };
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ session: null, user: null, profile: null, applicationStatus: null, loading: false });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const profile = await loadProfile(state.user.id);
    setState((prev) => ({ ...prev, profile }));
  }, [state.user, loadProfile]);

  const refreshApplicationStatus = useCallback(async () => {
    if (!state.user) return;
    const applicationStatus = await loadApplicationStatus(state.user.id);
    setState((prev) => ({ ...prev, applicationStatus }));
  }, [state.user, loadApplicationStatus]);

  return { ...state, signUp, signIn, signOut, refreshProfile, refreshApplicationStatus };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
