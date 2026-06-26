const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\src\\components\\TemplateRenderer.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  // 1. Experience separators
  {
    target: `<span>{exp.role} — {exp.company}</span>`,
    replacement: `<span>{exp.role && exp.company ? \`\${exp.role} — \${exp.company}\` : (exp.role || exp.company)}</span>`
  },
  {
    target: `<span>{exp.company} — {exp.role}</span>`,
    replacement: `<span>{exp.company && exp.role ? \`\${exp.company} — \${exp.role}\` : (exp.company || exp.role)}</span>`
  },
  {
    target: `<div className="text-slate-500 text-[9.5px]">{exp.company} | {exp.location || 'Remote'}</div>`,
    replacement: `{exp.company || exp.location ? <div className="text-slate-500 text-[9.5px]">{exp.company}{exp.location ? \` | \${exp.location}\` : ''}</div> : null}`
  },
  
  // 2. Education separators
  {
    target: `<span className="font-bold">{edu.degree}</span> - {edu.school}`,
    replacement: `{edu.degree && edu.school ? <><span className="font-bold">{edu.degree}</span> - {edu.school}</> : <span className="font-bold">{edu.degree || edu.school}</span>}`
  },
  {
    target: `<span className="font-bold">{edu.school}</span> - {edu.degree}`,
    replacement: `{edu.school && edu.degree ? <><span className="font-bold">{edu.school}</span> - {edu.degree}</> : <span className="font-bold">{edu.school || edu.degree}</span>}`
  },
  {
    target: `<span className="font-bold">{edu.school}</span> — <span className="italic">{edu.degree}</span>`,
    replacement: `{edu.school && edu.degree ? <><span className="font-bold">{edu.school}</span> — <span className="italic">{edu.degree}</span></> : <span className="font-bold">{edu.school || edu.degree}</span>}`
  },

  // 3. Project separators
  {
    target: `<div className="font-bold">{proj.name} — <span className="font-normal italic text-slate-605">{proj.technologies.join(', ')}</span></div>`,
    replacement: `<div className="font-bold">{proj.name}{proj.technologies && proj.technologies.length > 0 ? <> — <span className="font-normal italic text-slate-605">{proj.technologies.join(', ')}</span></> : ''}</div>`
  },

  // 4. Certification separators (various text classes)
  {
    target: `<span><span className="font-bold">{cert.name}</span> — {cert.issuer}</span>`,
    replacement: `<span><span className="font-bold">{cert.name}</span>{cert.issuer ? \` — \${cert.issuer}\` : ''}</span>`
  },
  {
    target: `<span><span className="font-bold text-slate-955">{cert.name}</span> — {cert.issuer}</span>`,
    replacement: `<span><span className="font-bold text-slate-955">{cert.name}</span>{cert.issuer ? \` — \${cert.issuer}\` : ''}</span>`
  },
  {
    target: `<span><span className="font-bold text-slate-800">{cert.name}</span> — {cert.issuer}</span>`,
    replacement: `<span><span className="font-bold text-slate-800">{cert.name}</span>{cert.issuer ? \` — \${cert.issuer}\` : ''}</span>`
  },
  {
    target: `<span><span className="font-bold text-slate-905">{cert.name}</span> — {cert.issuer}</span>`,
    replacement: `<span><span className="font-bold text-slate-905">{cert.name}</span>{cert.issuer ? \` — \${cert.issuer}\` : ''}</span>`
  },
  {
    target: `<span><span className="font-bold text-slate-905">{cert.name}</span> — {cert.issuer}</span>`,
    replacement: `<span><span className="font-bold text-slate-905">{cert.name}</span>{cert.issuer ? \` — \${cert.issuer}\` : ''}</span>`
  },
  {
    target: `<span><span className="font-bold text-slate-900">{cert.name}</span> — <span className="text-slate-655">{cert.issuer}</span></span>`,
    replacement: `<span><span className="font-bold text-slate-900">{cert.name}</span>{cert.issuer ? <> — <span className="text-slate-655">{cert.issuer}</span></> : ''}</span>`
  },
  {
    target: `<span><span className="font-bold">{cert.name}</span> — <span className="italic">{cert.issuer}</span></span>`,
    replacement: `<span><span className="font-bold">{cert.name}</span>{cert.issuer ? <> — <span className="italic">{cert.issuer}</span></> : ''}</span>`
  },
  {
    target: `<span className="text-slate-605 text-[10px]"> — {cert.issuer}</span>`,
    replacement: `{cert.issuer && <span className="text-slate-605 text-[10px]"> — {cert.issuer}</span>}`
  },
  {
    target: `<span className="text-slate-600 text-[10px]"> — {cert.issuer}</span>`,
    replacement: `{cert.issuer && <span className="text-slate-600 text-[10px]"> — {cert.issuer}</span>}`
  },

  // 5. Achievement separators (various text classes)
  {
    target: `<span className="font-bold">• {ach.title}</span> — {ach.description}`,
    replacement: `<span className="font-bold">• {ach.title}</span>{ach.description ? \` — \${ach.description}\` : ''}`
  },
  {
    target: `<span className="font-bold text-slate-955">• {ach.title}</span> — {ach.description}`,
    replacement: `<span className="font-bold text-slate-955">• {ach.title}</span>{ach.description ? \` — \${ach.description}\` : ''}`
  },
  {
    target: `<span className="font-bold text-slate-800">• {ach.title}</span> — {ach.description}`,
    replacement: `<span className="font-bold text-slate-800">• {ach.title}</span>{ach.description ? \` — \${ach.description}\` : ''}`
  },
  {
    target: `<span className="font-bold text-slate-900">• {ach.title}</span> — {ach.description}`,
    replacement: `<span className="font-bold text-slate-900">• {ach.title}</span>{ach.description ? \` — \${ach.description}\` : ''}`
  },
  {
    target: `<span className="font-bold text-slate-905">• {ach.title}</span> — {ach.description}`,
    replacement: `<span className="font-bold text-slate-905">• {ach.title}</span>{ach.description ? \` — \${ach.description}\` : ''}`
  }
];

console.log('Starting separator replacements...');
let count = 0;
for (const rep of replacements) {
  if (content.includes(rep.target)) {
    content = content.replace(new RegExp(escapeRegExp(rep.target), 'g'), rep.replacement);
    console.log(`Replaced: ${rep.target}`);
    count++;
  } else {
    // Check if it's already replaced
    if (content.includes(rep.replacement)) {
      console.log(`Already replaced: ${rep.target}`);
    } else {
      console.warn(`Target NOT found: ${rep.target}`);
    }
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

if (count > 0) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully completed ${count} replacements!`);
} else {
  console.log('No new replacements were needed.');
}
