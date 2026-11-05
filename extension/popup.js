"use strict";
document.getElementById("open").addEventListener("click", async () => {
  try {
    const result = await chrome.runtime.sendMessage({type: "open-integrated"});
    if (!result?.ok) throw Error(result?.error || "Could not open Typing mistakes.");
    window.close();
  } catch (error) {document.getElementById("summary").textContent = error.message;}
});
chrome.runtime.sendMessage({type: "get"}).then(result => {
  document.getElementById("summary").textContent = result?.ok ? `${(result.analytics?.tests || 0).toLocaleString()} tests saved · View your character breakdown and practice focus.` : "Could not read analytics. Open the dashboard for recovery.";
}).catch(() => {document.getElementById("summary").textContent = "Reload this extension to reconnect.";});
