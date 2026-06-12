'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/database.types';
import { useRouter, usePathname } from 'next/navigation';

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

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile');
      if (!res.ok) {
        throw new Error('Failed to fetch profile from API');
      }
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const prof = await fetchProfile();
      setProfile(prof);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setUser(session.user);
          const prof = await fetchProfile();
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

      if (session?.user) {
        setUser(session.user);
        const prof = await fetchProfile();
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
      subscription.unsubscribe();
    };
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

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
    router.push('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refreshProfile }}>
      {loading ? (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
          <div className="text-center">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-teal-500/20 animate-bounce mx-auto mb-6">
              S
            </div>
            <div className="h-1.5 w-32 bg-slate-800 rounded-full mx-auto relative overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full animate-pulse absolute left-0 top-0 w-full" />
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-4">Initializing SmartCV Console</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
