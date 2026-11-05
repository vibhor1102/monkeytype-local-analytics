const {test} = require('node:test');
const assert = require('node:assert/strict');
const {analyze, blank, merge, validateSummary, validateBackup} = require('../extension/core.js');
const config = {language: 'english', layout: 'default', oppositeShiftMode: 'off', funbox: []};
const insert = (data, correct, charIndex, extra = {}) => ({type: 'input', testMs: 10, data: {inputType: 'insertText', data, correct, wordIndex: 0, charIndex, inputValue: '', ...extra}});
const deletion = (extra = {}) => ({type: 'input', testMs: 10, data: {inputType: 'deleteContentBackward', wordIndex: 0, charIndex: 1, inputValue: '', ...extra}});
const log = (events, target = 'cat ', context = {}) => ({version: 1, context: {targetWords: [target], mode: 'words', bailedOut: false, ...context}, events: [
  {type: 'timer', testMs: 0, data: {event: 'start', date: 1793800000000}}, ...events,
  {type: 'timer', testMs: 100, data: {event: 'end', date: 1793800000100}}
]});
const summary = events => ({...analyze(log(events), config), id: 'a'.repeat(64)});

test('counts by expected character, retaining corrected mistakes and replacement attempts', () => {
  const s = summary([insert('x', false, 0), deletion(), insert('c', true, 0), insert('a', true, 1), insert('t', true, 2), insert(' ', true, 3)]);
  assert.equal(s.attempts, 5); assert.equal(s.errors, 1); assert.equal(s.corrections, 1);
  assert.equal(s.keys.c.attempts, 2); assert.equal(s.keys.c.errors, 1); assert.equal(s.keys.c.substitutions.x, 1);
  assert.equal(s.keys[' '].attempts, 1); validateSummary(s);
});
test('counts early word commit against current position without fabricating omitted attempts', () => {
  const s = summary([insert('c', true, 0), insert(' ', false, 1, {commitsWord: true})]);
  assert.equal(s.keys.a.substitutions[' '], 1); assert.equal(s.attempts, 2); assert.equal(s.keys.t, undefined);
});
test('counts extra characters separately and excludes automatic input and deletion', () => {
  const s = summary([insert('c', true, 0), insert('!', false, 4), insert('\t', true, 1, {automatic: true}), deletion({automatic: true})]);
  assert.equal(s.extra, 1); assert.equal(s.attempts, 1); assert.equal(s.errors, 0); assert.equal(s.corrections, 0);
});
test('stop-on-error repeated mistakes remain separate attempts', () => {
  const s = summary([insert('x', false, 0, {inputStopped: true}), insert('z', false, 0, {inputStopped: true}), insert('c', true, 0)]);
  assert.equal(s.keys.c.attempts, 3); assert.equal(s.keys.c.errors, 2);
});
test('excludes events outside timer boundaries', () => {
  const s = summary([{...insert('x', false, 0), testMs: -1}, insert('c', true, 0), {...insert('x', false, 1), testMs: 101}]);
  assert.equal(s.attempts, 1); assert.equal(s.errors, 0);
});
test('uses each event word index after returning to a previous word', () => {
  const l = log([insert('c', true, 0), insert('d', true, 0, {wordIndex: 1}), deletion(), insert('x', false, 1)]);
  l.context.targetWords.push('dog');
  const s = analyze(l, config); assert.equal(s.keys.d.attempts, 1); assert.equal(s.keys.a.errors, 1);
});
test('rejects unknown schema and malformed event positions', () => {
  assert.throws(() => analyze({...log([]), version: 2}, config), /unsupported/);
  assert.throws(() => analyze(log([insert('x', false, -1)]), config), /Unexpected/);
});
test('excludes unsupported modes, composition, and opposite shift', () => {
  assert.match(analyze(log([], 'cat', {mode: 'zen'}), config).skip, /Zen/);
  assert.match(analyze(log([], 'cat', {bailedOut: true}), config).skip, /Bailed/);
  assert.match(analyze(log([{type: 'composition', data: {event: 'start'}}]), config).skip, /Composition/);
  assert.match(analyze(log([]), {...config, funbox: ['weakspot']}).skip, /Funbox/);
  assert.match(analyze(log([]), {...config, oppositeShiftMode: 'on'}).skip, /shift/);
});
test('deduplicates reloads and merges separate tests while preserving group separation', () => {
  const state = blank(), s = summary([insert('x', false, 0)]);
  assert.equal(merge(state, s), true); assert.equal(merge(state, s), false);
  merge(state, {...s, id: 'b'.repeat(64)});
  merge(state, {...s, id: 'c'.repeat(64), language: 'english_1k'});
  assert.equal(state.tests, 3); assert.equal(Object.keys(state.groups).length, 2);
  assert.equal(Object.values(state.groups)[0].keys.c.errors, 2);
  validateBackup(JSON.parse(JSON.stringify(state)));
});
test('backup rejects corrupt counts and supports long-term aggregates', () => {
  const state = blank(); merge(state, summary([insert('x', false, 0)]));
  const corrupt = structuredClone(state); Object.values(corrupt.groups)[0].keys.c.errors = 0;
  assert.throws(() => validateBackup(corrupt));
  const g = Object.values(state.groups)[0]; g.attempts = g.keys.c.attempts = 2000000;
  validateBackup(state);
});
test('invalid page messages cannot insert negative or mismatched counts', () => {
  const s = summary([insert('x', false, 0)]);
  assert.throws(() => validateSummary({...s, attempts: -1}));
  assert.throws(() => validateSummary({...s, id: 'not-an-id'}));
});
