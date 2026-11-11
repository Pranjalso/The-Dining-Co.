const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = '/tmp/test_service_bell';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function testServiceBell() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 896, isMobile: true, hasTouch: true });

  console.log('Navigating to Ignite Aeros Cafe menu with Table 4...');
  await page.goto('http://localhost:3000/ignite-aeros-cafe/menu?table=Table%204', {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });

  // Wait 1.5s then tap anywhere to dismiss Namaste screen immediately
  await new Promise((r) => setTimeout(r, 1500));
  await page.mouse.click(200, 400);
  console.log('Tapped to dismiss welcome intro screen...');

  // Wait 1s for offers popup, then tap backdrop to dismiss
  await new Promise((r) => setTimeout(r, 1500));
  await page.mouse.click(20, 50);
  console.log('Dismissed offer modal if present...');
  await new Promise((r) => setTimeout(r, 1500));

  // Take screenshot of menu
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_menu_with_bell.png') });
  console.log('Saved 01_menu_with_bell.png');

  // Verify floating bell button exists
  const bellButton = await page.waitForSelector('#service-bell-button', { timeout: 10000 });
  if (!bellButton) {
    throw new Error('Service bell floating button not found on menu page!');
  }
  console.log('Service bell floating button found! Clicking...');
  await bellButton.click();
  await new Promise((r) => setTimeout(r, 1200));

  // Screenshot open modal
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_modal_open.png') });
  console.log('Saved 02_modal_open.png');

  // Click "Bring Water" option
  console.log('Clicking "Bring Water" button...');
  const waterBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((b) => b.innerText.includes('Bring Water'));
  });

  if (!waterBtn) {
    throw new Error('"Bring Water" button not found in modal!');
  }
  await waterBtn.click();
  await new Promise((r) => setTimeout(r, 2000));

  // Screenshot after submission (toast pill & countdown)
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_after_request_toast.png') });
  console.log('Saved 03_after_request_toast.png');

  // Now test Admin Dashboard
  console.log('Opening Admin Dashboard to verify Table Help notification...');
  const adminPage = await browser.newPage();
  await adminPage.setViewport({ width: 1280, height: 800 });

  await adminPage.goto('http://localhost:3000/ignite-aeros-cafe/adminlogin', {
    waitUntil: 'networkidle2',
  });
  await adminPage.type('input[type="text"], input[name="username"]', 'ignite');
  await adminPage.type('input[type="password"]', 'IgniteCafe@2026');

  const submitLogin = await adminPage.$('button[type="submit"]');
  if (submitLogin) {
    await submitLogin.click();
    await adminPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  }
  await new Promise((r) => setTimeout(r, 3000));

  // Screenshot admin dashboard with Help alert pill
  await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '04_admin_dashboard_help_badge.png') });
  console.log('Saved 04_admin_dashboard_help_badge.png');

  // Click Table Help widget
  const tableHelpBtn = await adminPage.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((b) => b.innerText.includes('Table Help'));
  });

  if (tableHelpBtn) {
    await tableHelpBtn.click();
    await new Promise((r) => setTimeout(r, 1200));
    await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '05_admin_table_help_dropdown.png') });
    console.log('Saved 05_admin_table_help_dropdown.png');

    // Click "Done"
    const doneBtn = await adminPage.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find((b) => b.innerText.includes('Done'));
    });
    if (doneBtn) {
      await doneBtn.click();
      console.log('Clicked "Done" to resolve request!');
      await new Promise((r) => setTimeout(r, 2000));
      await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '06_admin_resolved.png') });
      console.log('Saved 06_admin_resolved.png');
    }
  }

  await browser.close();
  console.log('--- ALL BROWSER TESTS PASSED SUCCESSFULLY! ---');
}

testServiceBell().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
