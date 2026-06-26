const fs = require('fs');
const path = require('path');
const pdfjsLib = require('c:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\node_modules\\pdfjs-dist\\legacy\\build\\pdf.cjs');

async function run() {
  const filePath = 'c:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\src\\r0.pdf';
  const buffer = new Uint8Array(fs.readFileSync(filePath));
  try {
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const doc = await loadingTask.promise;
    console.log('Doc loaded. Pages:', doc.numPages);
    const page = await doc.getPage(1);
    const textContent = await page.getTextContent();
    console.log('Items length:', textContent.items.length);
    if (textContent.items.length > 0) {
      console.log('First 10 items:', textContent.items.slice(0, 10).map(item => ({
        str: item.str,
        width: item.width,
        height: item.height
      })));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
