import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Query user_profiles using supabaseAdmin to bypass public select RLS restrictions
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('[AUTH-CHECK-EMAIL] Error checking email existence:', error);
      throw error;
    }

    return NextResponse.json({ exists: !!data });
  } catch (err: any) {
    console.error('[AUTH-CHECK-EMAIL] Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
