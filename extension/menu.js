(() => {
  "use strict";
  const marker = "data-monkeytype-local-analytics";
  let currentAnchor, currentButton;

  function mount() {
    // Most page mutations are typing updates. Avoid scanning them once mounted.
    if (currentButton?.isConnected && currentAnchor?.isConnected && currentButton.previousElementSibling === currentAnchor) return;
    const anchor = document.querySelector('[data-ui-element="accountMenu"] a[href="/account"]');
    if (!anchor) return;
    const existing = anchor.parentElement.querySelector(`[${marker}]`);
    if (existing) {currentAnchor = anchor; currentButton = existing; return;}

    const button = document.createElement("button");
    button.type = "button";
    // Reuse the actual menu item's classes so theme, hover and focus match.
    button.className = anchor.className;
    button.setAttribute(marker, "");
    button.dataset.uiElement = "button";
    button.dataset.uiVariant = "button";
    button.title = "Character mistakes stored in this browser";
    const icon = document.createElement("i");
    icon.className = "fas fa-chart-bar fa-fw";
    icon.setAttribute("aria-hidden", "true");
    button.append(icon, document.createTextNode("Local analytics"));
    button.addEventListener("click", async event => {
      // The website cannot open extension pages through synthetic clicks.
      if (!event.isTrusted) return;
      try {
        const response = await chrome.runtime.sendMessage({type: "open-dashboard"});
        if (!response?.ok) throw new Error(response?.error || "Could not open analytics");
      } catch {
        button.replaceChildren(document.createTextNode("Reload for analytics"));
        button.title = "Reload Monkeytype to reconnect the updated extension";
      }
    });
    anchor.after(button);
    currentAnchor = anchor;
    currentButton = button;
  }

  // Account menus can be recreated on sign-in or navigation without a reload.
  new MutationObserver(mount).observe(document.body, {childList: true, subtree: true});
  mount();
})();
