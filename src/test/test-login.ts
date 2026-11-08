import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oevwwmxqcbcatckfcjvo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ldnd3bXhxY2JjYXRja2ZjanZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMTI1MzIsImV4cCI6MjEwOTY4ODUzMn0.sfdEeA8flI2kGKs12StP4kDfvTITo-cVS4WhlnbPWNA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('--- Testing Demo Citizen Login ---');
  const { data: d1, error: e1 } = await supabase.auth.signInWithPassword({
    email: 'demo@leafloop.eco',
    password: 'EcoCitizen2026!',
  });
  if (e1) {
    console.error('Citizen Login FAILED:', e1);
  } else {
    console.log('Citizen Login SUCCESS! User ID:', d1.user?.id);
    console.log('User email:', d1.user?.email);
  }

  console.log('\n--- Testing Demo Admin Login ---');
  const { data: d2, error: e2 } = await supabase.auth.signInWithPassword({
    email: 'admin@leafloop.eco',
    password: 'EcoAdmin2026!',
  });
  if (e2) {
    console.error('Admin Login FAILED:', e2);
  } else {
    console.log('Admin Login SUCCESS! User ID:', d2.user?.id);
    console.log('User email:', d2.user?.email);
  }

  process.exit(0);
}

main();
