import { NextRequest, NextResponse } from 'next/server';

const TARGET_FEEDBACK_EMAIL = 'vamsi227788@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, rating, category, message, currentUrl, userAgent } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Please enter your feedback message.' },
        { status: 400 }
      );
    }

    const senderName = (name || 'Anonymous User').trim();
    const senderEmail = (email || 'no-reply@smartcv.co').trim();
    const feedbackCategory = category || 'General Feedback';
    const feedbackRating = rating ? `${rating} / 5 Stars` : 'Not Rated';
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

    // HTML Email Template for Developer
    const htmlEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
          .header { background: linear-gradient(135deg, #C2600E 0%, #9C4A08 100%); padding: 24px; color: #ffffff; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; }
          .content { padding: 24px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: #FCE3C7; color: #9C4A08; }
          .rating { font-size: 16px; font-weight: 700; color: #F59E0B; margin: 8px 0; }
          .message-box { background: #FAF6F2; border: 1px solid #E8DDD0; border-radius: 12px; padding: 18px; margin: 16px 0; font-size: 14px; line-height: 1.6; color: #241C12; white-space: pre-wrap; }
          .meta-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          .meta-table td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
          .meta-label { color: #64748b; font-weight: 600; width: 120px; }
          .meta-value { color: #0f172a; word-break: break-all; }
          .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>💬 New SmartCV User Feedback</h1>
            <p>Received on ${timestamp} (IST)</p>
          </div>
          <div class="content">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <span class="badge">${feedbackCategory}</span>
              <span class="rating">⭐ ${feedbackRating}</span>
            </div>
            
            <div class="message-box">
              ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            </div>

            <table class="meta-table">
              <tr>
                <td class="meta-label">User Name</td>
                <td class="meta-value"><strong>${senderName}</strong></td>
              </tr>
              <tr>
                <td class="meta-label">User Email</td>
                <td class="meta-value"><a href="mailto:${senderEmail}" style="color: #C2600E; text-decoration: none;">${senderEmail}</a></td>
              </tr>
              <tr>
                <td class="meta-label">Page URL</td>
                <td class="meta-value">${currentUrl || 'N/A'}</td>
              </tr>
              <tr>
                <td class="meta-label">User Agent</td>
                <td class="meta-value" style="font-size: 10.5px; color: #64748b;">${userAgent || 'N/A'}</td>
              </tr>
            </table>
          </div>
          <div class="footer">
            SmartCV Feedback Service • Automatically dispatched to Administrator
          </div>
        </div>
      </body>
      </html>
    `;

    // Strategy 1: Gmail SMTP via Nodemailer
    const gmailUser = (process.env.GMAIL_USER || process.env.SMTP_USER || '').trim();
    const gmailPass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '').trim().replace(/\s+/g, '');

    if (gmailUser && gmailPass) {
      try {
        const dns = await import('dns');
        try { dns.setDefaultResultOrder('ipv4first'); } catch { /* ignore */ }

        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          family: 4,
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
          connectionTimeout: 15000,
        } as any);

        await transporter.sendMail({
          from: `"SmartCV Feedback" <${gmailUser}>`,
          to: TARGET_FEEDBACK_EMAIL,
          replyTo: senderEmail !== 'no-reply@smartcv.co' ? senderEmail : undefined,
          subject: `[SmartCV Feedback] ${feedbackCategory} from ${senderName}`,
          html: htmlEmail,
        });

        console.log(`[FEEDBACK] Successfully delivered email to ${TARGET_FEEDBACK_EMAIL} via Gmail SMTP.`);
        return NextResponse.json({ success: true, message: 'Thank you! Your feedback has been received.' });
      } catch (smtpErr: any) {
        console.warn('[FEEDBACK] Gmail SMTP failed, attempting Resend fallback:', smtpErr?.message);
      }
    }

    // Strategy 2: Resend API fallback
    const resendKey = (process.env.RESEND_API_KEY || '').trim();
    if (resendKey) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: 'SmartCV <onboarding@resend.dev>',
          to: TARGET_FEEDBACK_EMAIL,
          subject: `[SmartCV Feedback] ${feedbackCategory} from ${senderName}`,
          html: htmlEmail,
        });
        console.log(`[FEEDBACK] Successfully delivered email to ${TARGET_FEEDBACK_EMAIL} via Resend.`);
        return NextResponse.json({ success: true, message: 'Thank you! Your feedback has been received.' });
      } catch (resendErr: any) {
        console.error('[FEEDBACK] Resend API failed:', resendErr);
      }
    }

    // If both failed or development mode
    console.log(`[FEEDBACK] Recorded feedback for ${TARGET_FEEDBACK_EMAIL}:`, { senderName, senderEmail, message });
    return NextResponse.json({ success: true, message: 'Thank you! Your feedback has been received.' });
  } catch (error: any) {
    console.error('[FEEDBACK] Error processing feedback:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit feedback. Please try again.' },
      { status: 500 }
    );
  }
}
