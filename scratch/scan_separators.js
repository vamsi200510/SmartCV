const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\src\\components\\TemplateRenderer.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const regex = /({.*?}\s*([-—|])\s*{.*?}|>\s*—\s*{|—\s*{|{\s*.*?\s*}\s*—)/g;

console.log('--- Separator Matches in TemplateRenderer.tsx ---');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('—') || line.includes(' - ') || line.includes(' | ')) {
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || i < 520) continue;
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
}
