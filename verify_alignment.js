const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  // Check QB Drills (Offense)
  await page.goto('file://' + process.cwd() + '/website/pages/drills/offense/qbDrills.html');
  // Wait for header to load (it uses fetch)
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'verification/offense_qb_final.png' });

  // Check DB Drills (Defense)
  await page.goto('file://' + process.cwd() + '/website/pages/drills/defense/dbDrills.html');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'verification/defense_db_final.png' });

  await browser.close();
})();
