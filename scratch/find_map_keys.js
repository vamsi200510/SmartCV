const fs = require('fs');

const content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('.map') || line.includes('key=')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
