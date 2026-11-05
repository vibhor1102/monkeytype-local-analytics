(() => {
  "use strict";
  const channel = "monkeytype-local-analytics-v1";
  let lastLog, pending, busy = false, lastStatus = "", stopped = false;
  const post = (type, value) => window.postMessage({channel, type, value}, location.origin);
  function status(message) {
    if (lastStatus !== message) {lastStatus = message; post("status", message);}
  }
  // Reads only the test log and non-account settings. Does not wrap or replace app functions.
  async function check() {
    if (busy || stopped) return;
    if (pending) {post("summary", pending); return;}
    if (typeof window.lastEventLog !== "function") {status("Waiting for Monkeytype's event-log hook. Reload the page if this persists."); return;}
    status("Ready — finished tests are collected locally.");
    const log = window.lastEventLog();
    if (!log || log === lastLog) return;
    busy = true;
    try {
      const core = globalThis.MonkeytypeLocalAnalyticsCore;
      const result = core.analyze(log, window.config || {});
      lastLog = log;
      if (result.skip) {status(result.skip); return;}
      const bytes = new TextEncoder().encode(JSON.stringify(log));
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      result.id = Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, "0")).join("");
      core.validateSummary(result);
      pending = result;
      post("summary", pending);
    } catch (error) {
      lastLog = log;
      status(error.message);
    } finally {busy = false;}
  }
  window.addEventListener("message", event => {
    if (event.source !== window || event.origin !== location.origin || event.data?.channel !== channel) return;
    if (event.data.type === "ack" && event.data.value === pending?.id) {
      pending = undefined;
      status("Saved — your latest test is in local analytics.");
    }
    if (event.data.type === "relay-ready") {lastStatus = ""; void check();}
    if (event.data.type === "stop") stopped = true;
  });
  // Retain the last outcome until the next log, rather than hiding skipped tests.
  setInterval(() => {
    if (!pending && lastLog && typeof window.lastEventLog === "function" && window.lastEventLog() === lastLog) return;
    void check();
  }, 750);
  void check();
})();
