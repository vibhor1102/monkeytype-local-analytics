/* Optional live acceptance: npm install --prefix .local/browser playwright
 * Uses a temporary signed-out profile. Never attaches to your regular browser.
 * Run npm run package first; MLA_EXTENSION_DIR may point at an extracted ZIP.
 */
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const assert = require('node:assert/strict');
const {chromium} = require(path.resolve('.local/browser/node_modules/playwright'));
const core = require('../extension/core.js');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'typing-mistakes-'));
(async () => {
  const context = await chromium.launchPersistentContext(profile, {channel:'chrome', headless:true,
    ignoreDefaultArgs:['--disable-extensions'], args:['--enable-unsafe-extension-debugging']});
  context.setDefaultTimeout(15000);
  try {
    const cdp = await context.browser().newBrowserCDPSession();
    const {id} = await cdp.send('Extensions.loadUnpacked', {path:path.resolve(process.env.MLA_EXTENSION_DIR || 'dist/extension')});
    const recovery = await context.newPage();
    await recovery.goto(`chrome-extension://${id}/dashboard.html`);
    await recovery.waitForSelector('#tests');
    const seed = core.blank();
    core.merge(seed, {id:'a'.repeat(64), started:1, ended:2, language:'english', layout:'default', mode:'words',
      keys:{a:{attempts:40, errors:4, substitutions:{s:4}}}, attempts:40, errors:4, extra:0, corrections:4});
    await recovery.evaluate(value => chrome.runtime.sendMessage({type:'restore', value}), seed);
    const page = await context.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => localStorage.setItem('merchBannerClosed3', 'true'));
    await page.goto('https://monkeytype.com/#local-analytics', {waitUntil:'domcontentloaded'});
    const reject = page.getByText('reject non-essential', {exact:true});
    if (await reject.isVisible()) await reject.click();
    const view = page.locator('[data-mla-page]');
    await view.waitFor(); await page.waitForURL('**/#typing-mistakes');
    await page.waitForFunction(() => document.querySelector('[data-mla-page]')?.shadowRoot.getElementById('tests').textContent === '1');
    assert.equal(await page.title(), 'Typing mistakes | Monkeytype');
    const appearance = () => page.evaluate(() => {
      const host = document.querySelector('[data-mla-page]');
      return {font:getComputedStyle(host.shadowRoot.querySelector('main')).fontFamily,
        siteFont:getComputedStyle(document.body).fontFamily, background:getComputedStyle(document.body).backgroundColor, accent:getComputedStyle(host).getPropertyValue('--accent').trim(),
        siteAccent:getComputedStyle(document.body).getPropertyValue('--main-color').trim(), timeOrigin:performance.timeOrigin};
    });
    let theme = await appearance(); assert.equal(theme.font, theme.siteFont); assert.equal(theme.accent, theme.siteAccent);
    const before = theme;
    await page.getByText('serika dark', {exact:true}).click();
    await page.getByPlaceholder('Theme...', {exact:true}).fill('serika');
    await page.getByText('serika', {exact:true}).click();
    await page.waitForTimeout(600); theme = await appearance();
    assert.equal(theme.accent, theme.siteAccent); assert.notEqual(theme.background, before.background); assert.equal(theme.timeOrigin, before.timeOrigin);
    // Custom site colors inherit immediately too, with no copied theme palette.
    await page.evaluate(() => document.documentElement.style.setProperty('--main-color', '#a763e8'));
    assert.equal((await appearance()).accent, '#a763e8');
    await page.evaluate(() => document.documentElement.style.removeProperty('--main-color'));
    await view.locator('#minimum').fill('2'); await page.keyboard.type('0'); await page.keyboard.press('Tab'); await page.keyboard.press('Space');
    assert.equal(await page.evaluate(() => window.currentEventLog?.()?.events?.some(e => e.type === 'timer' && e.data.event === 'start') || false), false);
    for (const shortcut of ['Escape', 'Escape', 'Control+Shift+P']) {
      await view.locator('#minimum').focus(); await page.keyboard.press(shortcut);
      await page.locator('#CommandlineModal input').waitFor({state:'visible'}); await page.keyboard.press('Escape');
      await page.locator('#CommandlineModal input').waitFor({state:'hidden'});
    }
    await view.locator('#reset').evaluate(button => button.click());
    await page.evaluate(() => window.postMessage({channel:'monkeytype-local-analytics-v1',type:'view',operation:'reset'},location.origin));
    assert.equal((await recovery.evaluate(() => chrome.storage.local.get('analytics'))).analytics.tests, 1);
    await view.locator('.scope a').click(); assert.equal(await view.locator('details').getAttribute('open'), '');
    await page.setViewportSize({width:390,height:844}); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth),390);
    await page.setViewportSize({width:1400,height:1000});
    await page.locator('[data-nav-item="settings"]').click();
    await page.waitForFunction(() => !document.querySelector('[data-mla-page]')); await page.locator('#pageSettings').waitFor({state:'visible'});
    await page.goBack(); await view.waitFor(); await page.reload(); await view.waitFor();
    await view.locator('.back').click(); await page.locator('#typingTest').waitFor({state:'visible'});
    // Trusted native menu click during a test must navigate, not hide a running timer.
    await page.locator('#typingTest').click(); await page.keyboard.type('x', {delay:100});
    assert.equal(await page.evaluate(() => window.currentEventLog().events.some(e => e.type === 'timer' && e.data.event === 'start')),true);
    await page.evaluate(() => {
      const fixture = document.createElement('div'); fixture.dataset.uiElement = 'accountMenu';
      fixture.style = 'position:fixed;top:200px;left:100px;z-index:999999;background:var(--bg-color);padding:20px';
      fixture.innerHTML = '<a href="/account">User stats</a><a href="/settings">Settings</a>'; document.body.prepend(fixture);
    });
    const menu = page.locator('[data-monkeytype-local-analytics]'); await menu.waitFor();
    assert.equal(await menu.innerText(), 'Typing mistakes');
    assert.equal(await menu.evaluate(n => n.previousElementSibling.textContent), 'User stats');
    const pages = context.pages().length;
    await menu.click(); await view.waitFor(); assert.equal(context.pages().length,pages);
    assert.equal(await page.evaluate(() => window.currentEventLog?.()?.events?.some(e => e.type === 'timer' && e.data.event === 'start') || false),false);
    // Return to typing, complete a corrected test, and verify collection still works.
    await view.locator('.back').click(); await page.locator('#typingTest').waitFor({state:'visible'});
    await page.getByText('words', {exact:true}).click(); await page.waitForTimeout(1200);
    const words = await page.locator('#words .word').allTextContents();
    await page.locator('#typingTest').click();
    const first = words[0][0]; await page.keyboard.type(first === 'x' ? 'z' : 'x', {delay:100}); await page.keyboard.press('Backspace');
    await page.keyboard.type(words.join(' ') + ' ', {delay:80});
    await page.waitForFunction(() => window.lastEventLog?.()?.events?.some(e => e.type === 'timer' && e.data.event === 'end'));
    await recovery.waitForFunction(() => document.getElementById('tests').textContent === '2');
    const state = (await recovery.evaluate(() => chrome.storage.local.get('analytics'))).analytics;
    assert.equal(state.tests,2); assert.equal(Object.values(state.groups).reduce((n,g)=>n+g.errors,0),5);
    assert.equal(Object.values(state.groups).reduce((n,g)=>n+g.corrections,0),5);
    await recovery.reload(); await recovery.waitForFunction(() => document.getElementById('tests').textContent === '2');
    // An extension reload must not strand the site's routed content hidden.
    await page.goto('https://monkeytype.com/#typing-mistakes'); await view.waitFor();
    const manager = await context.newPage(); await manager.goto('chrome://extensions');
    await manager.evaluate(id => new Promise((resolve,reject) => chrome.developerPrivate.reload(id,{failQuietly:true},()=>chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve())), id);
    await page.locator('[data-nav-item="settings"]').click(); await page.locator('#pageSettings').waitFor({state:'visible'});
    await page.waitForFunction(() => !document.querySelector('[data-mla-page]'));
    assert.deepEqual(errors, []);
    console.log('PASS: hash/bookmark migration, native shell/font, live light/custom themes, keyboard isolation, safe controls, mobile, SPA/back/reload, menu same-tab navigation during test, corrected live collection and persistence.');
  } finally {await context.close(); fs.rmSync(profile, {recursive:true, force:true});}
})().catch(error => {console.error(error); process.exitCode=1;});
