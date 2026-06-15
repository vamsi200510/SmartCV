const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function loadEnv(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach(line => {
      const parts = line.trim().split('=');
      if (parts.length >= 2 && !line.trim().startsWith('#')) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]/g, '');
        process.env[key] = val;
      }
    });
  } catch (err) {}
}

loadEnv('./.env');
loadEnv('./.env.local');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data, error } = await supabaseAdmin
    .from('otp_verifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Last 5 OTPs:');
    data.forEach(row => {
      console.log(`Email: ${row.email} | Code: ${row.otp_code} | Created: ${row.created_at}`);
    });
  }
}

run();
