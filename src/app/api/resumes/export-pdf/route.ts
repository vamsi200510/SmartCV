import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import puppeteer from 'puppeteer';

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

    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('id');

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // Fetch the resume to verify ownership and retrieve the title
    const { data: resume, error } = await supabaseAdmin
      .from('resumes')
      .select('title, template_id, resume_data')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !resume) {
      return NextResponse.json({ error: 'Resume draft not found or access denied' }, { status: 404 });
    }

    // Clean title for filename (replace whitespace with underscores, strip non-alphanumeric chars)
    const cleanTitle = (resume.title || 'Resume')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '');

    // Resolve host address from incoming request headers
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.nextUrl.protocol || 'http:';
    
    // Check if running on localhost or similar, fall back safely
    const targetUrl = `${protocol}//${host}/builder/print-viewport?resumeId=${resumeId}`;

    console.log(`[EXPORT-PDF] Launching browser for URL: ${targetUrl}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set auth cookies for the headless browser session
    const allCookies = cookieStore.getAll();
    const domain = host.split(':')[0];
    for (const c of allCookies) {
      await page.setCookie({
        name: c.name,
        value: c.value,
        domain: domain,
        path: '/',
      });
    }

    // Load print viewport page
    await page.goto(targetUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Generate PDF from page
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    });

    await browser.close();

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Resume_${cleanTitle}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error('[EXPORT-PDF] API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate PDF. Internal server error.' },
      { status: 500 }
    );
  }
}
