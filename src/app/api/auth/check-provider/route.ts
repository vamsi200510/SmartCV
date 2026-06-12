import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Call the authorize endpoint and check the response metadata without fully following redirects
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
    });

    const status = res.status;
    const location = res.headers.get('location');

    // 1. Direct Redirect to Google Accounts implies the provider is active and enabled
    if ((status === 302 || status === 307 || status === 303) && location) {
      if (location.includes('accounts.google.com') || location.includes('google')) {
        return NextResponse.json({ enabled: true });
      }

      // If it redirects with error details in the redirection location parameters
      if (location.includes('error=')) {
        try {
          const parsedUrl = new URL(location);
          const errorParam = parsedUrl.searchParams.get('error_description') || 'Google Provider is not configured.';
          return NextResponse.json({ enabled: false, error: errorParam });
        } catch (e) {
          return NextResponse.json({ enabled: false, error: 'Google OAuth Redirect Error.' });
        }
      }
    }

    // 2. Direct JSON body error return from Supabase
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      if (json.error || json.error_description) {
        return NextResponse.json({
          enabled: false,
          error: json.error_description || json.error || 'Provider not configured.'
        });
      }
    } catch (e) {
      // Body is not JSON
    }

    // 3. Fallback to status check
    if (status >= 400) {
      return NextResponse.json({
        enabled: false,
        error: 'Google login is currently disabled on this project.'
      });
    }

    // Assume enabled if it passes checks (e.g. transparent redirects or mock setups)
    return NextResponse.json({ enabled: true });
  } catch (err: any) {
    console.error('Error verifying Google OAuth provider state:', err);
    // Safe fallback: allow redirect to let Supabase natively resolve if check fails due to timeout
    return NextResponse.json({ enabled: true });
  }
}
