import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { email, password, verificationToken } = await request.json();

    if (!email || !password || !verificationToken) {
      return NextResponse.json(
        { error: 'Email, password, and verification token are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // 1. Verify the secure verification transaction token
    const { data: verification, error: tokenError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('id', verificationToken)
      .eq('email', email)
      .eq('verified', true)
      .maybeSingle();

    if (tokenError || !verification) {
      return NextResponse.json(
        { error: 'Invalid or unverified registration session. Please restart email verification.' },
        { status: 400 }
      );
    }

    // 2. Create the user using the admin client (pre-confirmed email)
    const { data: authUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createUserError) {
      return NextResponse.json(
        { error: createUserError.message || 'Registration failed.' },
        { status: 400 }
      );
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: 'Failed to instantiate user account.' },
        { status: 500 }
      );
    }

    // 3. Insert user_profiles record
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authUser.user.id,
        user_id: authUser.user.id,
        email: email,
        full_name: email.split('@')[0],
        onboarding_completed: false,
      });

    if (profileError) {
      console.error('Warning: Failed to insert user profile record:', profileError.message);
    }

    // 4. Delete the OTP verification row to prevent token replay attacks
    await supabaseAdmin
      .from('otp_verifications')
      .delete()
      .eq('id', verificationToken);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. You can now login with your password.'
    });
  } catch (err: any) {
    console.error('Error in register-user API:', err);
    return NextResponse.json(
      { error: err.message || 'An error occurred during registration.' },
      { status: 500 }
    );
  }
}
