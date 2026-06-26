const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('c:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\node_modules\\@google\\genai');

function loadEnv() {
  const envPath = 'c:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\.env.local';
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*GEMINI_API_KEY\s*=\s*(.*)\s*$/);
      if (match) {
        process.env.GEMINI_API_KEY = match[1].trim();
      }
    }
  }
}
loadEnv();

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const RESUME_SCHEMA = {
  type: 'OBJECT',
  properties: {
    personal: {
      type: 'OBJECT',
      properties: {
        fullName: { type: 'STRING' },
        email: { type: 'STRING' },
        phone: { type: 'STRING' }
      },
      required: ['fullName', 'email', 'phone']
    },
    isResume: { type: 'BOOLEAN' }
  },
  required: ['personal', 'isResume']
};

async function run() {
  const filePath = 'c:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\src\\r0.pdf';
  const pdfBase64 = fs.readFileSync(filePath).toString('base64');
  
  try {
    console.log('Sending PDF to Gemini...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: pdfBase64,
            mimeType: 'application/pdf'
          }
        },
        'Extract the candidate\'s name, email, and phone. Tell me if this is a resume.'
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: RESUME_SCHEMA
      }
    });
    console.log('Success! Response:');
    console.log(response.text);
  } catch (err) {
    console.error('Failed:', err.message || err);
  }
}
run();
