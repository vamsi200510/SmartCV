import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    // Set worker path as a file URL
    pdfjs.GlobalWorkerOptions.workerSrc = 'file:///c:/Users/Dell/OneDrive/Desktop/SmartCV/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs';
    
    const filePath = 'c:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\src\\r0.pdf';
    const buffer = new Uint8Array(fs.readFileSync(filePath));
    const loadingTask = pdfjs.getDocument({ data: buffer });
    const doc = await loadingTask.promise;
    console.log('Pages:', doc.numPages);
    
    const page = await doc.getPage(1);
    const textContent = await page.getTextContent();
    console.log('Text items count:', textContent.items.length);
    if (textContent.items.length > 0) {
      console.log('First 5 items:', textContent.items.slice(0, 5).map(item => item.str));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
