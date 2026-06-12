import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
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

    const { department, careerGoal, experienceLevel } = await request.json();

    if (!department || !careerGoal || !experienceLevel) {
      return NextResponse.json(
        { error: 'All onboarding fields are required.' },
        { status: 400 }
      );
    }

    // Update profile using admin client to bypass client RLS policies
    const { data: profile, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        department,
        career_goal: careerGoal,
        experience_level: experienceLevel,
        onboarding_completed: true,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error('Error updating user profile in API:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update onboarding profile.' },
      { status: 500 }
    );
  }
}
