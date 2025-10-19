const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Starting Mobile Simulator Test...\n');

  const browser = await chromium.launch({
    headless: true
  });

  // Test both mobile and desktop viewports
  const devices = [
    {
      name: 'iPhone 13 Pro',
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    },
    {
      name: 'Desktop Chrome',
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  ];

  for (const device of devices) {
    console.log(`\n========== Testing: ${device.name} ==========`);

    const context = await browser.newContext({
      viewport: device.viewport,
      userAgent: device.userAgent
    });

    const page = await context.newPage();

    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text });
      console.log(`[${type.toUpperCase()}] ${text}`);
    });

    // Capture JavaScript errors
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log(`[ERROR] ${error.message}`);
    });

    try {
      // Navigate to local dev server
      console.log(`\nNavigating to http://localhost:5173...`);
      await page.goto('http://localhost:5173', {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      // Wait a bit for React to mount
      await page.waitForTimeout(2000);

      // Check if root div has content
      const rootContent = await page.$eval('#root', el => el.innerHTML);
      const rootEmpty = rootContent.trim() === '';

      // Check for specific elements
      const hasLandingPage = await page.$('div.min-h-screen') !== null;
      const hasHeader = await page.$('header') !== null;
      const hasButton = await page.$('button') !== null;

      // Get page title
      const title = await page.title();

      console.log('\n--- Diagnostics ---');
      console.log(`Page Title: ${title}`);
      console.log(`Root div empty: ${rootEmpty}`);
      console.log(`Has landing page container: ${hasLandingPage}`);
      console.log(`Has header: ${hasHeader}`);
      console.log(`Has buttons: ${hasButton}`);
      console.log(`Console messages: ${consoleMessages.length}`);
      console.log(`JavaScript errors: ${errors.length}`);

      if (errors.length > 0) {
        console.log('\n🔴 JavaScript Errors Found:');
        errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
      }

      if (rootEmpty) {
        console.log('\n⚠️ WARNING: React app not rendering - root div is empty!');
        console.log('Possible causes:');
        console.log('  - JavaScript execution error');
        console.log('  - React mount failure');
        console.log('  - Module import failure');
      } else {
        console.log('\n✅ React app is rendering');
        console.log(`Root content length: ${rootContent.length} characters`);
      }

      // Take screenshot
      const screenshotPath = `/tmp/digiform-${device.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`\n📸 Screenshot saved: ${screenshotPath}`);

    } catch (error) {
      console.error(`\n❌ Test failed: ${error.message}`);
    }

    await context.close();
  }

  await browser.close();
  console.log('\n✅ Mobile simulator test complete!\n');
})();
