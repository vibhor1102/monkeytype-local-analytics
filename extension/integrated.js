/* Same-tab hash destination; no router/engine monkey-patching or page-world data API. */
(() => {
  "use strict";
  const route = () => location.pathname === "/" && ["#typing-mistakes", "#local-analytics"].includes(location.hash);
  let canMount = route();
  let host, dispose, hidden = new Map(), priorTitle, lastMain;
  const marker = "data-mla-page";
  async function open() {
    if (route()) {sync(); return;}
    // Flush the last completed test before a full navigation can discard its log.
    const channel = "monkeytype-local-analytics-v1", token = crypto.randomUUID();
    await new Promise((resolve, reject) => {
      const cleanup = () => {clearTimeout(timer); window.removeEventListener("message", receive);};
      const receive = event => {
        if (event.source === window && event.origin === location.origin && event.data?.channel === channel && event.data.type === "navigation-ready" && event.data.value === token) {cleanup(); resolve();}
      };
      const timer = setTimeout(() => {cleanup(); reject(Error("Saving is still pending. Keep this tab open and try again."));}, 4000);
      window.addEventListener("message", receive);
      window.postMessage({channel, type:"navigate-request", value:token}, location.origin);
    });
    // A real document navigation ends an active test through its normal lifecycle.
    const hashOnly = location.pathname === "/" && !location.search;
    location.assign("/#typing-mistakes");
    if (hashOnly) location.reload();
  }
  function restore() {
    dispose?.(); dispose = undefined; host?.remove(); host = undefined;
    for (const [node, value] of hidden) {
      node.style.display = value.display;
      node.inert = value.inert;
    }
    hidden.clear();
    if (priorTitle && document.title === "Typing mistakes | Monkeytype") document.title = priorTitle;
    priorTitle = undefined;
  }
  function sync() {
    if (!route()) {canMount = false; if (host) restore(); return;}
    if (!canMount) {location.reload(); return;}
    if (location.hash === "#local-analytics") {location.replace("#typing-mistakes"); return;}
    const main = document.querySelector("main");
    if (!main) return;
    if (host && (!host.isConnected || main !== lastMain)) restore();
    if (!host) {
      lastMain = main; priorTitle = document.title;
      host = document.createElement("section"); host.setAttribute(marker, "");
      host.style.cssText = "display:block;grid-column:content;min-width:0;width:100%";
      const root = host.attachShadow({mode: "open"});
      const style = document.createElement("style");
      style.textContent = globalThis.MLAViewAssets.css + "\n" + globalThis.MLAViewAssets.integratedCss;
      const template = document.createElement("template"); template.innerHTML = globalThis.MLAViewAssets.html;
      root.append(style, template.content.cloneNode(true));
      root.querySelector("header").innerHTML = '<h1 tabindex="-1"><svg viewBox="0 0 128 128" aria-hidden="true"><path d="M12 112V76h24v36zm40 0V44h24v68zm40 0V12h24v100z"/></svg>typing mistakes</h1><a class="back" href="/">back to typing →</a>';
      const scope = document.createElement("p"); scope.className = "scope";
      scope.innerHTML = '<strong>On this browser</strong> · Not synced with your Monkeytype account. <a href="#data-details">About this data</a>';
      root.querySelector("header").after(scope);
      const intro = root.querySelector(".intro"); intro.textContent = "See which characters trip you up, including mistakes you corrected."; intro.className = "mistakes-intro";
      root.querySelector("#keys-title").textContent = "Where mistakes happen";
      const details = root.querySelector("details"); details.id = "data-details";
      scope.querySelector("a").addEventListener("click", event => {event.preventDefault(); details.open = true; details.querySelector("summary").focus(); details.scrollIntoView({block:"nearest"});});
      root.querySelector("#table-wrap").tabIndex = 0;
      root.querySelector("#table-wrap").setAttribute("aria-label", "Character breakdown. Scroll horizontally for more columns.");
      const emptyLink = root.querySelector("#empty a"); emptyLink.removeAttribute("target"); emptyLink.href = "/"; emptyLink.textContent = "Back to typing";
      root.querySelector("#empty p").lastChild.textContent = " and finish a standard test. Corrected mistakes count too.";
      // Keep filter typing and keyboard controls out of Monkeytype's global shortcuts.
      for (const type of ["keydown", "keyup", "keypress", "beforeinput", "input"]) root.addEventListener(type, event => {
        // Preserve Monkeytype's command palette while isolating test shortcuts.
        if (type === "keydown" && (event.key === "Escape" || ((event.ctrlKey || event.metaKey) && event.shiftKey && event.code === "KeyP"))) return;
        event.stopPropagation();
      });
      main.append(host);
      dispose = globalThis.MLAView.mount(root, true);
      root.querySelector("h1").focus({preventScroll: true});
    }
    host.style.colorScheme = document.body.classList.contains("darkMode") ? "dark" : "light";
    document.title = "Typing mistakes | Monkeytype";
    // Leave the site's shell intact. Suppress only its routed content; restore the
    // exact inline display/inert values when normal SPA navigation leaves our hash.
    for (const child of main.children) if (child !== host && !hidden.has(child)) {
      hidden.set(child, {display: child.style.display, inert: child.inert});
      child.style.display = "none"; child.inert = true;
    }
  }
  globalThis.MLAIntegration = {open};
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (sender.id !== chrome.runtime.id || message.type !== "open-analytics") return;
    respond({ok: true}); setTimeout(() => void open().catch(error => {
      const button = document.querySelector("[data-monkeytype-local-analytics]");
      if (button) button.title = error.message;
    }), 0);
  });
  window.addEventListener("hashchange", sync);
  window.addEventListener("popstate", sync);
  // SPA pushState does not emit a browser event. Poll only the URL, without
  // wrapping the site's history methods or inspecting its internal router.
  let lastUrl = location.href;
  setInterval(() => {if (lastUrl !== location.href) {lastUrl = location.href; sync();}}, 150);
  let queued = false;
  new MutationObserver(() => {
    if (!route() || queued) return;
    queued = true; setTimeout(() => {queued = false; sync();}, 100);
  }).observe(document.body, {childList:true, subtree:true});
  new MutationObserver(() => {if (host) host.style.colorScheme = document.body.classList.contains("darkMode") ? "dark" : "light";}).observe(document.body, {attributes:true, attributeFilter:["class"]});
  sync();
})();
