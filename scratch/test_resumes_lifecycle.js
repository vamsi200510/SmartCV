const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('=== STARTING MY RESUMES LIFECYCLE E2E TEST ===');
  
  const screenshotDir = path.join(__dirname, 'screenshots_lifecycle');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set view port
  await page.setViewport({ width: 1280, height: 800 });

  // Listen to browser console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[TEMP-DEBUG') || text.includes('warning') || text.includes('Warning') || text.includes('error') || text.includes('Error')) {
      console.log(`[BROWSER-LOG] ${text}`);
    }
  });

  try {
    // 1. Navigate to dashboard (forces login if not authenticated)
    console.log('Navigating to dashboard...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

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
      await new Promise(r => setTimeout(r, 2000));
    }

    await page.screenshot({ path: path.join(screenshotDir, '01_dashboard_loaded.png') });

    // Click on "My Resumes" tab in the sidebar
    console.log('Navigating to My Resumes tab...');
    const navButtons = await page.$$('aside nav button');
    let resumesTabBtn = null;
    for (const btn of navButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('My Resumes')) {
        resumesTabBtn = btn;
        break;
      }
    }
    if (resumesTabBtn) {
      await resumesTabBtn.click();
      console.log('Clicked My Resumes tab button.');
    } else {
      throw new Error('Could not find My Resumes tab button in sidebar');
    }
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotDir, '02_my_resumes_tab.png') });

    // Capture initial resume count on screen
    const getResumeCards = () => page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('main div.grid > div'));
      return cards.map(c => {
        const titleEl = c.querySelector('h3');
        return titleEl ? titleEl.textContent.trim() : null;
      }).filter(Boolean);
    });

    let initialResumes = await getResumeCards();
    console.log(`Initial resumes visible on screen: ${initialResumes.length}`, initialResumes);

    // 2. Upload resume
    console.log('Starting upload flow...');
    // Click "Create New Draft" button in the tab content header
    const createDraftBtns = await page.$$('main button');
    let createDraftBtn = null;
    for (const btn of createDraftBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Create New Draft') || text.includes('Create Resume') || text.includes('New Resume')) {
        createDraftBtn = btn;
        break;
      }
    }
    if (!createDraftBtn) {
      // Try aside/header trigger
      const headerBtns = await page.$$('header button');
      for (const btn of headerBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('New Resume')) {
          createDraftBtn = btn;
          break;
        }
      }
    }
    
    if (!createDraftBtn) throw new Error('Could not find create button');
    await createDraftBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotDir, '03_wizard_opened.png') });

    // Select "Import Existing Resume" choice card
    const choiceCards = await page.$$('main div.grid.grid-cols-1 > div');
    let importCard = null;
    for (const card of choiceCards) {
      const text = await page.evaluate(el => el.textContent, card);
      if (text.includes('Import Existing Resume') && text.includes('Upload your existing PDF or DOCX')) {
        importCard = card;
        break;
      }
    }
    if (!importCard) throw new Error('Could not find Import card');
    await importCard.click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotDir, '04_upload_pane.png') });

    // Find file input and upload file (using valid_resume.pdf)
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) throw new Error('Could not find file input');
    
    const testPdfPath = path.join(__dirname, 'valid_resume.pdf');
    console.log(`Uploading test resume PDF: ${testPdfPath}`);
    await fileInput.uploadFile(testPdfPath);
    await new Promise(r => setTimeout(r, 1500));

    // Wait for processing to complete or duplicate detected modal
    console.log('Waiting for import processor response...');
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('Duplicate Detected') || 
             text.includes('Import Summary Checklist') || 
             text.includes('Resume Imported Successfully') ||
             window.location.href.includes('/builder') ||
             text.includes('Please review the auto-extracted section statistics');
    }, { timeout: 30000 });

    await page.screenshot({ path: path.join(screenshotDir, '05_processing_complete.png') });

    // Check if duplicate dialog appeared
    let isDuplicate = await page.evaluate(() => document.body.innerText.includes('Duplicate Detected'));
    if (isDuplicate) {
      console.log('Duplicate detected modal is visible. Click Import Again to force creation...');
      await page.screenshot({ path: path.join(screenshotDir, '05_duplicate_detected.png') });
      const dupBtns = await page.$$('button');
      let importAgainBtn = null;
      for (const btn of dupBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Import Again')) {
          importAgainBtn = btn;
          break;
        }
      }
      if (!importAgainBtn) throw new Error('Could not find Import Again button');
      await importAgainBtn.click();
      await new Promise(r => setTimeout(r, 15000)); // wait for full extraction again
      await page.screenshot({ path: path.join(screenshotDir, '05_imported_after_duplicate.png') });
    }

    // Now we should be on the summary checklist screen
    const isSummaryScreen = await page.evaluate(() => document.body.innerText.includes('Resume Imported Successfully'));
    if (!isSummaryScreen) {
      throw new Error(`Expected Summary checklist screen, but page is different. Text preview: ${(await page.evaluate(() => document.body.innerText)).substring(0, 500)}`);
    }
    console.log('Resume successfully imported. Current URL:', page.url());

    // Instead of completing builder flow, let's navigate back to Dashboard
    console.log('Navigating back to Dashboard by clicking Sidebar Home...');
    const homeBtn = (await page.$$('aside nav button'))[0];
    await homeBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotDir, '06_returned_to_dashboard.png') });

    // Check if My Resumes tab displays it immediately
    let finalTabBtn = null;
    for (const btn of await page.$$('aside nav button')) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('My Resumes')) {
        finalTabBtn = btn;
        break;
      }
    }
    await finalTabBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotDir, '07_my_resumes_with_new_draft.png') });

    let resumesAfterImport = await getResumeCards();
    console.log(`Resumes visible after import: ${resumesAfterImport.length}`, resumesAfterImport);

    // Verify it immediately appears
    if (resumesAfterImport.length <= initialResumes.length) {
      throw new Error('New resume draft did not immediately appear in My Resumes listing!');
    }
    console.log('VERIFIED: Resume immediately appears in My Resumes.');

    // 3. Refresh page and verify it still appears
    console.log('Refreshing page...');
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    
    // Ensure we are back on My Resumes tab if it defaults to Home
    const currentTab = await page.evaluate(() => {
      const activeBtn = Array.from(document.querySelectorAll('aside nav button')).find(b => b.className.includes('bg-indigo-50') || b.className.includes('text-teal-400'));
      return activeBtn ? activeBtn.textContent.trim() : 'unknown';
    });
    console.log('Active tab after reload:', currentTab);
    if (!currentTab.includes('My Resumes')) {
      for (const btn of await page.$$('aside nav button')) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('My Resumes')) {
          await btn.click();
          break;
        }
      }
      await new Promise(r => setTimeout(r, 2000));
    }
    await page.screenshot({ path: path.join(screenshotDir, '08_after_refresh.png') });

    let resumesAfterRefresh = await getResumeCards();
    console.log(`Resumes visible after refresh: ${resumesAfterRefresh.length}`, resumesAfterRefresh);
    if (resumesAfterRefresh.length !== resumesAfterImport.length) {
      throw new Error('Resume list length changed after page refresh!');
    }
    console.log('VERIFIED: Resume still appears after reload.');

    // 4. Upload same resume again to test duplicate dialog triggers
    console.log('Re-importing same resume to test duplicate dialog...');
    const createDraftBtn2 = (await page.$$('main button')).find(async btn => {
      const text = await page.evaluate(el => el.textContent, btn);
      return text.includes('Create New Draft');
    }) || (await page.$$('header button')).find(async btn => {
      const text = await page.evaluate(el => el.textContent, btn);
      return text.includes('New Resume');
    });
    
    // Let's just find and click "Create New Draft" button in the tab header
    const mainBtns = await page.$$('main button');
    let createDraftBtn3 = null;
    for (const btn of mainBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Create New Draft')) {
        createDraftBtn3 = btn;
        break;
      }
    }
    await createDraftBtn3.click();
    await new Promise(r => setTimeout(r, 1000));
    
    // Choose import again
    const choiceCards2 = await page.$$('main div.grid.grid-cols-1 > div');
    let importCard2 = null;
    for (const card of choiceCards2) {
      const text = await page.evaluate(el => el.textContent, card);
      if (text.includes('Import Existing Resume') && text.includes('Upload your existing PDF or DOCX')) {
        importCard2 = card;
        break;
      }
    }
    await importCard2.click();
    await new Promise(r => setTimeout(r, 1000));
    
    // Upload file
    const fileInput2 = await page.$('input[type="file"]');
    await fileInput2.uploadFile(testPdfPath);
    await new Promise(r => setTimeout(r, 1500));

    console.log('Waiting for duplicate warning to appear...');
    await page.waitForFunction(() => {
      return document.body.innerText.includes('Duplicate Detected');
    }, { timeout: 20000 });

    await page.screenshot({ path: path.join(screenshotDir, '09_duplicate_dialog_appeared.png') });
    console.log('VERIFIED: Duplicate modal appeared correctly.');

    // Click Cancel on duplicate modal
    const cancelBtns = await page.$$('button');
    let cancelBtn = null;
    for (const btn of cancelBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.trim() === 'Cancel') {
        cancelBtn = btn;
        break;
      }
    }
    if (cancelBtn) {
      await cancelBtn.click();
      console.log('Clicked Cancel on Duplicate dialog.');
    }
    await new Promise(r => setTimeout(r, 1000));

    // Return to dashboard
    const homeBtn2 = (await page.$$('aside nav button'))[0];
    await homeBtn2.click();
    await new Promise(r => setTimeout(r, 2000));

    // Navigate to resumes tab
    for (const btn of await page.$$('aside nav button')) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('My Resumes')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));

    // 5. Delete draft
    // Find the newly imported resume draft ID or Title
    // Let's identify the title of the imported draft
    const importedTitle = `Imported - valid_resume`;
    console.log(`Locating card with title: ${importedTitle} to delete...`);

    // Let's click the Trash icon on the card
    // We can evaluate which card has the trash icon and click it
    // In our card list:
    // resumes.map((resume) => ( ... group relative ... ))
    // The trash icon is visible on hover, but we can click it programmatically or via selector
    const deleteTriggered = await page.evaluate((titleToMatch) => {
      const cards = Array.from(document.querySelectorAll('main div.grid > div'));
      for (const card of cards) {
        const titleEl = card.querySelector('h3');
        if (titleEl && titleEl.textContent.trim().includes(titleToMatch)) {
          const deleteBtn = card.querySelector('button[title="Delete Draft"]') || card.querySelector('button');
          if (deleteBtn) {
            // Dismiss confirmation dialog dialog by mocking confirm window
            window.confirm = () => true;
            deleteBtn.click();
            return true;
          }
        }
      }
      return false;
    }, importedTitle);

    if (!deleteTriggered) {
      throw new Error(`Could not find or delete resume with title: ${importedTitle}`);
    }

    console.log('Clicked delete draft button. Waiting for card to disappear...');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotDir, '10_after_delete_immediate.png') });

    let resumesAfterDelete = await getResumeCards();
    console.log(`Resumes visible immediately after delete: ${resumesAfterDelete.length}`, resumesAfterDelete);
    
    // Verify count decreased by 1
    if (resumesAfterDelete.length !== resumesAfterRefresh.length - 1) {
      throw new Error(`Expected resumes count to be ${resumesAfterRefresh.length - 1}, but got ${resumesAfterDelete.length}`);
    }
    console.log('VERIFIED: Resume card immediately disappears after delete.');

    // 6. Refresh page and verify it remains deleted
    console.log('Refreshing page to verify deleted resume stays deleted...');
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));

    // Navigate to resumes tab if needed
    for (const btn of await page.$$('aside nav button')) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('My Resumes')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotDir, '11_after_reload_deleted.png') });

    let resumesPostReload = await getResumeCards();
    console.log(`Resumes visible after reload: ${resumesPostReload.length}`, resumesPostReload);
    if (resumesPostReload.length !== resumesAfterRefresh.length - 1) {
      throw new Error(`Expected resumes count after reload to be ${resumesAfterRefresh.length - 1}, but got ${resumesPostReload.length}`);
    }
    console.log('VERIFIED: Resume remains deleted after reload.');

  } catch (err) {
    console.error('Lifecycle test execution failed:', err);
    console.log('Page Text Preview:', (await page.evaluate(() => document.body.innerText)).substring(0, 500));
    await page.screenshot({ path: path.join(screenshotDir, 'error_lifecycle.png') });
  } finally {
    await browser.close();
  }
}

run();
