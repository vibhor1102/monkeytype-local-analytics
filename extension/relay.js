(() => {
  "use strict";
  const channel = "monkeytype-local-analytics-v1";
  let inFlight = false;
  window.addEventListener("message", async event => {
    if (event.source !== window || event.origin !== location.origin || event.data?.channel !== channel) return;
    const {type, value} = event.data;
    if (type !== "summary" && type !== "status") return;
    if (type === "summary" && inFlight) return;
    if (type === "summary") inFlight = true;
    try {
      const response = await chrome.runtime.sendMessage({type, value});
      if (response?.ok && type === "summary") window.postMessage({channel, type: "ack", value: value.id}, location.origin);
      if (!response?.ok && type === "summary") await chrome.runtime.sendMessage({type: "status", value: `Could not save analytics: ${response?.error || "unknown error"}`.slice(0, 300)});
    } catch {
      // Extension reload invalidated this context. A page reload reconnects it.
      window.postMessage({channel, type: "stop"}, location.origin);
    } finally {inFlight = false;}
  });
  window.postMessage({channel, type: "relay-ready"}, location.origin);
})();
