/* An extension-owned hash on a real native route. Native links own engine lifecycle. */
(() => {
  "use strict";
  const hashes = ["#typing-mistakes", "#local-analytics"];
  const route = () => hashes.includes(location.hash);
  let host, controller, priorTitle, lastMain, opening, syncing = false, dataReady = false, initialFocusDone = false;
  const hidden = new Map();
  const marker = "data-mla-page";
  const initialRoute = route();
  let entryApproved = initialRoute;
  const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));
  function nativeLink(path) {return (path === "/" ? document.querySelector('header [data-nav-item="test"]') : null) || document.querySelector(`header a[href="${path}"]`);}
  async function navigate(path) {
    const link = nativeLink(path);
    if (!link) throw Error("Monkeytype navigation is not ready. Try again in a moment.");
    link.click();
    const start = performance.now();
    while (location.pathname !== path && performance.now() - start < 1800) await new Promise(resolve => setTimeout(resolve, 25));
    if (location.pathname !== path) throw Error("Monkeytype kept the current page open. Finish the test or wait for it to finish loading, then try again.");
  }
  function inspectAndFlush() {
    const channel = "monkeytype-local-analytics-v1", token = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      const cleanup = () => {clearTimeout(timer); window.removeEventListener("message", receive);};
      const receive = event => {
        if (event.source === window && event.origin === location.origin && event.data?.channel === channel && event.data.type === "navigation-ready" && event.data.value?.token === token) {cleanup(); resolve(event.data.value.activity);}
      };
      const timer = setTimeout(() => {cleanup(); reject(Error("A save is still pending. Keep this tab open and retry."));}, 4000);
      window.addEventListener("message", receive);
      window.postMessage({channel, type:"navigate-request", value:token}, location.origin);
    });
  }
  function announceError(message) {
    let box = document.querySelector("[data-mla-navigation-error]");
    if (!box) {
      box = document.createElement("div"); box.setAttribute("data-mla-navigation-error", ""); box.setAttribute("role", "alert");
      box.style.cssText = "position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);z-index:9999;max-width:90vw;padding:1rem;background:var(--sub-alt-color);color:var(--text-color);border:1px solid var(--error-color);border-radius:.5rem";
      document.body.append(box);
    }
    box.textContent = message; setTimeout(() => box.remove(), 8000);
  }
  function open() {
    if (opening) return opening;
    if (host && route()) {host.shadowRoot.querySelector("h1").focus(); return Promise.resolve();}
    const menu = document.querySelector("[data-monkeytype-local-analytics]");
    menu?.setAttribute("aria-busy", "true");
    opening = (async () => {
      const activity = await inspectAndFlush();
      // Idle pages need no reload or authentication rehydration. An active test
      // leaves through an existing native Link, preserving no-quit/busy guards.
      if (activity !== "idle") {
        await navigate("/about");
        entryApproved = true; location.replace("#typing-mistakes");
      } else {
        entryApproved = true;
        if (!route()) location.hash = "typing-mistakes";
      }
      await sync();
    })().finally(() => {opening = undefined; menu?.removeAttribute("aria-busy");});
    return opening;
  }
  function restore() {
    controller?.dispose(); controller = undefined; dataReady = false; initialFocusDone = false;
    host?.remove(); host = undefined;
    for (const [node, value] of hidden) {node.style.display = value.display; node.inert = value.inert;}
    hidden.clear();
    if (priorTitle && document.title === "Typing mistakes | Monkeytype") document.title = priorTitle;
    priorTitle = undefined;
  }
  async function sync() {
    if (!route()) {entryApproved = false; if (host) restore(); return;}
    if (syncing) return;
    syncing = true;
    try {
      if (!entryApproved) {
        const activity = await inspectAndFlush();
        if (activity !== "idle") {await navigate("/about"); location.replace("#typing-mistakes");}
        entryApproved = true;
      }
      if (location.hash === "#local-analytics") {location.replace("#typing-mistakes");}
      const main = document.querySelector("main");
      if (!main || !route()) return;
      if (host && (!host.isConnected || main !== lastMain)) restore();
      if (!host) {
        lastMain = main; priorTitle = document.title;
        host = document.createElement("section"); host.setAttribute(marker, "");
        host.style.cssText = "display:block;grid-column:content;min-width:0;width:100%";
        const root = host.attachShadow({mode:"open"});
        const style = document.createElement("style"); style.textContent = globalThis.MLAViewAssets.css + "\n" + globalThis.MLAViewAssets.integratedCss;
        const template = document.createElement("template"); template.innerHTML = globalThis.MLAViewAssets.html;
        root.append(style, template.content.cloneNode(true));
        root.querySelector("#expand").hidden = true;
        root.querySelector("main").setAttribute("role","region");
        root.querySelector("main").setAttribute("aria-label","Typing mistakes");
        root.querySelector(".back").addEventListener("click", event => {event.preventDefault(); void navigate("/").then(async () => {
          if (route()) location.hash = "";
          await sync(); await nextFrame();
          document.querySelector('[data-nav-item="test"]')?.focus();
        }).catch(error => announceError(error.message));});
        for (const link of root.querySelectorAll('[data-go-typing]')) link.addEventListener("click", event => {event.preventDefault(); root.querySelector(".back").click();});
        for (const type of ["keydown", "keyup", "keypress", "beforeinput", "input"]) root.addEventListener(type, event => {
          const control = event.composedPath()[0];
          // Escape belongs to a native select while it is being used; elsewhere
          // preserve the site's command palette, including modifier releases.
          if ((type === "keydown" || type === "keyup") &&
              ((event.key === "Escape" && control?.tagName !== "SELECT") || ["Control","Meta","Shift","Alt"].includes(event.key) || ((event.ctrlKey || event.metaKey) && event.shiftKey && event.code === "KeyP"))) return;
          event.stopPropagation();
        });
        main.append(host);
        controller = globalThis.MLAView.mount(root, true);
        const currentHost = host;
        void controller.ready.then(() => {if (host === currentHost && route()) {dataReady=true;controller.restorePosition();requestAnimationFrame(()=>void sync());}});
      }
      host.style.colorScheme = document.body.classList.contains("darkMode") ? "dark" : "light";
      document.title = "Typing mistakes | Monkeytype";
      if (dataReady && !initialFocusDone && !document.body.classList.contains("loading") && !document.querySelector("footer")?.inert && !document.querySelector("dialog[open]")) {
        initialFocusDone = true;
        if (!host.shadowRoot.activeElement) host.shadowRoot.querySelector("h1").focus({preventScroll:true});
      }
      for (const child of main.children) if (child !== host && !hidden.has(child)) {
        hidden.set(child, {display:child.style.display, inert:child.inert}); child.style.display = "none"; child.inert = true;
      }
    } catch (error) {announceError(error.message);}
    finally {syncing = false;}
  }
  globalThis.MLAIntegration = {open};
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (sender.id !== chrome.runtime.id || message.type !== "open-analytics") return;
    open().then(() => respond({ok:true}), error => {announceError(error.message); respond({ok:false,error:error.message});});
    return true;
  });
  window.addEventListener("hashchange", () => void sync()); window.addEventListener("popstate", () => void sync());
  // Watch the actual URL without replacing history methods or private router APIs.
  let lastUrl = location.href;
  setInterval(() => {if (lastUrl !== location.href) {lastUrl = location.href; void sync();}}, 50);
  let queued = false;
  new MutationObserver(() => {
    if (!route() || queued) return;
    queued = true; requestAnimationFrame(() => {queued = false; void sync();});
  }).observe(document.body, {childList:true,subtree:true,attributes:true,attributeFilter:["inert"]});
  new MutationObserver(() => {if (host) host.style.colorScheme = document.body.classList.contains("darkMode") ? "dark" : "light";void sync();}).observe(document.body,{attributes:true,attributeFilter:["class"]});
  void sync();
})();
