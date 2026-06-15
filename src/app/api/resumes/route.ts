import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const RESUMES_MIGRATION_SQL = `DROP TABLE IF EXISTS public.resumes CASCADE;

CREATE TABLE public.resumes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  role text NOT NULL,
  template_id text,
  template_version text DEFAULT '1.0.0'::text NOT NULL,
  status text DEFAULT 'draft'::text NOT NULL,
  resume_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view own resumes" ON public.resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON public.resumes FOR DELETE USING (auth.uid() = user_id);`;

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

    // Check if query parameter "id" is provided to fetch a single resume
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('id');

    if (resumeId) {
      const { data: resume, error } = await supabaseAdmin
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!resume) {
        return NextResponse.json({ error: 'Resume draft not found' }, { status: 404 });
      }

      return NextResponse.json(resume);
    }

    // Default: Fetch all resumes of the user
    const { data: resumes, error } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[API-GET] Database error fetching resumes:', error);
      if (
        error.code === '42P01' ||
        error.code === 'PGRST204' ||
        error.message?.includes('relation "public.resumes" does not exist') ||
        (error.message?.includes('Could not find') && error.message?.includes('schema cache'))
      ) {
        return NextResponse.json({
          error: `Database table public.resumes schema mismatch. Raw message: ${error.message}`,
          migrationRequired: true,
          sql: RESUMES_MIGRATION_SQL
        }, { status: 500 });
      }
      throw error;
    }

    return NextResponse.json(resumes || []);
  } catch (err: any) {
    console.error('Error fetching resumes:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch resumes.' },
      { status: 500 }
    );
  }
}

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
    const { category, role, title } = body;

    if (!category || !role) {
      return NextResponse.json({ error: 'Category and role are required' }, { status: 400 });
    }

    // Read the user_profile career_goal and experience_level to initialize resume summary/data
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('career_goal, experience_level, full_name')
      .eq('id', user.id)
      .maybeSingle();

    const initialSummary = profile?.career_goal 
      ? `Ambitious and goal-driven professional specializing in ${role}. Striving to utilize my background as a ${profile.experience_level || 'professional'} to achieve career success in this sector.`
      : '';

    const initialResumeData = {
      personalInfo: {
        fullName: profile?.full_name || user.user_metadata?.full_name || 'Vamsi Krishna Tadisetti',
        title: role,
        email: user.email || '',
        phone: '',
        location: '',
        website: '',
        github: '',
        linkedin: '',
        summary: initialSummary
      },
      experience: [],
      education: [],
      projects: [],
      skills: []
    };

    const { data: resume, error } = await supabaseAdmin
      .from('resumes')
      .insert({
        user_id: user.id,
        title: title || `Resume - ${role}`,
        category,
        role,
        status: 'draft',
        template_id: null,
        template_version: '1.0.0',
        resume_data: initialResumeData
      })
      .select()
      .single();

    if (error) {
      console.error('[API-POST] Database error inserting resume:', error);
      if (
        error.code === '42P01' ||
        error.code === 'PGRST204' ||
        error.message?.includes('relation "public.resumes" does not exist') ||
        (error.message?.includes('Could not find') && error.message?.includes('schema cache'))
      ) {
        return NextResponse.json({
          error: `Database table public.resumes schema mismatch. Raw message: ${error.message}`,
          migrationRequired: true,
          sql: RESUMES_MIGRATION_SQL
        }, { status: 500 });
      }
      throw error;
    }

    return NextResponse.json(resume);
  } catch (err: any) {
    console.error('Error creating resume:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create resume.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, title, resume_data, status, template_id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // Compile update fields dynamically
    const updatePayload: any = {
      updated_at: new Date().toISOString()
    };
    if (title !== undefined) updatePayload.title = title;
    if (resume_data !== undefined) updatePayload.resume_data = resume_data;
    if (status !== undefined) updatePayload.status = status;
    if (template_id !== undefined) updatePayload.template_id = template_id;

    const { data: resume, error } = await supabaseAdmin
      .from('resumes')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[API-PUT] Database error updating resume:', error);
      if (
        error.code === '42P01' ||
        error.code === 'PGRST204' ||
        error.message?.includes('relation "public.resumes" does not exist') ||
        (error.message?.includes('Could not find') && error.message?.includes('schema cache'))
      ) {
        return NextResponse.json({
          error: `Database table public.resumes schema mismatch. Raw message: ${error.message}`,
          migrationRequired: true,
          sql: RESUMES_MIGRATION_SQL
        }, { status: 500 });
      }
      throw error;
    }

    return NextResponse.json(resume);
  } catch (err: any) {
    console.error('Error updating resume:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update resume.' },
      { status: 500 }
    );
  }
}
