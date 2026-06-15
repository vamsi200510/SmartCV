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

console.log('Starting OTP auto-writer polling...');
let lastOtpId = null;

async function poll() {
  try {
    const { data, error } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      const row = data[0];
      if (row.id !== lastOtpId) {
        lastOtpId = row.id;
        console.log(`[POLL] New OTP found: ${row.otp_code} for ${row.email}`);
        fs.writeFileSync('public/otp.txt', row.otp_code);
      }
    }
  } catch (err) {
    console.error('Poll error:', err);
  }
}

// Poll every 1000ms
setInterval(poll, 1000);
