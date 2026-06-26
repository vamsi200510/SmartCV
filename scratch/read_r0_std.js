const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function run() {
  const filePath = 'c:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\src\\r0.pdf';
  const buffer = fs.readFileSync(filePath);
  try {
    const data = await pdf(buffer);
    console.log('--- Standard pdf-parse Extracted Info ---');
    console.log('Length:', data.text.length);
    console.log('Snippet:', JSON.stringify(data.text.substring(0, 500)));
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
