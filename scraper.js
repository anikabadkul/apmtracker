const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://apmlist.com/', { waitUntil: 'networkidle2' });
  
  // Extract company links. APM List usually has a table or grid of companies.
  const data = await page.evaluate(() => {
    // This depends on apmlist's DOM structure. Let's just grab all links and filter them.
    const rows = Array.from(document.querySelectorAll('a'));
    const results = [];
    rows.forEach(a => {
      results.push({text: a.innerText, href: a.href});
    });
    return results;
  });
  
  console.log(JSON.stringify(data));
  await browser.close();
})();
