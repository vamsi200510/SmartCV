import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const sixtySecondsAgo = new Date(now.getTime() - 60 * 1000);

    // 1. Rate Limiting Check (60 seconds per email)
    const { data: recentOtps, error: checkError } = await supabaseAdmin
      .from('otp_verifications')
      .select('created_at')
      .eq('email', email)
      .gt('created_at', sixtySecondsAgo.toISOString())
      .order('created_at', { ascending: false });

    // Gracefully handle missing database table
    if (checkError) {
      if (checkError.message?.includes('does not exist') || checkError.code === '42P01') {
        return NextResponse.json(
          {
            error: 'Database table public.otp_verifications is missing.',
            sqlRequired: true,
            sql: `CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  otp_code text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false NOT NULL
);
CREATE INDEX IF NOT EXISTS otp_verifications_email_idx ON public.otp_verifications (email);`
          },
          { status: 500 }
        );
      }
      throw checkError;
    }

    if (recentOtps && recentOtps.length > 0) {
      const lastSent = new Date(recentOtps[0].created_at);
      const secondsRemaining = Math.ceil(
        60 - (now.getTime() - lastSent.getTime()) / 1000
      );
      return NextResponse.json(
        { error: `Please wait ${secondsRemaining} seconds before requesting another OTP.` },
        { status: 429 }
      );
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes limit

    // 3. Save OTP in DB
    const { error: insertError } = await supabaseAdmin
      .from('otp_verifications')
      .insert({
        email,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
        verified: false,
      });

    if (insertError) {
      console.error('[AUTH-OTP] Database insert failed:', insertError);
      throw insertError;
    }
    console.log(`[AUTH-OTP] Database insert success for ${email}`);

    // 4. Send Email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    console.log(`[AUTH-OTP] Generated OTP code for ${email}`);

    if (resendKey && resendKey !== 're_your_api_key_here' && resendKey.trim() !== '') {
      const resend = new Resend(resendKey);
      
      console.log(`[AUTH-OTP] Sending Resend email to ${email}...`);
      const { data, error } = await resend.emails.send({
        from: 'SmartCV Auth <onboarding@resend.dev>',
        to: email,
        subject: 'Your SmartCV Verification Code',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0d9488; font-weight: bold; margin-bottom: 20px;">SmartCV Verification</h2>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hello,</p>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">Your 6-digit verification code for SmartCV is:</p>
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; margin: 25px 0;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0f172a;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 12px;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `,
      });

      console.log('[AUTH-OTP] Resend Send API Response:', { data, error });

      if (error) {
        console.error('[AUTH-OTP] Resend Send Failed:', error);
        throw new Error(error.message || 'Resend failed to deliver the email.');
      }

      console.log(`[AUTH-OTP] Email sent successfully. Resend ID: ${data?.id}`);
      return NextResponse.json({ success: true, message: 'OTP sent to your email.' });
    } else {
      // Local Developer Fallback
      console.log('====================================');
      console.log(`[DEVELOPER MODE] OTP Verification Code for ${email}: ${otp}`);
      console.log('====================================');
      return NextResponse.json({
        success: true,
        devMode: true,
        message: 'Developer Mode: OTP logged to the server command line console.'
      });
    }
  } catch (err: any) {
    console.error('Error in send-otp API:', err);
    return NextResponse.json(
      { error: err.message || 'An error occurred while generating OTP.' },
      { status: 500 }
    );
  }
}
