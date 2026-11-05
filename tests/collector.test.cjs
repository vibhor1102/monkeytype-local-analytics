const test = require('node:test'), assert = require('node:assert/strict'), vm = require('node:vm'), fs = require('node:fs');
const core = require('../extension/core.js');
async function setup() {
  let completed, active, interval, keydown, message, failHook = false;
  const posts = [], timers = [];
  const window = {config: {language: 'english', layout: 'default', funbox: []}, lastEventLog: () => {if (failHook) throw Error('hook failed'); return completed;}, currentEventLog: () => active, postMessage: value => posts.push(value), addEventListener: (_, f) => message = f};
  vm.runInNewContext(fs.readFileSync('extension/collector.js', 'utf8'), {window, document: {addEventListener: (_, f) => keydown = f}, location: {origin: 'https://monkeytype.com'}, MonkeytypeLocalAnalyticsCore: core, crypto: require('node:crypto').webcrypto, TextEncoder, setTimeout: f => timers.push(f), setInterval: f => interval = f, Date});
  const tick = async () => {interval(); await new Promise(r => setTimeout(r, 15));};
  return {posts, window, tick, fail: () => failHook = true,
    finish: async date => {
      const start = {type: 'timer', testMs: 0, data: {event: 'start', date}};
      active = {events: [start]}; keydown({isTrusted: true}); timers.splice(0).forEach(f => f());
      completed = {version: 1, context: {mode: 'words', targetWords: ['cat ']}, events: [start, {type: 'input', testMs: 1, data: {inputType: 'insertText', wordIndex: 0, charIndex: 0, data: 'x', correct: false}}, {type: 'timer', testMs: 2, data: {event: 'end', date: date + 2}}]};
    }, navigate: token => message({source: window, origin: 'https://monkeytype.com', data: {channel: 'monkeytype-local-analytics-v1', type: 'navigate-request', value: token}}), ack: id => message({source: window, origin: 'https://monkeytype.com', data: {channel: 'monkeytype-local-analytics-v1', type: 'ack', value: id}})};
}
test('queued tests survive a failed first save and retain captured settings', async () => {
  const c = await setup(); await c.finish(100); c.window.config.language = 'french'; await c.tick();
  const first = c.posts.find(p => p.type === 'summary').value;
  assert.equal(first.language, 'english'); await c.finish(200); await c.tick();
  assert.equal(c.posts.filter(p => p.type === 'summary').at(-1).value.id, first.id);
  c.ack(first.id);
  const second = c.posts.filter(p => p.type === 'summary').at(-1).value;
  assert.notEqual(second.id, first.id); assert.equal(second.language, 'french'); c.ack(second.id);
  assert.match(c.posts.at(-1).value, /Saved/);
});
test('hook exceptions become visible status rather than unhandled errors', async () => {
  const c = await setup(); c.fail(); await c.tick(); assert.match(c.posts.at(-1).value, /hook failed/);
});

test('navigation flush waits for completed summary acknowledgement before allowing unload', async () => {
  const c = await setup(); await c.finish(300); c.navigate('route-token'); await c.tick();
  assert.equal(c.posts.some(p => p.type === 'navigation-ready'), false);
  const summary = c.posts.find(p => p.type === 'summary').value; c.ack(summary.id);
  assert.equal(c.posts.at(-1).type, 'navigation-ready'); assert.equal(c.posts.at(-1).value, 'route-token');
});
