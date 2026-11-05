"use strict";
document.getElementById("open").addEventListener("click", async () => {await chrome.runtime.openOptionsPage(); window.close();});
chrome.runtime.sendMessage({type: "get"}).then(result => {
  document.getElementById("summary").textContent = result?.ok ? `${(result.analytics?.tests || 0).toLocaleString()} tests saved · View your character breakdown and practice focus.` : "Could not read analytics. Open the dashboard for recovery.";
}).catch(() => {document.getElementById("summary").textContent = "Reload this extension to reconnect.";});
