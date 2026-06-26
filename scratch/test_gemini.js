const fs = require('fs');
const path = require('path');

// Load environment variables from .env
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

const { GoogleGenAI } = require('@google/genai');

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Using API key:', apiKey);
  if (!apiKey || apiKey === 'your_gemini_api_key') {
    console.error('API key is placeholder or empty');
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    console.log('Initialized client, sending content generation request...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Respond with "Key is working!"',
    });
    console.log('Response status/text:', response.text);
  } catch (err) {
    console.error('Gemini API call failed:', err.message || err);
  }
}

run();
