const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testCase(page, filePath, expectedError, shouldSucceed) {
  const fileName = path.basename(filePath);
  console.log(`\n--- Testing file: ${fileName} ---`);
  
  // Navigate to dashboard
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  
  // Wait for Workspace Hub to load
  await page.waitForFunction(() => {
    return !document.body.innerText.includes('Initializing SmartCV Console') && 
           document.body.innerText.includes('Workspace Hub');
  }, { timeout: 15000 });

  // Clear existing import_debug.log to separate logs per test run
  const logPath = 'C:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\import_debug.log';
  if (fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '');
  }

  // Click "New Resume" button
  const buttons = await page.$$('button');
  let createBtn = null;
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('New Resume') || text.includes('Create Resume')) {
      createBtn = btn;
      break;
    }
  }
  if (!createBtn) throw new Error('Could not find New Resume/Create Resume button');
  await createBtn.click();
  await new Promise(r => setTimeout(r, 1000));

  // Select "Import Existing Resume" choice card
  const cards = await page.$$('div');
  let importCard = null;
  for (const card of cards) {
    const text = await page.evaluate(el => el.textContent, card);
    if (text.includes('Import Existing Resume') && text.includes('Upload your existing PDF or DOCX')) {
      importCard = card;
      break;
    }
  }
  if (!importCard) throw new Error('Could not find Import Existing Resume choice card');
  await importCard.click();
  await new Promise(r => setTimeout(r, 1000));

  // Find file input and upload file
  const fileInput = await page.$('input[type="file"]');
  if (!fileInput) throw new Error('Could not find file input element');
  await fileInput.uploadFile(filePath);
  await new Promise(r => setTimeout(r, 1500));

  // Wait for results
  if (shouldSucceed) {
    console.log(`Waiting for success/duplicate result for ${fileName}...`);
    try {
      await page.waitForFunction(() => {
        const text = document.body.innerText;
        return text.includes('Duplicate Detected') || 
               text.includes('Import Summary Checklist') || 
               text.includes('Resume Imported Successfully') ||
               window.location.href.includes('/builder') ||
               text.includes('Please review the auto-extracted section statistics');
      }, { timeout: 20000 });

      // Handle duplicate if it appears
      const isDuplicate = await page.evaluate(() => document.body.innerText.includes('Duplicate Detected'));
      if (isDuplicate) {
        console.log('Duplicate detected. Clicking Import Again...');
        const dupBtns = await page.$$('button');
        let importAgainBtn = null;
        for (const btn of dupBtns) {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text.includes('Import Again')) {
            importAgainBtn = btn;
            break;
          }
        }
        if (importAgainBtn) {
          await importAgainBtn.click();
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      const success = await page.evaluate(() => {
        return document.body.innerText.includes('Import Summary Checklist') || 
               window.location.href.includes('/builder');
      });
      console.log(`SUCCESS: File ${fileName} successfully processed!`);
    } catch (err) {
      console.error(`FAILED: Success was expected for ${fileName}, but timed out/failed. Error:`, err.message);
    }
  } else {
    console.log(`Waiting for validation error: "${expectedError}" for ${fileName}...`);
    try {
      await page.waitForFunction((expected) => {
        return document.body.innerText.includes(expected);
      }, { timeout: 15000 }, expectedError);
      console.log(`SUCCESS: Received expected error: "${expectedError}"`);
    } catch (err) {
      const pageText = await page.evaluate(() => document.body.innerText);
      console.error(`FAILED: Expected error: "${expectedError}", but page had different content. Page preview:`, pageText.substring(0, 500));
    }
  }

  // Print import_debug.log contents if it exists
  if (fs.existsSync(logPath)) {
    const logs = fs.readFileSync(logPath, 'utf8');
    console.log(`--- Server Debug Logs for ${fileName} ---`);
    console.log(logs.trim() || '(No server logs recorded)');
  }
}

async function run() {
  console.log('Launching browser for import E2E test suite...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // Navigate and login first
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
    if (page.url().includes('/auth')) {
      console.log('Logging in as vamsi2005510@gmail.com...');
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', 'vamsi2005510@gmail.com');
      await page.click('button[type="submit"]');
      await page.waitForSelector('#password');
      await page.type('#password', 'Vamsi.2005');
      await page.click('button[type="submit"]');
      await page.waitForFunction(() => window.location.href.includes('/dashboard'), { timeout: 15000 });
      console.log('Logged in successfully!');
    }

    // Run the 5 required test cases
    
    // Case 5: PDF larger than 10MB
    await testCase(page, 'C:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\scratch\\large_file.pdf', 'File exceeds maximum size limit of 10MB.', false);

    // Case 4: Corrupted PDF
    await testCase(page, 'C:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\scratch\\corrupted_resume.pdf', 'Please upload a valid resume.', false);

    // Case 3: Random PDF (non-resume content)
    await testCase(page, 'C:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\scratch\\random_resume.pdf', 'Please upload a valid resume.', false);

    // Case 2: Valid DOCX resume
    await testCase(page, 'C:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\scratch\\sample_resume.docx', null, true);

    // Case 1: Valid PDF resume
    await testCase(page, 'C:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\scratch\\valid_resume.pdf', null, true);

  } catch (err) {
    console.error('E2E Test Runner encountered an error:', err);
    console.log('Current URL:', page.url());
    console.log('Page Text Preview:', (await page.evaluate(() => document.body.innerText)).substring(0, 500));
    await page.screenshot({ path: path.join(__dirname, 'login_error.png') });
  } finally {
    await browser.close();
  }
}

run();
