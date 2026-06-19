const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Starting end-to-end verification script...');
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 1. Navigate to dashboard (which should redirect to auth)
    console.log('Navigating to http://localhost:3000/dashboard...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotDir, '01_initial_page.png') });

    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('/auth')) {
      console.log('Redirected to Auth page. Logging in as vamsi2005510@gmail.com...');
      
      // Select email input
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', 'vamsi2005510@gmail.com');
      await page.screenshot({ path: path.join(screenshotDir, '02_email_entered.png') });

      // Click continue
      await page.click('button[type="submit"]');
      await page.waitForSelector('#password', { timeout: 10000 });
      await page.screenshot({ path: path.join(screenshotDir, '03_after_email_submit.png') });

      // Try typing password
      console.log('Waiting for password input...');
      await page.type('#password', 'password123');
      await page.screenshot({ path: path.join(screenshotDir, '04_password_entered.png') });

      // Click submit
      console.log('Submitting credentials...');
      await page.click('button[type="submit"]');
      await page.waitForFunction(() => window.location.href.includes('/dashboard'), { timeout: 15000 });
    }

    console.log('Waiting for Dashboard console to initialize...');
    await page.waitForFunction(() => {
      return !document.body.innerText.includes('Initializing SmartCV Console') && 
             document.body.innerText.includes('Workspace Hub');
    }, { timeout: 15000 });

    console.log(`Successfully authenticated! Current URL: ${page.url()}`);
    await page.screenshot({ path: path.join(screenshotDir, '05_dashboard_home.png') });

    // 2. Open wizard
    console.log('Opening New Resume Wizard...');
    // Click "New Resume" button. Let's find button containing "New Resume" or "Create Resume"
    const buttons = await page.$$('button');
    let createBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('New Resume') || text.includes('Create Resume')) {
        createBtn = btn;
        break;
      }
    }

    if (!createBtn) {
      throw new Error('Could not find New Resume/Create Resume button');
    }
    await createBtn.click();
    await page.waitForTimeout ? await page.waitForTimeout(1000) : await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotDir, '06_wizard_selection.png') });

    // 3. Click "Import Existing Resume" choice card
    console.log('Selecting Import Existing Resume card...');
    const cards = await page.$$('div');
    let importCard = null;
    for (const card of cards) {
      const text = await page.evaluate(el => el.textContent, card);
      if (text.includes('Import Existing Resume') && text.includes('Upload your existing PDF or DOCX')) {
        importCard = card;
        break;
      }
    }

    if (!importCard) {
      throw new Error('Could not find Import Existing Resume choice card');
    }
    await importCard.click();
    await page.waitForTimeout ? await page.waitForTimeout(1000) : await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotDir, '07_import_upload_pane.png') });

    // 4. Test client-side 10MB validation
    console.log('Testing 10MB limit validation with large_file.pdf...');
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      throw new Error('Could not find file input element');
    }
    await fileInput.uploadFile('C:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\scratch\\large_file.pdf');
    await page.waitForTimeout ? await page.waitForTimeout(1000) : await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotDir, '08_large_file_validation.png') });

    const errorMsg = await page.evaluate(() => {
      const el = document.querySelector('.text-rose-600');
      return el ? el.textContent : null;
    });
    console.log(`Validation result (should be size limit error): "${errorMsg}"`);

    // 5. Upload sample_resume.docx
    console.log('Uploading sample_resume.docx...');
    await fileInput.uploadFile('C:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\scratch\\sample_resume.docx');
    
    // 6. Monitor progress and handle duplicate detection dialog if visible
    console.log('Waiting for extraction processing or duplicate warning...');
    await page.waitForFunction(() => document.querySelector('select') || document.body.textContent.includes('Duplicate Detected'), { timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotDir, '09_processing_or_duplicate.png') });

    const isDuplicate = await page.evaluate(() => {
      return document.body.textContent.includes('Duplicate Detected');
    });

    if (isDuplicate) {
      console.log('Duplicate detected! Clicking Import Again...');
      const duplicateButtons = await page.$$('button');
      let importAgainBtn = null;
      for (const btn of duplicateButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Import Again')) {
          importAgainBtn = btn;
          break;
        }
      }
      if (importAgainBtn) {
        await importAgainBtn.click();
        console.log('Clicked Import Again, waiting for processing to complete...');
        await page.waitForSelector('select', { timeout: 15000 });
      } else {
        console.log('Import Again button not found');
      }
    } else {
      console.log('No duplicate warning triggered or already bypassed.');
    }

    await page.screenshot({ path: path.join(screenshotDir, '10_import_summary_screen.png') });

    // 7. Verify stats ticks, select category, click 'Review & Continue'
    console.log('Verifying stats checklist and overriding category...');
    const summaryText = await page.evaluate(() => document.body.innerText);
    console.log('Summary Text preview:', summaryText.substring(0, 500));

    // Change category dropdown (Experienced -> Fresher for verification test)
    await page.select('select', 'Fresher');
    await page.screenshot({ path: path.join(screenshotDir, '11_summary_dropdown_overridden.png') });

    // Click "Review & Continue"
    console.log('Clicking Review & Continue...');
    const continueButtons = await page.$$('button');
    let reviewBtn = null;
    for (const btn of continueButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Review & Continue')) {
        reviewBtn = btn;
        break;
      }
    }
    if (!reviewBtn) {
      throw new Error('Could not find Review & Continue button');
    }
    await reviewBtn.click();
    await page.waitForFunction(() => window.location.href.includes('/builder'), { timeout: 15000 });
    console.log('Waiting for builder form inputs to load...');
    await page.waitForSelector('input', { timeout: 15000 });

    console.log(`Builder loaded! Current URL: ${page.url()}`);
    await page.screenshot({ path: path.join(screenshotDir, '12_builder_initial.png') });

    // 8. Verify low confidence warnings and clear them dynamically on edit
    console.log('Checking for low-confidence warnings...');
    const lowConfidencePresent = await page.evaluate(() => {
      const warnings = Array.from(document.querySelectorAll('span'));
      return warnings.some(w => w.textContent.includes('Review Required'));
    });
    console.log(`Low-confidence warnings found: ${lowConfidencePresent}`);

    // If fullName is warning, type into fullName input box and see if it clears
    const fullNameInput = await page.$('input[placeholder*="Vamsi"], input[placeholder*="Name"], input[value*=""]');
    if (fullNameInput) {
      console.log('Editing Full Name input field...');
      await fullNameInput.click({ clickCount: 3 });
      await fullNameInput.type('Vamsi Krishna Tadisetti (Verified E2E)');
      await page.waitForTimeout ? await page.waitForTimeout(500) : await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: path.join(screenshotDir, '13_after_fullName_edit.png') });
    }

    // 9. Go to Customization tab, check density adjustments
    console.log('Clicking Customization tab...');
    const sidebarButtons = await page.$$('button');
    let customTab = null;
    for (const btn of sidebarButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Customization')) {
        customTab = btn;
        break;
      }
    }
    if (customTab) {
      await customTab.click();
      await page.waitForTimeout ? await page.waitForTimeout(1000) : await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(screenshotDir, '14_customization_tab.png') });

      // Change spacing density to compact
      console.log('Changing visual density spacing...');
      const densitySelect = await page.$('select');
      if (densitySelect) {
        await page.select('select', 'compact');
        await page.waitForTimeout ? await page.waitForTimeout(1000) : await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(screenshotDir, '15_density_compact.png') });
      }
    }

    // 10. Click Save & Exit
    console.log('Clicking Save & Exit...');
    const headerBtns = await page.$$('button');
    let saveExitBtn = null;
    for (const btn of headerBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Save & Exit')) {
        saveExitBtn = btn;
        break;
      }
    }
    if (!saveExitBtn) {
      throw new Error('Could not find Save & Exit button');
    }
    
    await saveExitBtn.click();
    await page.waitForFunction(() => window.location.href.includes('/dashboard'), { timeout: 15000 });

    console.log('Waiting for Dashboard console to re-initialize...');
    await page.waitForFunction(() => {
      return !document.body.innerText.includes('Initializing SmartCV Console') && 
             document.body.innerText.includes('Workspace Hub');
    }, { timeout: 15000 });

    console.log(`Redirected after Save & Exit. Current URL: ${page.url()}`);
    await page.screenshot({ path: path.join(screenshotDir, '16_dashboard_after_save.png') });

    // 11. Navigate back to builder and test PDF Export
    console.log('Waiting for resume list drafts to load...');
    await page.waitForFunction(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(btn => btn.innerText.includes('Edit Resume'));
    }, { timeout: 15000 });

    const buttonsList = await page.$$('button');
    let editResumeBtn = null;
    for (const btn of buttonsList) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Edit Resume')) {
        editResumeBtn = btn;
        break;
      }
    }
    if (editResumeBtn) {
      await editResumeBtn.click();
      await page.waitForFunction(() => window.location.href.includes('/builder'), { timeout: 15000 });
      await page.waitForSelector('input', { timeout: 15000 }); // Wait for loader to disappear
      console.log('Re-entered builder canvas. Clicking Export PDF...');
      
      const actionBtns = await page.$$('button');
      let exportPdfBtn = null;
      for (const btn of actionBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Export PDF')) {
          exportPdfBtn = btn;
          break;
        }
      }

      if (exportPdfBtn) {
        await exportPdfBtn.click();
        console.log('PDF export clicked. Waiting for compilation...');
        await page.waitForTimeout ? await page.waitForTimeout(8000) : await new Promise(r => setTimeout(r, 8000));
        await page.screenshot({ path: path.join(screenshotDir, '17_pdf_export_triggered.png') });
      } else {
        console.log('Export PDF button not found');
      }
    } else {
      console.log('Edit Resume button on dashboard not found');
    }

    console.log('End-to-end verification successfully completed!');
  } catch (err) {
    console.error('E2E Verification Failed with error:', err);
    await page.screenshot({ path: path.join(screenshotDir, 'error_state.png') });
  } finally {
    await browser.close();
  }
}

run();
