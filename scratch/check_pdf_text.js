const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function run() {
  const srcDir = 'c:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\src';
  for (let i = 0; i <= 8; i++) {
    const filename = `r${i}.pdf`;
    const filePath = path.join(srcDir, filename);
    if (!fs.existsSync(filePath)) continue;
    const buffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: buffer });
    try {
      const textResult = await parser.getText();
      console.log(`${filename}: text length = ${textResult.text.length}, trimmed length = ${textResult.text.trim().length}`);
      console.log(`${filename} first 100 chars:`, JSON.stringify(textResult.text.substring(0, 100)));
    } catch (err) {
      console.error(`Error on ${filename}:`, err.message);
    }
  }
}
run();
