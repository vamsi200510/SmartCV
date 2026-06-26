const fs = require('fs');
const path = require('path');
// @ts-ignore
const { PDFParse } = require('pdf-parse');

async function test() {
  const filePath = path.join(__dirname, 'valid_resume.pdf');
  if (!fs.existsSync(filePath)) {
    console.error('File does not exist:', filePath);
    return;
  }
  const buffer = fs.readFileSync(filePath);
  
  try {
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    const rawText = pdfData.text;
    console.log('--- Raw PDF Text ---');
    console.log(JSON.stringify(rawText));
    console.log('Length:', rawText.length);
    console.log('Trimmed Length:', rawText.trim().length);

    // Call resemblesResume logic
    const cleanText = rawText.toLowerCase();
    const resumeKeywords = [
      'education', 'experience', 'skills', 'projects', 'work', 
      'university', 'college', 'institute', 'school', 'employment', 
      'certifications', 'cv', 'resume', 'b.tech', 'btech', 'degree',
      'engineering', 'technology', 'science', 'development', 'developer'
    ];
    const keywordCount = resumeKeywords.filter(keyword => cleanText.includes(keyword)).length;
    console.log('Keyword Count:', keywordCount);
    console.log('Meets Keyword Rule:', rawText.length >= 150 && keywordCount >= 3);
  } catch (err) {
    console.error('Error during test:', err);
  }
}

test();
