(() => {
  "use strict";
  if (window.__mlaCollector) return;
  window.__mlaCollector = true;
  const channel = "monkeytype-local-analytics-v1", core = globalThis.MonkeytypeLocalAnalyticsCore;
  const pending = [], contexts = new Map();
  let navigation;
  let lastLog, initialized = false, busy = false, stopped = false;
  let lastStatus = "Connected — finish a new standard test to collect.", lastPosted = 0;
  const post = (type, value) => window.postMessage({channel, type, value}, location.origin);
  function status(message) {lastStatus = message; lastPosted = Date.now(); post("status", message);}
  const settings = () => ({language: window.config?.language, layout: window.config?.layout,
    funbox: [...(window.config?.funbox || [])], oppositeShiftMode: window.config?.oppositeShiftMode});
  // Snapshot settings on user input, before a completed test's settings can change.
  document.addEventListener("keydown", event => {
    if (!event.isTrusted || stopped) return;
    const config = settings();
    setTimeout(() => {
      try {
        const active = window.currentEventLog?.();
        const start = active?.events?.find(e => e.type === "timer" && e.data?.event === "start");
        if (start && !contexts.has(start.data.date)) {
          contexts.set(start.data.date, config);
          if (contexts.size > 100) contexts.delete(contexts.keys().next().value);
        }
      } catch {status("Cannot read the active test. Reload Monkeytype; collection is paused.");}
    }, 0);
  }, true);
  function navigationReady() {
    if (navigation && !pending.length && !busy) {
      post("navigation-ready", navigation); navigation = undefined;
    }
  }
  async function check() {
    if (busy || stopped) return;
    busy = true;
    try {
      if (pending.length) post("summary", pending[0]);
      if (typeof window.lastEventLog !== "function") {status("Waiting for Monkeytype. Reload this tab if collection stays disconnected."); return;}
      const log = window.lastEventLog();
      // Never classify a pre-install/reload log using today's settings.
      if (!initialized) {lastLog = log; initialized = true; status(lastStatus); return;}
      if (!log || log === lastLog) return;
      if (pending.length >= 100) {status("Save queue is full. Export a backup and free browser storage; keep this tab open."); return;}
      const start = log.events?.find(e => e.type === "timer" && e.data?.event === "start");
      const config = contexts.get(start?.data?.date);
      lastLog = log;
      if (!config) {status("Test excluded: settings were not captured. Start a new test in this tab."); return;}
      const result = core.analyze(log, config);
      if (result.skip) {status(result.skip); return;}
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(log)));
      result.id = Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, "0")).join("");
      core.validateSummary(result); pending.push(result); post("summary", pending[0]);
    } catch (error) {status(String(error.message).slice(0, 300));}
    finally {busy = false; if (Date.now() - lastPosted > 15000) status(lastStatus); navigationReady();}
  }
  window.addEventListener("message", event => {
    if (event.source !== window || event.origin !== location.origin || event.data?.channel !== channel) return;
    if (event.data.type === "ack" && event.data.value === pending[0]?.id) {
      pending.shift(); status(pending.length ? "Saving queued tests… Keep this tab open." : "Saved — your latest test is in Typing mistakes.");
      if (pending.length) post("summary", pending[0]);
      navigationReady();
    }
    if (event.data.type === "navigate-request" && typeof event.data.value === "string" && event.data.value.length < 100) {
      navigation = event.data.value; void check();
    }
    if (event.data.type === "relay-ready") {lastPosted = 0; void check();}
    if (event.data.type === "stop") stopped = true;
  });
  setInterval(() => void check(), 750);
  void check();
})();
