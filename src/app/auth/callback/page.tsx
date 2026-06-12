'use client';

import { useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }

        // Verify active session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Check onboarding status
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile && profile.onboarding_completed) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        } else {
          router.push('/auth');
        }
      } catch (err) {
        console.error('Error handling auth callback:', err);
        router.push('/auth');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
      <div className="text-center">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-teal-500/20 animate-bounce mx-auto mb-6">
          S
        </div>
        <div className="h-1.5 w-32 bg-slate-800 rounded-full mx-auto relative overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full animate-pulse absolute left-0 top-0 w-full" />
        </div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-4">Completing Handshake Callback</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-white animate-bounce mx-auto mb-6" />
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Loading Verification Callback...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
