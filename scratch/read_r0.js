const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function run() {
  const filePath = 'c:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\src\\r0.pdf';
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  try {
    const images = await parser.getImage();
    console.log('Total images:', images.total);
    console.log('Pages array length:', images.pages.length);
    for (let i = 0; i < images.pages.length; i++) {
      console.log(`Page ${i + 1} images count:`, images.pages[i].images.length);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
