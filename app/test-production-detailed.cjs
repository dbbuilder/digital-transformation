const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Detailed Production Test - Simulating Real Mobile Chrome...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }, // Pixel 6 size
    userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    hasTouch: true,
    isMobile: true
  });

  const page = await context.newPage();

  // Capture ALL console messages
  const logs = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    logs.push({ type, text, timestamp: new Date().toISOString() });

    if (type === 'error' || type === 'warning') {
      console.log(`[${type.toUpperCase()}] ${text}`);
    }
  });

  // Capture JavaScript errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    console.log(`\n🔴 JS ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}\n`);
  });

  // Capture failed network requests
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()?.errorText,
      timestamp: new Date().toISOString()
    });
    console.log(`\n❌ FAILED REQUEST: ${request.url()}`);
    console.log(`Reason: ${request.failure()?.errorText}\n`);
  });

  try {
    console.log('Navigating to https://digiform.tech...');
    console.log('Using cache-busting...\n');

    await page.goto('https://digiform.tech?t=' + Date.now(), {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for React to potentially mount
    await page.waitForTimeout(5000);

    // Check root div content
    const rootHTML = await page.$eval('#root', el => el.innerHTML).catch(() => '');
    const rootEmpty = rootHTML.trim() === '';

    // Check for specific elements
    const hasLandingPage = await page.$('div.min-h-screen') !== null;
    const hasHeader = await page.$('header') !== null;
    const hasButton = await page.$('button') !== null;

    // Get all loaded script tags
    const scripts = await page.$$eval('script', scripts =>
      scripts.map(s => ({ src: s.src, type: s.type }))
    );

    // Get page title
    const title = await page.title();

    console.log('\n========== DETAILED DIAGNOSTICS ==========');
    console.log(`Page Title: ${title}`);
    console.log(`Root div empty: ${rootEmpty}`);
    console.log(`Root HTML length: ${rootHTML.length} chars`);
    console.log(`Has landing page: ${hasLandingPage}`);
    console.log(`Has header: ${hasHeader}`);
    console.log(`Has buttons: ${hasButton}`);
    console.log(`\nScript Tags Found: ${scripts.length}`);
    scripts.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.src || 'inline'} (${s.type || 'text/javascript'})`);
    });

    console.log(`\nConsole Logs: ${logs.length}`);
    console.log(`JavaScript Errors: ${errors.length}`);
    console.log(`Failed Requests: ${failedRequests.length}`);

    if (errors.length > 0) {
      console.log('\n🔴 JAVASCRIPT ERRORS FOUND:');
      errors.forEach((err, i) => {
        console.log(`\n${i + 1}. ${err.message}`);
        console.log(`   Time: ${err.timestamp}`);
        if (err.stack) {
          console.log(`   Stack: ${err.stack.substring(0, 200)}...`);
        }
      });
    }

    if (failedRequests.length > 0) {
      console.log('\n❌ FAILED NETWORK REQUESTS:');
      failedRequests.forEach((req, i) => {
        console.log(`\n${i + 1}. ${req.url}`);
        console.log(`   Reason: ${req.failure}`);
      });
    }

    if (logs.length > 0) {
      console.log('\n📋 CONSOLE OUTPUT:');
      logs.forEach((log, i) => {
        if (i < 20) { // Show first 20 logs
          console.log(`[${log.type.toUpperCase()}] ${log.text}`);
        }
      });
      if (logs.length > 20) {
        console.log(`... and ${logs.length - 20} more log entries`);
      }
    }

    if (rootEmpty) {
      console.log('\n⚠️ WARNING: React did NOT mount - root div is EMPTY!');
      console.log('\nPossible causes:');
      console.log('  1. JavaScript bundle failed to load');
      console.log('  2. JavaScript execution error');
      console.log('  3. React initialization error');
      console.log('  4. Module import failure');
    } else {
      console.log('\n✅ React mounted successfully!');
      console.log(`First 300 chars of content:\n${rootHTML.substring(0, 300)}...`);
    }

    // Take screenshot
    await page.screenshot({
      path: '/tmp/digiform-detailed-test.png',
      fullPage: true
    });
    console.log('\n📸 Screenshot: /tmp/digiform-detailed-test.png');

  } catch (error) {
    console.error(`\n❌ TEST FAILED: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
  }

  await context.close();
  await browser.close();
  console.log('\n✅ Test complete!\n');
})();
