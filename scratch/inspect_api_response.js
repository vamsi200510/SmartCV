const fs = require('fs');
const path = require('path');

const logPath = path.join('C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\1fa1c42a-2848-4185-8288-a424cb166c43\\.system_generated\\tasks\\task-481.log');
if (!fs.existsSync(logPath)) {
  console.log('Log file does not exist:', logPath);
  return;
}

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
console.log('Total lines:', lines.length);

lines.forEach((line, idx) => {
  if (line.includes('422') || line.includes('error') || line.includes('reject') || line.includes('Please upload')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
