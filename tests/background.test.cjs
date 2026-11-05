const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const core = require('../extension/core.js');
function worker() {
  const local = {}, session = {}, opened = [], handlers = new Map(); let listener, fail = false;
  const area = data => ({get: async keys => Object.fromEntries((Array.isArray(keys) ? keys : [keys]).filter(k => data[k] !== undefined).map(k => [k, structuredClone(data[k])])), set: async values => {if (fail) throw Error('Quota exceeded'); Object.assign(data, structuredClone(values));}, setAccessLevel() {}});
  const chrome = {runtime: {getURL: p => `chrome-extension://test/${p}`, onMessage: {addListener: f => listener = f}, openOptionsPage: async () => {}}, storage: {local: area(local), session: area(session)}, tabs: {create: async value => opened.push(value.url), update: async () => {}, sendMessage: async id => {if (!handlers.has(id)) throw Error('No receiver'); return handlers.get(id);}, onRemoved: {addListener() {}}}};
  vm.runInNewContext(fs.readFileSync('extension/background.js', 'utf8'), {chrome, importScripts() {}, MonkeytypeLocalAnalyticsCore: core});
  const site = {url: 'https://monkeytype.com/', tab: {id: 1}, frameId: 0};
  const dashboard = {url: chrome.runtime.getURL('dashboard.html')};
  return {local, opened, handlers, setFail: value => fail = value, send: (type, value, sender = dashboard, operation) => new Promise(resolve => {if (!listener({type, value, operation}, sender, resolve)) resolve(undefined);}), site};
}
const summary = id => ({id: id.repeat(64), started: 1, ended: 2, language: 'english', layout: 'default', mode: 'words', keys: {c: {attempts: 2, errors: 1, substitutions: {x: 1}}}, attempts: 2, errors: 1, corrections: 1, extra: 0});
test('concurrent collector retries count exactly once', async () => {
  const w = worker(); await Promise.all(Array.from({length: 10}, () => w.send('summary', summary('a'), w.site)));
  assert.equal(w.local.analytics.tests, 1);
});
test('failed storage write can retry without loss or double counting', async () => {
  const w = worker(); w.setFail(true);
  assert.equal((await w.send('summary', summary('a'), w.site)).ok, false);
  assert.equal(w.local.analytics, undefined); w.setFail(false);
  assert.equal((await w.send('summary', summary('a'), w.site)).ok, true);
  assert.equal(w.local.analytics.tests, 1);
});
test('v1 restore reset and undo retain original counts and deduplication', async () => {
  const w = worker(), state = core.blank(); core.merge(state, summary('a'));
  assert.equal((await w.send('restore', state)).ok, true);
  await w.send('reset'); await w.send('summary', summary('a'), w.site);
  assert.equal(w.local.analytics.tests, 0); await w.send('undo');
  assert.equal(w.local.analytics.tests, 1); assert.equal(Object.values(w.local.analytics.groups)[0].errors, 1);
});
test('failed replacement restore preserves analytics and undo atomically', async () => {
  const w = worker(); await w.send('summary', summary('a'), w.site);
  const before = structuredClone(w.local); w.setFail(true);
  assert.equal((await w.send('restore', core.blank())).ok, false);
  assert.deepEqual(w.local, before);
});
test('website cannot reset or restore; unrelated pages and frames are ignored', async () => {
  const w = worker(); assert.equal((await w.send('reset', null, w.site)).ok, false);
  assert.equal(await w.send('summary', summary('a'), {...w.site, frameId: 1}), undefined);
  assert.equal(await w.send('reset', null, {url: 'https://example.com/'}), undefined);
});
test('per-tab statuses do not overwrite each other', async () => {
  const w = worker(); await w.send('status', 'Ready', w.site);
  await w.send('status', 'Unsupported', {...w.site, tab: {id: 2}});
  const result = await w.send('get'); assert.equal(Object.keys(result.collectorTabs).length, 2);
});

test('isolated in-page view can read and recover data without exposing generic site commands', async () => {
  const w = worker(); await w.send('summary', summary('a'), w.site);
  const result = await w.send('view', null, w.site, 'get'); assert.equal(result.analytics.tests, 1);
  assert.equal((await w.send('get', null, w.site)).ok, false);
  assert.equal((await w.send('view', null, w.site, 'open-integrated')).ok, false);
  await w.send('view', null, w.site, 'reset'); assert.equal(w.local.analytics.tests, 0);
  await w.send('view', null, w.site, 'undo'); assert.equal(w.local.analytics.tests, 1);
});
test('toolbar reuses a connected site tab and falls back safely when no receiver remains', async () => {
  const w = worker(); await w.send('status', 'Ready', w.site); w.handlers.set(1, {ok: true});
  await w.send('open-integrated'); assert.equal(w.opened.length, 0);
  w.handlers.clear(); await w.send('open-integrated'); assert.deepEqual(w.opened, ['https://monkeytype.com/#typing-mistakes']);
  assert.equal((await w.send('open-integrated', null, w.site)).ok, false);
});
