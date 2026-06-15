import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import TemplateRenderer from '@/components/TemplateRenderer';

export default async function PrintViewportPage({
  searchParams
}: {
  searchParams: Promise<{ resumeId?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const resumeId = resolvedSearchParams.resumeId;

  if (!resumeId) {
    return notFound();
  }

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
    return notFound();
  }

  const { data: resume, error } = await supabaseAdmin
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !resume) {
    return notFound();
  }

  return (
    <div className="bg-white text-slate-800 min-h-screen w-full flex justify-center items-start">
      <div id="resume-preview-document" className="bg-white text-slate-800 w-full">
        <TemplateRenderer
          templateId={resume.template_id || 'ats-professional'}
          data={resume.resume_data}
          zoom={100}
        />
      </div>
    </div>
  );
}
