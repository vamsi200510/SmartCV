const fs = require('fs');

const logPath = 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\1fa1c42a-2848-4185-8288-a424cb166c43\\.system_generated\\tasks\\task-1905.log';
if (!fs.existsSync(logPath)) {
  console.error('Log file not found!');
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

console.log('Searching log for import requests & errors...');
let count = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('/api/resumes/import') || line.includes('[API-IMPORT]') || line.includes('[AI-EXTRACTOR]') || line.includes('Unexpected error') || line.includes('Quota exceeded') || line.includes('resemblesResume') || line.includes('validationPassed') || line.includes('detectedEmail') || line.includes('isResume') || line.includes('rejectReason')) {
    console.log(`Line ${i + 1}: ${line.trim().substring(0, 300)}`);
    count++;
    if (count > 200) {
      console.log('Too many matches, stopping print.');
      break;
    }
  }
}
