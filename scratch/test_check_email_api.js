async function run() {
  const email = 'vamsi2005510@gmail.com';
  console.log('Sending fetch request to http://localhost:3000/api/auth/check-email...');
  try {
    const res = await fetch('http://localhost:3000/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    console.log('Response status:', res.status);
    const text = await res.text();
    console.log('Response text:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

run();
