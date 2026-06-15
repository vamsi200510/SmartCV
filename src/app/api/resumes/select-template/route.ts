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

    const body = await request.json();
    const { resumeId, templateId } = body;

    if (!resumeId || !templateId) {
      return NextResponse.json({ error: 'resumeId and templateId are required' }, { status: 400 });
    }

    const { data: resume, error } = await supabaseAdmin
      .from('resumes')
      .update({
        template_id: templateId,
        template_version: '1.0.0',
        updated_at: new Date().toISOString()
      })
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[API-SELECT-TEMPLATE] Database error selecting template:', error);
      if (
        error.code === '42P01' ||
        error.code === 'PGRST204' ||
        error.message?.includes('relation "public.resumes" does not exist') ||
        (error.message?.includes('Could not find') && error.message?.includes('schema cache'))
      ) {
        return NextResponse.json({
          error: `Database table public.resumes schema mismatch. Raw message: ${error.message}`,
          migrationRequired: true
        }, { status: 500 });
      }
      throw error;
    }

    return NextResponse.json(resume);
  } catch (err: any) {
    console.error('Error selecting template:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to select template.' },
      { status: 500 }
    );
  }
}
