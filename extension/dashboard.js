/* Shared isolated controller. Build prepends the canonical markup/style assets. */
(() => {
  "use strict";
  globalThis.MLAView = {mount(root, embedded = false) {
    const core = globalThis.MonkeytypeLocalAnalyticsCore, $ = id => root.getElementById(id);
    const main = root.querySelector("main"), mountedAt = Date.now(), prefKey = "mla:view:v2";
    let state, revision, errorType, loaded = false, canRestore = false, busy = false, disposed = false, prefsApplied = false;
    let refreshing, refreshAgain = false, renderDeferred = false, persistTimer, readyResolve;
    let saved = {}, positionCaptured = false;
    const narrow = matchMedia("(max-width:1050px)");
    let showAll = false;
    try {
      const value = JSON.parse(sessionStorage.getItem(prefKey) || "{}");
      if (value && typeof value === "object" && !Array.isArray(value)) saved = value;
    } catch { /* Preferences are optional, never analytics. */ }
    const ready = new Promise(resolve => readyResolve = resolve);
    const num = n => n.toLocaleString();
    const char = c => ({" ":"Space","\n":"Enter","\t":"Tab"}[c] || c);
    const controls = ["export","restore","reset","undo"];
    function controlsState() {for (const id of controls) $(id).disabled = (id==="restore" ? !canRestore : !loaded) || busy; main.setAttribute("aria-busy", String(!loaded || busy));}
    function notice(text) {$("notice").textContent = text;}
    function error(text, kind = "action") {errorType=kind; $("retry").textContent=kind==="load"?"Retry":"Reload data"; $("alert-text").textContent = text; $("alert").hidden = false;}
    function clearError() {errorType=undefined; $("alert").hidden = true;}
    async function request(type, value, expectedRevision) {
      let result;
      try {result = await chrome.runtime.sendMessage(embedded ? {type:"view",operation:type,value,expectedRevision} : {type,value,expectedRevision});}
      catch (cause) {
        if (embedded && /context invalidated|receiving end|connection/i.test(cause.message)) throw Error("Extension updated or disconnected. Reload this Monkeytype tab to reconnect.");
        throw cause;
      }
      if (!result?.ok) throw Error(result?.error || "The extension did not respond. Try again.");
      return result;
    }
    function savePosition() {
      if (!loaded || disposed) return;
      const active = root.activeElement;
      const value = {language:$("language").value,layout:$("layout").value,sort:$("sort").value,minimum:$("minimum").value,
        scroll:window.scrollY,focus:active?.id || "",showAll};
      try {sessionStorage.setItem(prefKey,JSON.stringify(value)); saved = value;} catch { /* No storage permission for preferences is needed. */ }
    }
    function persist() {clearTimeout(persistTimer); persistTimer = setTimeout(savePosition,100);}
    function options(id, values, first) {
      const select = $(id), current = select.value, sorted = [...values].sort();
      const old = [...select.options].slice(1).map(o => o.value);
      if (JSON.stringify(old) === JSON.stringify(sorted)) return;
      if (root.activeElement === select) {renderDeferred = true; return;}
      select.replaceChildren(new Option(first,""),...sorted.map(v => new Option(v,v)));
      if (sorted.includes(current)) select.value = current;
    }
    function applyPrefs() {
      if (prefsApplied) return;
      for (const id of ["language","layout"]) if (typeof saved[id] === "string" && [...$(id).options].some(o => o.value === saved[id])) $(id).value = saved[id];
      if (["errors","rate","attempts"].includes(saved.sort)) $("sort").value = saved.sort;
      const min = Number(saved.minimum); if (Number.isSafeInteger(min) && min >= 1 && min <= 1000000) $("minimum").value = String(min);
      showAll = saved.showAll === true;
      prefsApplied = true;
    }
    const rowNodes = new Map(), expanded = new Set();
    function renderRows(rows) {
      if ($("table-wrap").contains(root.activeElement)) {renderDeferred = true; return;}
      const used = new Set();
      for (const row of rows) {
        used.add(row.key);
        let tr = rowNodes.get(row.key);
        if (!tr) {tr = document.createElement("tr"); for (let i=0;i<5;i++) tr.append(document.createElement("td")); rowNodes.set(row.key,tr);}
        const cells = tr.children;
        if (tr.dataset.value !== JSON.stringify([row.attempts,row.errors,[...row.substitutions]])) {
          tr.dataset.value = JSON.stringify([row.attempts,row.errors,[...row.substitutions]]);
          const key = document.createElement("kbd"); key.textContent = char(row.key); cells[0].replaceChildren(key);
          cells[1].textContent = num(row.errors); cells[1].className = row.errors ? "error-count" : "";
          cells[2].textContent = num(row.attempts);
          if (row.attempts < 20) {const small = document.createElement("span"); small.className = "sample"; small.textContent = "small sample"; cells[2].append(small);}
          cells[3].textContent = (100 * row.errors / row.attempts).toFixed(1) + "%";
          const subs = [...row.substitutions].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]));
          if (subs.length > 3) {
            const detail = document.createElement("details"), summary = document.createElement("summary"), list = document.createElement("ul");
            detail.className = "substitutions"; summary.textContent = `${subs.length} substitutions`; detail.open = expanded.has(row.key);
            for (const [key,count] of subs) {const li = document.createElement("li"); li.textContent = `${char(key)} × ${num(count)}`; list.append(li);}
            detail.append(summary,list); detail.addEventListener("toggle", () => {if(detail.open) expanded.add(row.key); else expanded.delete(row.key);}); cells[4].replaceChildren(detail);
          } else cells[4].textContent = subs.map(([k,n]) => `${char(k)} × ${num(n)}`).join(" · ") || "—";
        }
        // Identical data/status refreshes never call renderRows. Deliberate sorting
        // reorders existing nodes rather than recreating focused controls/details.
        $("rows").append(tr);
      }
      for (const [key,node] of rowNodes) if (!used.has(key)) {node.remove(); rowNodes.delete(key);}
    }
    function render() {
      if (!loaded || disposed) return;
      options("language",new Set(Object.values(state.groups).map(g => g.language)),"All languages");
      options("layout",new Set(Object.values(state.groups).map(g => g.layout)),"All layouts");
      applyPrefs();
      const groups = Object.values(state.groups).filter(g => (!$("language").value || g.language === $("language").value) && (!$("layout").value || g.layout === $("layout").value));
      const totals = {tests:0,attempts:0,errors:0,extra:0,corrections:0}, map = new Map();
      for (const g of groups) {
        for (const name of Object.keys(totals)) totals[name] += g[name];
        for (const [key,value] of Object.entries(g.keys)) {
          const row = map.get(key) || {key,attempts:0,errors:0,substitutions:new Map()};
          row.attempts += value.attempts; row.errors += value.errors;
          for (const [typed,count] of Object.entries(value.substitutions)) row.substitutions.set(typed,(row.substitutions.get(typed)||0)+count);
          map.set(key,row);
        }
      }
      for (const name of ["tests","attempts","errors"]) $(name).textContent = num(totals[name]);
      $("rate").textContent = totals.attempts ? (100 * totals.errors / totals.attempts).toFixed(1) + "%" : "—";
      $("updated").textContent = state.updated ? "Latest saved test overall · " + new Date(state.updated).toLocaleString() : "No tests saved yet";
      const minimum = Math.min(1000000,Math.max(1,Number($("minimum").value)||1));
      const sort = $("sort").value, rank = row => sort === "rate" ? row.errors / row.attempts : row[sort];
      const rows = [...map.values()].filter(r => r.attempts >= minimum).sort((a,b)=>rank(b)-rank(a)||b.attempts-a.attempts||a.key.localeCompare(b.key));
      $("clear").hidden = !$("language").value && !$("layout").value && minimum === 1 && sort === "errors";
      const visibleRows = narrow.matches && !showAll ? rows.slice(0,8) : rows;
      $("show-more").hidden = !narrow.matches || rows.length <= 8;
      $("show-more").textContent = showAll ? "show fewer characters" : `show all ${rows.length} characters`;
      const filters = [$("language").value || "all languages",$("layout").value || "all layouts"];
      $("filter-summary").textContent = `${visibleRows.length} of ${map.size} characters · minimum ${num(minimum)} ${minimum===1?"attempt":"attempts"} (table only) · ${filters.join(" · ")}`;
      $("empty").hidden = !!rows.length;
      $("table-wrap").hidden = !rows.length;
      $("empty").querySelector("a").hidden = state.tests > 0;
      if (!state.tests) {$("empty-title").textContent = "Your first test starts the picture"; $("empty-copy").textContent = "Finish a standard test to record character attempts. Corrected mistakes count too.";}
      else if (!groups.length) {$("empty-title").textContent = "No tests match these filters"; $("empty-copy").textContent = "Your saved data is still here. Clear the language and layout filters to see it.";}
      else if (!rows.length) {$("empty-title").textContent = "No characters meet this minimum"; $("empty-copy").textContent = "Lower the minimum attempts or clear filters to include smaller samples.";}
      renderRows(visibleRows);
      requestAnimationFrame(updateOverflow);
      $("additional").textContent = totals.attempts ? `${num(totals.extra)} extra ${totals.extra===1?"insertion":"insertions"} · ${num(totals.corrections)} manual deletion ${totals.corrections===1?"action":"actions"}` : "";
      const focus = [...map.values()].filter(r=>r.attempts>=20&&r.errors).sort((a,b)=>b.errors/b.attempts-a.errors/a.attempts||b.errors-a.errors).slice(0,3);
      $("practice-title").textContent = focus.length ? "Give these characters more time" : !totals.attempts ? "Building your sample" : !totals.errors ? "A clean sample so far" : "More attempts will help";
      $("practice-copy").textContent = focus.length ? "Highest error rates · at least 20 attempts each" : !totals.errors && totals.attempts ? "No mistakes in the selected tests. Keep the same deliberate pace." : "Characters need 20 attempts for a useful rate comparison.";
      $("focus-keys").replaceChildren(...focus.map(r=>{
        const item=document.createElement("div"),key=document.createElement("kbd"),rate=document.createElement("strong"),label=document.createElement("small"),count=document.createElement("span");
        item.className="focus-row";key.textContent=char(r.key);rate.textContent=(r.errors/r.attempts*100).toFixed(1)+"%";label.textContent="error rate";count.className="focus-count";count.textContent=`${num(r.errors)} mistakes / ${num(r.attempts)} attempts`;item.append(key,label,rate,count);return item;
      }));
      const pairs=[];for(const row of map.values())for(const [typed,count]of row.substitutions)pairs.push({expected:row.key,typed,count});
      pairs.sort((a,b)=>b.count-a.count||a.expected.localeCompare(b.expected));
      $("patterns").replaceChildren(...pairs.slice(0,5).map(p=>{const row=document.createElement("div"),pair=document.createElement("span"),a=document.createElement("kbd"),b=document.createElement("kbd"),n=document.createElement("span");row.className="pattern-row";pair.className="pair";a.textContent=char(p.expected);b.textContent=char(p.typed);pair.append(a," → ",b);n.className="count";n.textContent=`${num(p.count)} ${p.count===1?"mistake":"mistakes"}`;row.append(pair,n);return row;}));
      if (!pairs.length) $("patterns").textContent = totals.attempts ? "No substitutions in this selection." : "Substitutions appear after your first mistakes.";
    }
    function status(result) {
      const all = result.collectorTabs || {};
      const reports = embedded ? [all[result.currentTabId]].filter(Boolean) : Object.values(all);
      const recent = reports.filter(s=>Date.now()-s.at<45000), message = recent.map(s=>s.message).join(" · ");
      const normal = recent.length>0 && recent.every(s=>/^(Connected|Ready|Saved)/.test(s.message));
      $("connection-label").textContent = normal ? (/Saved/.test(message)?"saved locally":"connected") : message ? "collection notice" : Date.now()-mountedAt<30000?"connecting":"not connected";
      $("collection").dataset.warning = String(!!message && !normal);
      $("status").textContent = message || (embedded?"No recent status from this typing tab. Reload it after updating the extension.":"No recent status from connected Monkeytype tabs. Reload them after updating the extension.");
    }
    function updateOverflow() {
      if (disposed) return;
      $("table-hint").hidden = $("table-wrap").hidden || $("table-wrap").scrollWidth <= $("table-wrap").clientWidth + 1;
    }
    async function refresh() {
      if (disposed) return;
      if (refreshing) {refreshAgain = true; return refreshing;}
      refreshing = (async()=>{
        try {
          const result=await request("get"); if(disposed)return; canRestore=true;
          const changed=!loaded||result.revision!==revision;
          if(changed){state=core.validateBackup(result.analytics||core.blank());revision=result.revision;loaded=true;main.dataset.state="ready";render();}
          main.dataset.state="ready";
          $("undo").hidden=!result.undo;status(result);if(errorType==="load")clearError();$("loading").hidden=true;controlsState();
        } catch(cause){if(disposed)return;error((loaded?"Could not refresh; showing the last loaded data. ":"Could not load saved data. ")+cause.message,"load");$("loading").hidden=true;main.dataset.state=loaded?"stale":"error";controlsState();}
        finally{readyResolve();}
      })().finally(()=>{refreshing=undefined;if(refreshAgain&&!disposed){refreshAgain=false;void refresh();}});
      return refreshing;
    }
    async function action(operation, recovery = false) {
      if ((!loaded && !(recovery && canRestore))||busy||disposed) return;
      busy=true;controlsState();clearError();notice("");
      try{await operation();await refresh();}
      catch(cause){error(cause.message);notice(cause.message);}
      finally{busy=false;controlsState();}
    }
    const trusted = event => !embedded || event.isTrusted;
    for(const id of ["language","layout","sort","minimum"])$(id).addEventListener("input",()=>{render();persist();});
    $("minimum").addEventListener("blur",()=>{$("minimum").value=String(Math.min(1000000,Math.max(1,Math.trunc(Number($("minimum").value)||1))));render();persist();});
    $("show-more").addEventListener("click",()=>{showAll=!showAll;render();persist();});
    const jump = id => {const target=$(id);target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:"start"});};
    $("focus-jump").addEventListener("click",()=>jump("practice-title"));
    $("characters-jump").addEventListener("click",()=>jump("keys-title"));
    $("clear").addEventListener("click",()=>{for(const id of ["language","layout"])$(id).value="";$("minimum").value="1";$("sort").value="errors";render();persist();});
    const disclose = id => {$(id).open=true;$(id).querySelector("summary").focus();$(id).scrollIntoView({block:"nearest"});};
    $("about").addEventListener("click",()=>disclose("data-details"));$("collection").addEventListener("click",()=>disclose("collection-details"));
    $("retry").addEventListener("click",()=>{clearError();void refresh();});
    $("expand").addEventListener("click",()=>void request("open-integrated").catch(cause=>error(cause.message)));
    $("export").addEventListener("click",event=>{if(!trusted(event))return;void action(async()=>{
      const latest=await request("get"),backup=core.validateBackup(latest.analytics||core.blank());
      const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:"application/json"})),a=document.createElement("a");a.href=url;a.download=`monkeytype-typing-mistakes-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice("Current data exported. Keep this backup somewhere safe.");
    });});
    $("restore").addEventListener("click",event=>{if(trusted(event)&&canRestore&&!busy)$("import").click();});
    $("import").addEventListener("change",event=>{if(!trusted(event))return;const file=event.target.files[0];if(!file)return;void action(async()=>{
      if(file.size>8000000)throw Error("Backup is too large (maximum 8 MB).");const backup=core.validateBackup(JSON.parse(await file.text())),latest=await request("get");
      if(!confirm(`Replace all current data with ${backup.tests} tests from this backup? Export first if you want to keep current data. One previous snapshot will be kept.`))return;
      await request("restore",backup,latest.revision);notice("Backup restored. The previous snapshot is available below.");
    },true).finally(()=>event.target.value="");});
    $("reset").addEventListener("click",event=>{if(!trusted(event))return;void action(async()=>{
      const latest=await request("get");if(!confirm(`Reset ${latest.analytics?.tests||0} saved tests? Export a backup first. One previous snapshot will be kept.`))return;
      await request("reset",undefined,latest.revision);notice("Mistake data reset. The previous snapshot is available below.");
    });});
    $("undo").addEventListener("click",event=>{if(!trusted(event))return;void action(async()=>{
      const latest=await request("get");const warning=latest.undoChanged ? (latest.undoNewTests===null ? " The current dataset may include newer tests, which would be replaced." : ` ${latest.undoNewTests} newer tests have been collected and would be replaced.`) : "";
      if(!confirm(`Replace current data with the previous snapshot?${warning} Export first to keep current data.`))return;
      await request("undo",undefined,latest.revision);notice("Previous snapshot restored. The replaced data is now the other snapshot.");
    });});
    const changed=(changes,area)=>{if(area==="local"||area==="session")void refresh();};
    chrome.storage.onChanged.addListener(changed);
    root.addEventListener("focusout",()=>requestAnimationFrame(()=>{if(renderDeferred){renderDeferred=false;render();}}));
    const scroll=()=>{if(loaded&&!disposed){positionCaptured=false;persist();}};
    window.addEventListener("scroll",scroll,{passive:true});
    const leave=event=>{if(embedded&&event.composedPath().some(n=>n?.tagName==="A")&&!event.composedPath().includes(root.host)){savePosition();positionCaptured=true;}};
    document.addEventListener("click",leave,true);
    const mediaChange=()=>render();narrow.addEventListener("change",mediaChange);
    const overflowObserver=new ResizeObserver(updateOverflow);overflowObserver.observe($("table-wrap"));
    controlsState();void refresh();
    const timer=setInterval(()=>{if(!document.hidden&&!busy)void refresh();},5000);
    return {ready,savePosition,restorePosition(){
      const y=Number(saved.scroll);window.scrollTo(0,Number.isFinite(y)?Math.max(0,y):0);
      const target=typeof saved.focus==="string"&&saved.focus?$(saved.focus):root.querySelector("h1");target?.focus({preventScroll:true});
    },dispose(){if(!positionCaptured)savePosition();disposed=true;clearTimeout(persistTimer);clearInterval(timer);narrow.removeEventListener("change",mediaChange);overflowObserver.disconnect();window.removeEventListener("scroll",scroll);document.removeEventListener("click",leave,true);try{chrome.storage.onChanged.removeListener(changed);}catch{/* Extension reloaded. */}}};
  }};
  if(location.protocol==="chrome-extension:")globalThis.MLAView.mount(document);
})();
