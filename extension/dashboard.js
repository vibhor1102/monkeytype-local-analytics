"use strict";
const core = globalThis.MonkeytypeLocalAnalyticsCore;
const $ = id => document.getElementById(id);
let state = core.blank();
const number = value => value.toLocaleString();
const character = c => ({" ": "Space", "\n": "Enter", "\t": "Tab"}[c] || c);
async function request(type, value) {
  const result = await chrome.runtime.sendMessage({type, value});
  if (!result?.ok) throw new Error(result?.error || "The extension did not respond.");
  return result;
}
function notice(message) {$("notice").textContent = message;}
function options(id, values, first) {
  const select = $(id), current = select.value;
  select.replaceChildren(new Option(first, ""), ...values.sort().map(v => new Option(v, v)));
  if (values.includes(current)) select.value = current;
}
function render() {
  const groups = Object.values(state.groups).filter(g => (!$("language").value || g.language === $("language").value) && (!$("layout").value || g.layout === $("layout").value));
  const keys = new Map();
  let tests = 0, attempts = 0, errors = 0, extra = 0, corrections = 0;
  for (const g of groups) {
    tests += g.tests; attempts += g.attempts; errors += g.errors; extra += g.extra; corrections += g.corrections;
    for (const [key, value] of Object.entries(g.keys)) {
      const row = keys.get(key) || {key, attempts: 0, errors: 0, substitutions: new Map()};
      row.attempts += value.attempts; row.errors += value.errors;
      for (const [typed, count] of Object.entries(value.substitutions)) row.substitutions.set(typed, (row.substitutions.get(typed) || 0) + count);
      keys.set(key, row);
    }
  }
  $("tests").textContent = number(tests); $("attempts").textContent = number(attempts); $("errors").textContent = number(errors);
  $("rate").textContent = attempts ? (errors / attempts * 100).toFixed(1) + "%" : "—";
  $("updated").textContent = state.updated ? "Last test " + new Date(state.updated).toLocaleDateString() : "";
  const minimum = Math.max(1, Number($("minimum").value) || 1);
  const rank = row => $("sort").value === "rate" ? row.errors / row.attempts : row[$("sort").value];
  const sorted = [...keys.values()].filter(r => r.attempts >= minimum).sort((a,b) => rank(b) - rank(a) || b.attempts - a.attempts || a.key.localeCompare(b.key));
  const focus = [...keys.values()].filter(r => r.attempts >= 20 && r.errors > 0)
    .sort((a, b) => b.errors / b.attempts - a.errors / a.attempts || b.errors - a.errors).slice(0, 3);
  $("practice-title").textContent = focus.length ? "Slow down on these characters" : attempts ? "Keep building your sample" : "Your next test starts the picture";
  $("practice-copy").textContent = focus.length ? "Highest error rates among characters with at least 20 attempts. Aim for clean, deliberate repetitions; this is a practice hint, not a diagnosis." : "Finish a few standard tests. Characters with at least 20 attempts and a mistake will appear here.";
  $("focus-keys").replaceChildren(...focus.map(r => {
    const item = document.createElement("span"), key = document.createElement("kbd");
    key.textContent = character(r.key); item.append(key, ` ${(r.errors / r.attempts * 100).toFixed(1)}% · ${number(r.errors)} / ${number(r.attempts)}`); return item;
  }));
  $("rows").replaceChildren();
  for (const row of sorted) {
    const tr = document.createElement("tr");
    const cell = () => tr.appendChild(document.createElement("td"));
    const key = document.createElement("kbd"); key.textContent = character(row.key); cell().append(key);
    const error = cell(); error.textContent = number(row.errors); if (row.errors) error.className = "error-count";
    cell().textContent = number(row.attempts);
    const rate = cell(), wrapper = document.createElement("span"), bar = document.createElement("span"), fill = document.createElement("i");
    wrapper.className = "rate"; bar.className = "bar"; fill.style.width = (row.errors / row.attempts * 100) + "%";
    bar.append(fill); wrapper.append(bar, (row.errors / row.attempts * 100).toFixed(1) + "%"); rate.append(wrapper);
    const substitutions = cell(); substitutions.textContent = [...row.substitutions].sort((a,b) => b[1] - a[1]).slice(0, 3).map(([k,c]) => `${character(k)} × ${number(c)}`).join(" · ") || "—";
    substitutions.title = [...row.substitutions].map(([k,c]) => `${character(k)} × ${number(c)}`).join(" · ");
    $("rows").append(tr);
  }
  $("empty").hidden = attempts > 0; $("table-wrap").hidden = sorted.length === 0;
  $("additional").textContent = attempts ? `${number(extra)} extra keystrokes beyond target words · ${number(corrections)} manual deletion actions` + (sorted.length ? "" : " · No characters meet the minimum attempts filter.") : "";
}
async function refresh() {
  try {
    const result = await request("get");
    state = core.validateBackup(result.analytics || core.blank());
    options("language", [...new Set(Object.values(state.groups).map(g => g.language))], "All languages");
    options("layout", [...new Set(Object.values(state.groups).map(g => g.layout))], "All layouts");
    $("undo").hidden = !result.undo;
    const statuses = Object.values(result.collectorTabs || {}).filter(s => Date.now() - s.at < 45000);
    $("status").textContent = statuses.length ? statuses.map((s, i) => `${statuses.length > 1 ? `Tab ${i + 1}: ` : ""}${s.message}`).join(" · ") : "No recent connection. Open Monkeytype, or reload its tab after an extension update.";
    render();
  } catch (error) {notice(error.message);}
}
for (const id of ["language", "layout", "sort", "minimum"]) $(id).addEventListener("input", render);
$("expand").addEventListener("click", () => chrome.runtime.openOptionsPage());
$("export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = `monkeytype-analytics-${new Date().toISOString().slice(0,10)}.json`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notice("Backup exported. Keep it somewhere safe.");
});
$("restore").addEventListener("click", () => $("import").click());
$("import").addEventListener("change", async event => {
  try {
    const file = event.target.files[0]; if (!file) return;
    if (file.size > 8000000) throw new Error("Backup is too large (maximum 8 MB).");
    const backup = core.validateBackup(JSON.parse(await file.text()));
    if (!confirm(`Restore ${backup.tests} tests from this backup? This replaces current analytics. You can undo this afterwards.`)) return;
    await request("restore", backup); await refresh(); notice("Backup restored. The previous data can be restored with Undo.");
  } catch (error) {notice(error.message);} finally {event.target.value = "";}
});
$("reset").addEventListener("click", async () => {
  if (!confirm("Reset local analytics? Your current data will remain available through Undo.")) return;
  try {await request("reset"); await refresh(); notice("Analytics reset. Undo is available.");} catch (error) {notice(error.message);}
});
$("undo").addEventListener("click", async () => {
  try {await request("undo"); await refresh(); notice("Previous analytics restored.");} catch (error) {notice(error.message);}
});
chrome.storage.onChanged.addListener((changes, area) => {if (area === "local" || area === "session") void refresh();});
void refresh();

setInterval(() => {if (!document.hidden) void refresh();}, 15000);
