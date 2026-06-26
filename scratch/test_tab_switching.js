const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Launching browser to test tab switching...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => {
    console.log('[BROWSER CONSOLE]', msg.text());
  });

  try {
    console.log('Navigating to dashboard...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });

    if (page.url().includes('/auth')) {
      console.log('Logging in...');
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', 'vamsi2005510@gmail.com');
      await page.click('button[type="submit"]');
      await page.waitForSelector('#password', { timeout: 10000 });
      await page.type('#password', 'Vamsi.2005');
      await page.click('button[type="submit"]');
      await page.waitForFunction(() => window.location.href.includes('/dashboard'), { timeout: 15000 });
      console.log('Logged in successfully!');
    }

    console.log('Waiting for console to load...');
    await page.waitForFunction(() => {
      return !document.body.innerText.includes('Initializing SmartCV Console') && 
             document.body.innerText.includes('Workspace Hub');
    }, { timeout: 15000 });

    // Take screenshot of Home
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    await page.screenshot({ path: path.join(screenshotDir, 'tab_01_home.png') });

    // Click on "My Resumes" tab in sidebar
    console.log('Clicking "My Resumes" tab...');
    const buttons = await page.$$('button');
    let resumesTabBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('My Resumes')) {
        resumesTabBtn = btn;
        break;
      }
    }
    if (!resumesTabBtn) throw new Error('Could not find My Resumes tab button');
    await resumesTabBtn.click();
    await new Promise(r => setTimeout(r, 2000));

    // Take screenshot of My Resumes Tab
    await page.screenshot({ path: path.join(screenshotDir, 'tab_02_resumes.png') });

    const pageText = await page.evaluate(() => document.body.innerText);
    console.log('My Resumes tab loaded. Text contains "// Your Resumes Collection"?', pageText.includes('Your Resumes Collection'));
    console.log('Is "Your library is currently empty" present?', pageText.includes('library is currently empty'));
    console.log('Is "Edit Resume" present?', pageText.includes('Edit Resume'));
    
  } catch (err) {
    console.error('Error occurred:', err);
  } finally {
    await browser.close();
  }
}

run();
