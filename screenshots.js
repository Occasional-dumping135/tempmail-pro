const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 900 });
  
  // Landing page
  console.log('Taking landing screenshot...');
  await page.goto('https://temp.amitbrand.shop/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'docs/screenshots/landing.png' });
  console.log('Landing screenshot saved');
  
  // Click Login
  console.log('Taking login screenshot...');
  await page.evaluate(() => {
    const link = Array.from(document.querySelectorAll('a, button')).find(el => el.textContent.includes('Login'));
    if (link) link.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'docs/screenshots/login.png' });
  console.log('Login screenshot saved');
  
  // Go to home and click Get Started
  console.log('Taking token page screenshot...');
  await page.goto('https://temp.amitbrand.shop/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    const link = Array.from(document.querySelectorAll('a, button')).find(el => el.textContent.includes('Get Started'));
    if (link) link.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'docs/screenshots/token.png' });
  console.log('Token page screenshot saved');
  
  // Generate token
  console.log('Taking token ready screenshot...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Generate'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'docs/screenshots/token_ready.png' });
  console.log('Token ready screenshot saved');
  
  await browser.close();
  console.log('All screenshots done!');
})();
