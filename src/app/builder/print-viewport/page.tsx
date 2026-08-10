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

  if (!resumeId) return notFound();

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return notFound();

  const { data: resume, error } = await supabaseAdmin
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !resume) return notFound();

  return (
    <>
      {/*
        This page is rendered by Puppeteer for PDF generation.
        Critical rules:
        - No browser chrome (margin: 0, padding: 0)
        - Exact A4 width: 794px at 96dpi
        - No transforms, no shadows, no borders
        - id="resume-print-root" matches print CSS visibility selector
      */}
      <style>{`
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          width: 794px !important;
          overflow: visible !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @page {
          size: A4 portrait;
          margin: 0;
        }
      `}</style>
      <div
        id="resume-print-root"
        style={{
          width: '794px',
          minHeight: '1123px',
          background: '#ffffff',
          margin: '0',
          padding: '0',
          overflow: 'visible',
        }}
      >
        <TemplateRenderer
          templateId={resume.template_id || 'ats-professional'}
          data={resume.resume_data}
          zoom={100}
        />
      </div>
    </>
  );
}
