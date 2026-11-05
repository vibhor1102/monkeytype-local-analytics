/* Shared, dependency-free accounting. No network or browser APIs. */
(() => {
  "use strict";
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const dict = () => Object.create(null);
  const label = (value, fallback) => typeof value === "string" && value.length <= 100 ? value : fallback;
  const blank = () => ({version: 1, groups: {}, seen: [], tests: 0, updated: null});

  function analyze(log, config = {}) {
    if (!log || log.version !== 1 || !Array.isArray(log.events) || !Array.isArray(log.context?.targetWords)) {
      throw new Error("Monkeytype's event format is unsupported. No data collected.");
    }
    if (log.context.mode === "zen") return {skip: "Zen has no target text."};
    if (log.context.bailedOut) return {skip: "Bailed-out tests are excluded."};
    if (log.context.koreanStatus || log.events.some(e => e.type === "composition" || e.data?.isCompositionEnding || e.data?.inputType === "insertCompositionText")) {
      return {skip: "Composition input is not supported yet."};
    }
    if (Array.isArray(config.funbox) && config.funbox.length) return {skip: "Funbox tests are excluded."};
    if (config.oppositeShiftMode && config.oppositeShiftMode !== "off") return {skip: "Opposite-shift tests are excluded."};
    const start = log.events.find(e => e.type === "timer" && e.data?.event === "start");
    const end = log.events.find(e => e.type === "timer" && e.data?.event === "end");
    if (!start || !end || !Number.isFinite(start.data.date)) return {skip: "Waiting for a finished test."};
    const keys = dict();
    let extra = 0, attempts = 0, errors = 0, corrections = 0;
    for (const event of log.events) {
      if (event.type !== "input" || event.testMs < start.testMs || event.testMs > end.testMs) continue;
      const d = event.data;
      if (d.automatic) continue;
      if (d.inputType === "deleteContentBackward" || d.inputType === "deleteWordBackward") {
        corrections++;
        continue;
      }
      if (d.inputType !== "insertText") continue;
      if (!Number.isInteger(d.wordIndex) || !Number.isInteger(d.charIndex) || d.wordIndex < 0 || d.charIndex < 0 || typeof d.data !== "string" || typeof d.correct !== "boolean") {
        throw new Error("Unexpected input event. Test excluded.");
      }
      const word = log.context.targetWords[d.wordIndex];
      if (typeof word !== "string") throw new Error("Missing target word. Test excluded.");
      const expected = word[d.charIndex];
      // No target at this position: extra keystroke, not an invented letter error.
      if (expected === undefined) { extra++; continue; }
      // UTF-16 surrogate input requires grapheme-aware accounting. Exclude it.
      if (d.data.length !== 1 || /[\uD800-\uDFFF]/.test(expected + d.data)) return {skip: "This test needs Unicode composition support."};
      if (!own(keys, expected)) keys[expected] = {attempts: 0, errors: 0, substitutions: dict()};
      const row = keys[expected];
      row.attempts++; attempts++;
      if (!d.correct) {
        row.errors++; errors++;
        row.substitutions[d.data] = (row.substitutions[d.data] || 0) + 1;
      }
    }
    if (!attempts) return {skip: "No supported character attempts."};
    return {
      started: start.data.date,
      ended: Number.isFinite(end.data.date) ? end.data.date : start.data.date,
      language: label(config.language, "unknown"),
      layout: label(config.layout, "default"),
      mode: label(log.context.mode, "unknown"),
      keys, attempts, errors, extra, corrections
    };
  }

  function validateSummary(s, maximumAttempts = 1000000) {
    if (!s || !/^[a-f0-9]{64}$/.test(s.id) || !Number.isFinite(s.started) || !Number.isFinite(s.ended)) throw new Error("Invalid test identity.");
    for (const name of ["language", "layout", "mode"]) if (typeof s[name] !== "string" || !s[name].length || s[name].length > 100) throw new Error("Invalid test settings.");
    let attempts = 0, errors = 0;
    if (!s.keys || typeof s.keys !== "object" || Array.isArray(s.keys) || Object.keys(s.keys).length > 1000) throw new Error("Invalid character data.");
    for (const [key, row] of Object.entries(s.keys)) {
      if (key.length !== 1 || !row || !Number.isSafeInteger(row.attempts) || row.attempts < 1 || !Number.isSafeInteger(row.errors) || row.errors < 0 || row.errors > row.attempts) throw new Error("Invalid character counts.");
      if (!row.substitutions || typeof row.substitutions !== "object" || Array.isArray(row.substitutions)) throw new Error("Invalid substitutions.");
      let total = 0;
      for (const [typed, count] of Object.entries(row.substitutions)) {
        if (typed.length !== 1 || !Number.isSafeInteger(count) || count < 1) throw new Error("Invalid substitution count.");
        total += count;
      }
      if (total !== row.errors) throw new Error("Inconsistent error counts.");
      attempts += row.attempts; errors += row.errors;
    }
    if (attempts !== s.attempts || errors !== s.errors || !attempts || !Number.isSafeInteger(attempts) || attempts > maximumAttempts) throw new Error("Inconsistent test counts.");
    for (const name of ["extra", "corrections"]) if (!Number.isSafeInteger(s[name]) || s[name] < 0 || s[name] > maximumAttempts) throw new Error("Invalid correction counts.");
    return s;
  }

  function merge(state, summary) {
    validateSummary(summary);
    if (state.seen.includes(summary.id)) return false;
    const groupId = JSON.stringify([summary.language, summary.layout, summary.mode]);
    if (!own(state.groups, groupId)) state.groups[groupId] = {
      language: summary.language, layout: summary.layout, mode: summary.mode,
      tests: 0, attempts: 0, errors: 0, extra: 0, corrections: 0, keys: dict()
    };
    const group = state.groups[groupId];
    for (const [key, row] of Object.entries(summary.keys)) {
      if (!own(group.keys, key)) group.keys[key] = {attempts: 0, errors: 0, substitutions: dict()};
      const dest = group.keys[key];
      dest.attempts += row.attempts; dest.errors += row.errors;
      for (const [typed, count] of Object.entries(row.substitutions)) dest.substitutions[typed] = (dest.substitutions[typed] || 0) + count;
    }
    for (const field of ["attempts", "errors", "extra", "corrections"]) group[field] += summary[field];
    group.tests++; state.tests++; state.updated = summary.ended;
    // Bounded deduplication cache, not a history of the text typed.
    state.seen = [...state.seen.slice(-9999), summary.id];
    return true;
  }

  function validateBackup(state) {
    if (!state || state.version !== 1 || !state.groups || typeof state.groups !== "object" || Array.isArray(state.groups) || !Array.isArray(state.seen) || state.seen.length > 10000 || state.seen.some(id => !/^[a-f0-9]{64}$/.test(id))) throw new Error("Unsupported backup.");
    let tests = 0;
    for (const [id, g] of Object.entries(state.groups)) {
      if (id !== JSON.stringify([g.language, g.layout, g.mode]) || !Number.isSafeInteger(g.tests) || g.tests < 1) throw new Error("Invalid backup group.");
      validateSummary({...g, id: "0".repeat(64), started: 0, ended: 0}, Number.MAX_SAFE_INTEGER);
      tests += g.tests;
    }
    if (state.tests !== tests || !(state.updated === null || Number.isFinite(state.updated))) throw new Error("Invalid backup totals.");
    return state;
  }
  globalThis.MonkeytypeLocalAnalyticsCore = {analyze, blank, merge, validateSummary, validateBackup};
  if (typeof module !== "undefined") module.exports = globalThis.MonkeytypeLocalAnalyticsCore;
})();
