const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key && val) {
        process.env[key] = val;
      }
    }
  });
}

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function run() {
  const email = 'vamsi2005510@gmail.com';
  
  // Fetch auth users using admin API or select from user_profiles
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return;
  }
  
  console.log('--- Profile Info ---');
  console.log(profile);

  if (!profile) {
    console.log('No profile found for email:', email);
    return;
  }

  // Fetch resumes for this profile.id
  const { data: resumes, error: resumesError } = await supabaseAdmin
    .from('resumes')
    .select('*');

  if (resumesError) {
    console.error('Error fetching resumes:', resumesError);
    return;
  }

  console.log(`\n--- Resumes in Database (${resumes.length} total) ---`);
  resumes.forEach(r => {
    console.log(`ID: ${r.id}`);
    console.log(`Title: ${r.title}`);
    console.log(`User ID: ${r.user_id}`);
    console.log(`Profile ID Match: ${r.user_id === profile.id}`);
    console.log(`Status: ${r.status}`);
    console.log(`Category: ${r.category}`);
    console.log('----------------------------------------');
  });
}

run();
