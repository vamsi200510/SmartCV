'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/database.types';
import { useRouter, usePathname } from 'next/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Ref-based lock to prevent duplicate simultaneous profile fetches
  const profileFetchInFlight = useRef(false);

  const fetchProfile = useCallback(async (accessToken?: string): Promise<UserProfile | null> => {
    // Deduplicate: skip if a fetch is already in progress
    if (profileFetchInFlight.current) {
      console.log('[AuthContext] Profile fetch already in-flight, skipping duplicate');
      return null;
    }
    profileFetchInFlight.current = true;
    try {
      console.time('[AuthContext] Profile fetch');
      const headers: Record<string, string> = {};
      let token = accessToken;
      if (!token) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token;
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort('Profile fetch timeout'), 12000);
      const res = await fetch('/api/auth/profile', { headers, signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (res.status === 401) {
          return null;
        }
        console.warn(`Profile fetch returned status ${res.status}`);
        return null;
      }
      const data = await res.json();
      console.timeEnd('[AuthContext] Profile fetch');
      return data;
    } catch (err: any) {
      if (err?.name === 'AbortError' || err === 'Profile fetch timeout') {
        console.warn('[AuthContext] Profile fetch timed out or was aborted');
      } else {
        console.error('Error in fetchProfile:', err);
      }
      return null;
    } finally {
      profileFetchInFlight.current = false;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const prof = await fetchProfile();
      setProfile(prof);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    // Safety net: never show loading screen for more than 12 seconds
    const maxLoadingTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[AuthContext] Max loading duration exceeded (12s), forcing loading=false');
        setLoading(false);
      }
    }, 12000);

    const initializeAuth = async () => {
      try {
        console.time('[AuthContext] Session init');
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Session timeout')), 5000));
        const response: any = await Promise.race([sessionPromise, timeoutPromise]);
        const { data: { session } } = response;
        console.timeEnd('[AuthContext] Session init');
        if (session?.user && mounted) {
          setUser(session.user);
          const prof = await fetchProfile(session.access_token);
          if (mounted) {
            setProfile(prof);
          }
        }
      } catch (err) {
        console.error('Error in auth initialization:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Only fetch profile on meaningful auth events — skip TOKEN_REFRESHED to avoid duplicate calls
      if (event === 'TOKEN_REFRESHED') {
        console.log('[AuthContext] Token refreshed, skipping profile re-fetch');
        return;
      }

      console.log('[AuthContext] Auth state changed:', event);

      if (session?.user) {
        setUser(session.user);
        const prof = await fetchProfile(session.access_token);
        if (mounted) {
          setProfile(prof);
          setLoading(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(maxLoadingTimer);
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync route redirects based on profile completion status
  useEffect(() => {
    if (!loading && user && profile) {
      if (!profile.onboarding_completed && pathname === '/dashboard') {
        router.push('/onboarding');
      } else if (profile.onboarding_completed && pathname === '/onboarding') {
        router.push('/dashboard');
      }
    }
  }, [user, profile, loading, pathname, router]);

  const logout = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
    router.push('/auth');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refreshProfile }}>
      {loading ? (
        <LoadingScreen message="Initializing SmartCV Console..." />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

