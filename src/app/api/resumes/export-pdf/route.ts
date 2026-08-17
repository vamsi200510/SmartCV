import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Helper to acquire a browser instance
 * - Production on Vercel (Linux Serverless): Uses `puppeteer-core` with `@sparticuz/chromium-min`
 * - Local / Development: Uses standard `puppeteer`
 */
async function launchBrowser() {
  const isVercel = !!process.env.VERCEL || !!process.env.VERCEL_ENV;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isVercel || (isProduction && process.platform === 'linux')) {
    const puppeteerCore = await import('puppeteer-core');
    const chromium = (await import('@sparticuz/chromium-min')).default;

    // Optional: Configure font or graphics support if needed
    const executablePath = await chromium.executablePath(
      'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
    );

    return await puppeteerCore.launch({
      args: [...chromium.args, '--hide-scrollbars', '--disable-web-security', '--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1200, height: 1600, deviceScaleFactor: 2 },
      executablePath,
      headless: true,
    });
  } else {
    const puppeteer = await import('puppeteer');
    return await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      defaultViewport: { width: 1200, height: 1600, deviceScaleFactor: 2 },
    });
  }
}

export async function GET(request: NextRequest) {
  let browser: any = null;

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
    const protocol = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol || 'https:';
    const targetUrl = `${protocol.replace(/:$/, '')}://${host}/builder/print-viewport?resumeId=${resumeId}`;

    console.time('[EXPORT-PDF] Generation time');
    console.log(`[EXPORT-PDF] Launching browser for URL: ${targetUrl}`);

    browser = await launchBrowser();
    const page = await browser.newPage();

    // Set auth cookies for the headless browser session
    const allCookies = cookieStore.getAll();
    const domain = host.split(':')[0];
    const cookiesToSet = allCookies.map(c => ({
      name: c.name,
      value: c.value,
      domain: domain,
      path: '/',
    }));
    if (cookiesToSet.length > 0) {
      await page.setCookie(...cookiesToSet);
    }

    // Load print viewport page
    await page.goto(targetUrl, {
      waitUntil: 'networkidle0',
      timeout: 45000,
    });

    // Wait an additional moment for all fonts and CSS to stabilize
    await new Promise((r) => setTimeout(r, 400));

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

    console.timeEnd('[EXPORT-PDF] Generation time');

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Resume_${cleanTitle}.pdf"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('[EXPORT-PDF] API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate PDF. Internal server error.' },
      { status: 500 }
    );
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error('[EXPORT-PDF] Error closing browser:', closeErr);
      }
    }
  }
}
