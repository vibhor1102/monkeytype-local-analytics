"use strict";
importScripts("core.js");
const core = globalThis.MonkeytypeLocalAnalyticsCore;
let queue = Promise.resolve();
const serialize = operation => {
  const result = queue.then(operation);
  queue = result.catch(() => {});
  return result;
};
async function saveStatus(tabId, message) {
  const {collectorTabs = {}} = await chrome.storage.session.get("collectorTabs");
  collectorTabs[tabId] = {message, at: Date.now()};
  for (const [id, value] of Object.entries(collectorTabs)) if (Date.now() - value.at > 60000) delete collectorTabs[id];
  await chrome.storage.session.set({collectorTabs});
}
chrome.tabs.onRemoved.addListener(id => serialize(async () => {
  const {collectorTabs = {}} = await chrome.storage.session.get("collectorTabs");
  delete collectorTabs[id]; await chrome.storage.session.set({collectorTabs});
}));
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  const fromSite = sender.tab && sender.frameId === 0 && sender.url?.startsWith("https://monkeytype.com/");
  const fromDashboard = ["dashboard.html", "popup.html"].some(path => sender.url === chrome.runtime.getURL(path));
  if (!fromSite && !fromDashboard) return;
  serialize(async () => {
    if (fromSite && message.type === "open-dashboard") {
      await chrome.runtime.openOptionsPage();
      return {ok: true};
    }
    if (fromSite && message.type === "status") {
      if (typeof message.value !== "string" || message.value.length > 300) throw new Error("Invalid status.");
      await saveStatus(sender.tab.id, message.value);
      return {ok: true};
    }
    if (fromSite && message.type === "summary") {
      core.validateSummary(message.value);
      const {analytics = core.blank()} = await chrome.storage.local.get("analytics");
      const added = core.merge(analytics, message.value);
      if (added) await chrome.storage.local.set({analytics});
      await saveStatus(sender.tab.id, "Saved — your latest test is in local analytics.");
      return {ok: true, added};
    }
    if (!fromDashboard) throw new Error("Unsupported request.");
    if (message.type === "get") {
      return {ok: true, ...(await chrome.storage.local.get(["analytics", "undo"])), ...(await chrome.storage.session.get("collectorTabs"))};
    }
    if (message.type === "restore") {
      const replacement = core.validateBackup(message.value);
      const {analytics = core.blank()} = await chrome.storage.local.get("analytics");
      await chrome.storage.local.set({undo: analytics, analytics: replacement});
      return {ok: true};
    }
    if (message.type === "reset") {
      const {analytics = core.blank()} = await chrome.storage.local.get("analytics");
      const fresh = core.blank();
      fresh.seen = analytics.seen;
      await chrome.storage.local.set({undo: analytics, analytics: fresh});
      return {ok: true};
    }
    if (message.type === "undo") {
      const {undo, analytics = core.blank()} = await chrome.storage.local.get(["undo", "analytics"]);
      if (!undo) throw new Error("No previous data to restore.");
      await chrome.storage.local.set({analytics: undo, undo: analytics});
      return {ok: true};
    }
    throw new Error("Unsupported request.");
  }).then(respond, error => respond({ok: false, error: error.message}));
  return true;
});
// Keep extension-local aggregates inaccessible to other content scripts by default.
chrome.storage.local.setAccessLevel({accessLevel: "TRUSTED_CONTEXTS"});
