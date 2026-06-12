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
        { error: 'Invalid or expired password reset session. Please verify email first.' },
        { status: 400 }
      );
    }

    // 2. Locate the user
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      throw listError;
    }

    const targetUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!targetUser) {
      return NextResponse.json(
        { error: 'No user account exists for this email address.' },
        { status: 404 }
      );
    }

    // 3. Update password using the Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      { password }
    );

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Failed to reset password.' },
        { status: 400 }
      );
    }

    // 4. Delete the token
    await supabaseAdmin
      .from('otp_verifications')
      .delete()
      .eq('id', verificationToken);

    return NextResponse.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (err: any) {
    console.error('Error in reset-password API:', err);
    return NextResponse.json(
      { error: err.message || 'An error occurred while resetting password.' },
      { status: 500 }
    );
  }
}
