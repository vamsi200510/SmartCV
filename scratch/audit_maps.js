const fs = require('fs');

const content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('.map')) {
    console.log(`--- Map found at line ${idx + 1} ---`);
    for (let i = idx; i < Math.min(idx + 10, lines.length); i++) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  }
});
