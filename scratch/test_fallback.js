const fs = require('fs');
const path = require('path');
const { parseWithLegacyRegex } = require('../src/lib/ai/fallbackParser');
const { resemblesResume } = require('../src/lib/ai/resumeExtractor');
// @ts-ignore
const { PDFParse } = require('pdf-parse');

async function test() {
  const filePath = path.join(__dirname, 'valid_resume.pdf');
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  const pdfData = await parser.getText();
  const rawText = pdfData.text;

  const data = parseWithLegacyRegex(rawText);
  console.log('--- Fallback Parsed Data ---');
  console.log(JSON.stringify(data, null, 2));

  const resembles = resemblesResume(rawText, data);
  console.log('Resembles Resume:', resembles);
}

test();
