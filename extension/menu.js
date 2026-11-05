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

    const button = document.createElement("a");
    button.href = "/#typing-mistakes";
    // Reuse the actual menu item's classes so theme, hover and focus match.
    button.className = anchor.className;
    button.setAttribute(marker, "");
    button.dataset.uiElement = "button";
    button.dataset.uiVariant = "button";
    button.title = "Character mistakes stored in this browser";
    const icon = document.createElement("i");
    icon.className = "fas fa-chart-bar fa-fw";
    icon.setAttribute("aria-hidden", "true");
    button.append(icon, document.createTextNode("Typing mistakes"));
    button.addEventListener("click", event => {
      if (!event.isTrusted || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      void globalThis.MLAIntegration.open().catch(error => {
        button.title = error.message;
        button.textContent = "Save pending — try again";
        setTimeout(() => button.replaceChildren(icon, document.createTextNode("Typing mistakes")), 4000);
      });
    });
    anchor.after(button);
    currentAnchor = anchor;
    currentButton = button;
  }

  // Account menus can be recreated on sign-in or navigation without a reload.
  let scheduled = false;
  new MutationObserver(() => {
    if (currentButton?.isConnected && currentAnchor?.isConnected && currentButton.previousElementSibling === currentAnchor) return;
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {scheduled = false; mount();}, 250);
  }).observe(document.body, {childList: true, subtree: true});
  mount();
})();
