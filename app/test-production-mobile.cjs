const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Production Site (digiform.tech) on Mobile...\n');

  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();

  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });
    if (type === 'error' || type === 'warning') {
      console.log(`[${type.toUpperCase()}] ${text}`);
    }
  });

  // Capture JavaScript errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`[ERROR] ${error.message}`);
  });

  try {
    console.log('Navigating to https://digiform.tech...\n');
    await page.goto('https://digiform.tech', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for React to mount
    await page.waitForTimeout(3000);

    // Check if root div has content
    const rootContent = await page.$eval('#root', el => el.innerHTML).catch(() => '');
    const rootEmpty = rootContent.trim() === '';

    // Check for specific elements
    const hasLandingPage = await page.$('div.min-h-screen') !== null;
    const hasHeader = await page.$('header') !== null;
    const hasButton = await page.$('button') !== null;
    const hasText = await page.textContent('body');

    // Get page title
    const title = await page.title();

    console.log('--- Production Mobile Diagnostics ---');
    console.log(`Page Title: ${title}`);
    console.log(`Root div empty: ${rootEmpty}`);
    console.log(`Has landing page container: ${hasLandingPage}`);
    console.log(`Has header: ${hasHeader}`);
    console.log(`Has buttons: ${hasButton}`);
    console.log(`Body text length: ${hasText?.length || 0} characters`);
    console.log(`Console errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n🔴 JavaScript Errors:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    if (rootEmpty) {
      console.log('\n⚠️ WARNING: Site is blank - React not rendering!');
    } else {
      console.log('\n✅ SUCCESS: Site is rendering on mobile!');
      console.log(`Root content: ${rootContent.substring(0, 200)}...`);
    }

    // Take screenshot
    await page.screenshot({ path: '/tmp/digiform-production-mobile.png', fullPage: true });
    console.log('\n📸 Screenshot: /tmp/digiform-production-mobile.png');

  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
  }

  await context.close();
  await browser.close();
})();
