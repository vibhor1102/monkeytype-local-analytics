/* UI acceptance in an existing signed-in Chrome profile. Never types a test,
 * changes site theme settings, or mutates analytics. Attach without defaults;
 * emulate media only on our Monkeytype tab and ALWAYS clear it in finally.
 */
const {chromium} = require(require('node:path').resolve('.local/browser/node_modules/playwright'));
const assert = require('node:assert/strict');
const endpoint = process.env.MLA_CDP_ENDPOINT || 'http://127.0.0.1:9222';
const id = process.env.MLA_EXTENSION_ID;
const startPath = process.env.MLA_START_PATH || '/account';
if (!id) throw Error('Set MLA_EXTENSION_ID to the installed extension ID.');
if (!['/', '/account'].includes(startPath)) throw Error('MLA_START_PATH must be / or /account.');
const preferences = page => page.evaluate(() => ({dark:matchMedia('(prefers-color-scheme: dark)').matches,light:matchMedia('(prefers-color-scheme: light)').matches}));
async function withScheme(page, colorScheme, operation) {
  try {await page.emulateMedia({colorScheme}); return await operation();}
  finally {await page.emulateMedia({colorScheme:null});}
}
(async()=>{
  const browser = await chromium.connectOverCDP(endpoint,{noDefaults:true});
  const context=browser.contexts()[0],others=context.pages().filter(p=>/^https?:/.test(p.url()));
  const before=await Promise.all(others.map(async p=>({page:p,prefs:await preferences(p)})));
  let page,recovery,baseline,storageBefore;
  try {
    recovery=await context.newPage(); await recovery.goto(`chrome-extension://${id}/dashboard.html`);
    await recovery.waitForFunction(()=>!document.getElementById('export').disabled);
    storageBefore=await recovery.evaluate(()=>chrome.storage.local.get(null));
    page=await context.newPage();page.setDefaultTimeout(60000);await page.goto('https://monkeytype.com' + startPath);
    await page.locator(startPath === '/account' ? '#pageAccount' : '#typingTest').waitFor({state:'visible'});
    await page.waitForFunction(()=>!document.body.classList.contains('loading'));
    await page.waitForSelector('[data-monkeytype-local-analytics]');
    baseline=await preferences(page);const timeOrigin=await page.evaluate(()=>performance.timeOrigin),start=Date.now();
    await page.locator('[data-nav-item="account"]').hover();await page.locator('[data-monkeytype-local-analytics]').click();
    const view=page.locator('[data-mla-page]');await view.waitFor();await page.waitForFunction(()=>document.querySelector('[data-mla-page]')?.shadowRoot.querySelector('main').dataset.state==='ready');
    const viewReadyMs=Date.now()-start;assert.equal(await page.evaluate(()=>performance.timeOrigin),timeOrigin);
    await page.locator('[data-nav-item="account"]').click({trial:true});const accountClickableMs=Date.now()-start;
    for(const scheme of ['light','dark']) await withScheme(page,scheme,async()=>{
      const prefs=await preferences(page);assert.equal(prefs[scheme],true);
      const font=await page.evaluate(()=>({site:getComputedStyle(document.body).fontFamily,view:getComputedStyle(document.querySelector('[data-mla-page]').shadowRoot.querySelector('main')).fontFamily}));assert.equal(font.site,font.view);
    });
    assert.deepEqual(await preferences(page),baseline);
    // The cleanup contract is verified on an intentional failure too.
    await assert.rejects(()=>withScheme(page,'light',async()=>{throw Error('Intentional cleanup probe');}),/Intentional cleanup probe/);
    assert.deepEqual(await preferences(page),baseline);
    await view.locator('#minimum').fill('100');await view.locator('#sort').selectOption('rate');
    await page.locator('[data-nav-item="settings"]').click();await page.locator('#pageSettings').waitFor({state:'visible'});
    await page.goBack();await view.waitFor();await page.waitForFunction(()=>document.querySelector('[data-mla-page]').shadowRoot.getElementById('minimum').value==='100');
    assert.equal(await page.evaluate(()=>performance.timeOrigin),timeOrigin);await view.locator('#clear').click();
    await page.setViewportSize({width:390,height:844});await view.locator('#focus-jump').waitFor({state:'visible'});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),"Mobile document must not overflow");
    const count=await view.locator('#rows tr').count();assert.ok(count<=8);if(count)assert.equal(await view.locator('#table-hint').isVisible(),true);
    await view.locator('#focus-jump').click();assert.equal(await view.locator('#practice-title').evaluate(n=>n.getRootNode().activeElement===n),true);
    await view.locator('#characters-jump').click();
    if(await view.locator('#show-more').isVisible()){await view.locator('#show-more').click();assert.ok(await view.locator('#rows tr').count()>=count);await view.locator('#show-more').click();}
    assert.deepEqual(await recovery.evaluate(()=>chrome.storage.local.get(null)),storageBefore);
    console.log(JSON.stringify({passed:true,startPath,viewReadyMs,accountClickableMs,documentReplaced:false,themeCleanupSuccessAndFailure:true,unrelatedTabsChecked:others.length,mobileAndHistory:true,analyticsUnchanged:true}));
  } finally {
    // No context-wide defaults, no forced dark, no changes to other pages.
    try {if(page&&!page.isClosed()){await page.emulateMedia({colorScheme:null});if(baseline)assert.deepEqual(await preferences(page),baseline);}}
    finally {
      try {
        for(const snapshot of before)if(!snapshot.page.isClosed())assert.deepEqual(await preferences(snapshot.page),snapshot.prefs,'An unrelated tab preference changed');
        if(recovery&&!recovery.isClosed()&&storageBefore)assert.deepEqual(await recovery.evaluate(()=>chrome.storage.local.get(null)),storageBefore);
        console.log(JSON.stringify({cleanupVerified:true,unrelatedTabsUnchanged:before.length}));
      } finally {if(page&&!page.isClosed())await page.close();if(recovery&&!recovery.isClosed())await recovery.close();await browser.close();}
    }
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
