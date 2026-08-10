'use client';

import { useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';

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

  return <LoadingScreen message="Completing Authentication Handshake..." />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading Verification Callback..." />}>
      <CallbackContent />
    </Suspense>
  );
}
