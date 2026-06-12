import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { email, otp_code } = await request.json();

    if (!email || !otp_code) {
      return NextResponse.json(
        { error: 'Email and verification code are required.' },
        { status: 400 }
      );
    }

    // 1. Find the active verification record
    const { data: verification, error: findError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp_code)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid verification code.' },
        { status: 400 }
      );
    }

    // 2. Check 10-minute expiration limit
    const expiresAt = new Date(verification.expires_at);
    const now = new Date();
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // 3. Update verification status
    const { error: updateError } = await supabaseAdmin
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', verification.id);

    if (updateError) {
      throw updateError;
    }

    // 4. Verify user existence in user_profiles
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    let exists = !!profile;
    if (!exists) {
      // Fallback search in auth.users
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (!listError && users) {
        exists = users.some(u => u.email?.toLowerCase() === email.toLowerCase());
      }
    }

    return NextResponse.json({
      success: true,
      exists,
      verificationToken: verification.id, // Secure transaction token
      message: 'Email verified successfully.'
    });
  } catch (err: any) {
    console.error('Error in verify-otp API:', err);
    return NextResponse.json(
      { error: err.message || 'An error occurred during verification.' },
      { status: 500 }
    );
  }
}
