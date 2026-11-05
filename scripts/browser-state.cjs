/* Controller failure/recovery acceptance against the real compiled extension.
 * Temporary signed-out profile, synthetic data, no Monkeytype/network requests.
 * Optional tooling: npm install --prefix .local/browser playwright
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require(path.resolve('.local/browser/node_modules/playwright'));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'typing-mistakes-state-'));
(async () => {
  const context = await chromium.launchPersistentContext(profile, {channel:'chrome', headless:true,
    ignoreDefaultArgs:['--disable-extensions'], args:['--enable-unsafe-extension-debugging']});
  try {
    const cdp = await context.browser().newBrowserCDPSession();
    const {id} = await cdp.send('Extensions.loadUnpacked', {path:path.resolve(process.env.MLA_EXTENSION_DIR || 'dist/extension')});
    const page = await context.newPage();
    await page.goto(`chrome-extension://${id}/dashboard.html`);
    await page.waitForFunction(() => !document.getElementById('export').disabled);
    const result = await page.evaluate(async () => {
      const original = chrome.runtime.sendMessage, host = document.createElement('section');
      document.body.append(host);
      const root = host.attachShadow({mode:'open'}), $ = id => root.getElementById(id);
      root.innerHTML = MLAViewAssets.html;
      let failure = true, controller;
      const state = MonkeytypeLocalAnalyticsCore.blank();
      MonkeytypeLocalAnalyticsCore.merge(state, {id:'a'.repeat(64), started:1, ended:2,
        language:'english', layout:'default', mode:'words',
        keys:{a:{attempts:40, errors:4, substitutions:{s:4}}}, attempts:40, errors:4, extra:0, corrections:4});
      const tick = () => new Promise(resolve => setTimeout(resolve, 0));
      chrome.runtime.sendMessage = async () => {
        if (failure) throw Error('Injected unavailable storage');
        return {ok:true, analytics:structuredClone(state), revision:'test-revision', collectorTabs:{}};
      };
      try {
        sessionStorage.setItem('mla:view:v2', 'null'); // Malformed preferences must be harmless.
        controller = MLAView.mount(root);
        const initiallyDisabled = $('export').disabled;
        await controller.ready;
        const firstFailure = {disabled:$('export').disabled, tests:$('tests').textContent,
          state:root.querySelector('main').dataset.state, alert:$('alert-text').textContent};
        failure = false; $('retry').click(); await tick();
        const loaded = {state:root.querySelector('main').dataset.state, tests:$('tests').textContent,
          disabled:$('export').disabled, alertHidden:$('alert').hidden};
        const row = $('rows').firstChild, option = $('language').lastChild;
        failure = true; $('retry').click(); await tick();
        const stale = {state:root.querySelector('main').dataset.state, tests:$('tests').textContent};
        failure = false; $('retry').click(); await tick();
        const recovered = {state:root.querySelector('main').dataset.state, alertHidden:$('alert').hidden,
          rowUnchanged:row === $('rows').firstChild, optionUnchanged:option === $('language').lastChild};
        return {initiallyDisabled, firstFailure, loaded, stale, recovered};
      } finally {
        controller?.dispose(); chrome.runtime.sendMessage = original; host.remove();
        sessionStorage.removeItem('mla:view:v2');
      }
    });
    assert.equal(result.initiallyDisabled, true);
    assert.equal(result.firstFailure.disabled, true);
    assert.equal(result.firstFailure.tests, '—');
    assert.equal(result.firstFailure.state, 'error');
    assert.match(result.firstFailure.alert, /unavailable storage/);
    assert.deepEqual(result.loaded, {state:'ready', tests:'1', disabled:false, alertHidden:true});
    assert.deepEqual(result.stale, {state:'stale', tests:'1'});
    assert.deepEqual(result.recovered, {state:'ready', alertHidden:true, rowUnchanged:true, optionUnchanged:true});
    console.log('PASS compiled view: loading/export gating, initial failure, retry, malformed preferences, stale data recovery at unchanged revision, stable row/option DOM.');
  } finally {await context.close(); fs.rmSync(profile, {recursive:true, force:true});}
})().catch(error => {console.error(error); process.exitCode = 1;});
