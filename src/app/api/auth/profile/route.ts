import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll().map((c) => ({
              name: c.name,
              value: c.value,
            }));
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query user_profiles using the admin client to bypass client-side RLS restriction
    let { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    // Auto-create user profile if it does not exist
    if (!profile) {
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        '';

      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: user.id,
          user_id: user.id,
          email: user.email,
          full_name: name,
          onboarding_completed: false,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }
      profile = newProfile;
    }

    return NextResponse.json(profile);
  } catch (err: any) {
    console.error('Error fetching user profile from API:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to resolve user profile.' },
      { status: 500 }
    );
  }
}
