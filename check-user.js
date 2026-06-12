const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('Querying developer@smartcv.co in Auth...');
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('List users error:', listError.message);
  } else {
    const devUser = users.find(u => u.email === 'developer@smartcv.co');
    console.log('Dev Auth User:', devUser ? { id: devUser.id, email: devUser.email, created_at: devUser.created_at } : 'Not Found');
    
    if (devUser) {
      console.log('Querying corresponding profile...');
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', devUser.id)
        .maybeSingle();
        
      if (profileError) {
        console.error('Profile query error:', profileError.message);
      } else {
        console.log('Profile details:', profile);
      }
    }
  }
}

main();
