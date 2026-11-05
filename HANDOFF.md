# Handoff: refine and publicly release Monkeytype Local Analytics

## The user's request and authorized next task

The user wants the extension integrated more naturally into Monkeytype, with a polished, production-ready interface and an installation/update experience that works for other people. They explicitly allow rethinking the prototype from the ground up. They want a **public GitHub repository and downloadable GitHub Release**, with **no Web Store publication or paid registration**. They explicitly excluded account syncing. They requested a T3 project and a new agent working natively in this checkout to carry this work forward.

Finish the product, verify it, and publish the repository/release after the readiness checks. Publication is already authorized; do not ask the user to repeat that permission. Do not publish the inherited prototype unchanged or treat this handoff as completion of the redesign. Choose coherent product details autonomously. Keep the final user-facing summary concise.

Read `AGENTS.md` and, on the original machine, `.local/HANDOFF.local.md`. Local installation/backup paths and T3 metadata belong in `.local/`, which is ignored, not in public documentation.

## Current state

- Version 1.1.0, vanilla JavaScript/CSS/HTML, Chrome Manifest V3, no npm dependencies.
- `extension/` is source; `npm run build` now produces `dist/extension` only. It no longer writes into a particular user's home directory or copies source into the install directory.
- `npm run install:local -- --target /absolute/install/path [--dry-run]` explicitly deploys to an unpacked install directory. It refuses mismatched extension names/keys and locations overlapping this checkout.
- `npm test` runs 11 accounting tests. `npm run check` checks JavaScript syntax, manifest file references, and package/manifest version consistency. These are a baseline, not proof of public readiness.
- An earlier personal installation is separate from this checkout. Runtime files and saved browser data were preserved during migration. Do not uninstall or change its identity casually.
- A reset retains one undo snapshot; backup restore replaces, rather than merges, data. Current storage schema version is 1.
- No remote, public repository, GitHub Release, CI, license, distributable ZIP, screenshot assets, or fresh-profile release acceptance existed at handoff creation. Verify live Git state before acting; a new agent may update it.

## Existing behavior to preserve

1. A mistyped character remains a mistake after backspace/correction. The replacement is another attempt. This behavior was explicitly confirmed by the user.
2. Counts belong to the **expected** character at that position; substitutions record what was typed instead. Do not equate this directly with a physical key or finger.
3. Count manual correction actions separately; exclude automatically generated input/deletion. Track extra insertions separately when there is no target character. Do not invent attempts for skipped, untyped letters.
4. Keep normal `monkeytype.com` use and the existing sign-in working. No changes to authentication, server result payloads, anti-cheat, or test timing. User-initiated normal navigation/configuration remains possible.
5. The account dropdown has **Local analytics directly below User stats**, as the user requested. It matches the site's menu classes and opens/reuses the extension options page. It survives SPA navigation. The extension can remain unpinned.
6. Toolbar access remains a fallback, including for signed-out users. Statistics belong to the browser profile, not a Monkeytype account. Do not add cloud/account/Chrome Sync.
7. Preserve existing aggregate data and v1 backups through schema/identity changes. Version and test any migrations. Do not silently reset analytics or manufacture historical breakdowns that were not stored.

## Architecture and code map

- `core.js`: pure `analyze`, `merge`, summary/backup validation. Shared with Node tests through a small global/CommonJS bridge.
- `collector.js`: MAIN-world script reads `window.lastEventLog()` and public non-account `window.config`, analyses it, hashes the log, and posts aggregates to the isolated world. Polls every 750 ms; retries one pending summary until acknowledged.
- `relay.js`: isolated content script validates bridge envelope/source/origin and forwards messages to the service worker.
- `background.js`: serializes storage operations, validates summaries, deduplicates by hash, stores aggregate groups in `chrome.storage.local`, and opens the options page for the site-menu button. `storage.session` contains the most recent collector status.
- `menu.js`: isolated content script inserts a button after the account-menu `/account` link, matching classes. MutationObserver handles recreation; actual trusted clicks send `open-dashboard`.
- `dashboard.html`, `.css`, `.js`: same document used as toolbar popup and full options/dashboard tab. Uses textContent for user-derived strings. Currently a simple table/totals/filter interface with export, replacement restore, reset and undo.
- `tests/core.test.cjs`: corrected mistakes, early commits, extras, automatic input, stop-on-error, timer bounds, returning to earlier words, unsupported input, duplicate tests, malformed backups, and long-term aggregate counts.

The extension currently requests only `storage` and injects content scripts only into `https://monkeytype.com/*`. No externally connectable or web-accessible resources, network requests, or account tokens are needed. Keep additions justified and narrow.

## Product redesign: make deliberate decisions

Start by using the current product and inspecting the actual site, then propose a short implementation direction and execute it. The primary user question is “which characters should I practise, and why?” The public audience may know nothing about extensions, Monkeytype internals, or this conversation.

- Reconsider the information hierarchy and interaction model, not just colors. Preserve the account-menu entry. Evaluate whether a theme-aware in-page surface is better for the primary flow, with a full dashboard as needed; choose based on reliability and usability rather than adding duplicate surfaces.
- Fit Monkeytype's visual language: typography, spacing, restrained colors, iconography and focus behavior. Respect light/dark/custom themes where feasible. A separate extension page cannot automatically inherit page CSS; design that boundary explicitly.
- Distinguish frequent mistakes from high error rates on tiny samples. Explain denominators, minimum samples, spaces, extras and corrections briefly. Avoid labeling sparse observations as reliable weakness rankings.
- Give collection state, compatibility failures, exclusions, last-saved status and recovery clear places in the UI. An empty dataset must explain exactly how to get the first useful result. Include disconnected/updated-extension, saving failure, malformed backup, and unsupported-format states.
- Treat popup dimensions and small screens deliberately. Current `min-width: 660px`, hover-only menu considerations, generic toolbar icon, and fixed dashboard palette need review. Ensure keyboard access, labels, visible focus, contrast, reduced motion, and usable long tables/substitution lists.
- Keep implementation details out of the main learner flow. Provide deeper accounting/privacy/compatibility explanations in appropriate help/about locations.
- Avoid adding speculative gamification, cloud services, or a large framework merely to restyle the prototype. Choose tooling proportionate to the final architecture.

## Reliability audit before public release

These are findings/concerns to resolve or verify, not a completed security audit:

- `lastEventLog()` is an internal production hook, not a supported extension API. Validate structure/version and report failures instead of collecting nonsense. Check the current deployment at release time.
- Settings are read at collection time. Changing language/layout/Funbox immediately after completion can misclassify the old log; capture appropriate test context without touching Monkeytype's engine.
- Polling plus a single pending item needs review for rapid successive tests, page unload, extension/service-worker restarts, retries/storage errors, duplicate injection and stale event logs. Errors from a thrown hook should not disappear outside the collector's error path.
- Current status is one session-wide last message, potentially stale or misleading with several tabs or unsupported tests. Design trustworthy per-tab/aggregate status and recovery.
- All Funbox modes, composition/IME, non-BMP characters, opposite-shift and bailouts are conservatively excluded. Investigate separately rather than promising universal language/mode support. Weakspot in particular may not need blanket exclusion. Zen has no prescribed target text.
- Check early spaces, last-word commit exceptions, returning to previous words, stop-on-error, delete-on-error, repeated key events, punctuation, code auto-indentation, normalization and test boundaries against actual upstream semantics. Explain any intentional difference from Monkeytype's overall accuracy.
- Review bounds and invariants for every incoming object, backup size, unknown properties, safe integer overflow in lifetime aggregates, mutation before writes, storage quota exhaustion and atomic restore/migration. Do not treat page messages or the MAIN-world namespace as trusted.
- A page can spoof bridge messages, including acknowledgements. Keep credentials out of the bridge and limit impact; this is a personal learning tool, not tamper-resistant evidence. Audit menu-opening messages separately from the aggregate relay.
- Hash-based deduplication currently retains 10,000 IDs; older reintroduced logs can be counted again. Decide/describe long-term semantics. Review reset/undo behavior with active collectors and several tabs.
- Menu integration depends on upstream DOM attributes/links. Avoid broad expensive rescans during typing; handle signed-out state, sign-in/out transitions, menu remounts and normal navigation. Preserve existing menu actions.

## What the earlier checks actually proved

On 2026-11-04, the original agent verified the installed personal extension against real `monkeytype.com`:

- Production hook existed; actual events produced the expected corrected-mistake accounting.
- Storage survived dashboard reload; resubmitting the same test did not double count.
- Export, replacement restore, reset/undo worked using disposable verification data.
- Existing Monkeytype sign-in remained active. Automated test result saving was disabled for those tests; test data was removed afterward and normal settings restored.
- Version 1.1.0 menu placement, native class/font/color matching, navigation/back persistence, opening/reusing a single dashboard tab, and absence of Chrome extension errors were checked.

Those checks apply to the earlier baseline only. Do not represent them as evidence for your rewritten UI, new storage, different browser versions, or final ZIP. Migration-time checks are recorded in `.local/`.

## Upstream research already done

Source originally inspected at commit `5478cd701df9e6a7d4611004ec84bef8999b3aaa`, then refreshed to `2df8cbd468386d6b0cc3dcbf35316b608bf6f8b3` on 2026-11-05. Deployed bundle checked on 2026-11-04: `monkeytype.CKMXFFNn.js`. A temporary upstream clone might still exist at `/tmp/monkeytype-check`; do not depend on it surviving.

Relevant upstream files:

- `frontend/src/ts/index.tsx`: exposes `lastEventLog`, `currentEventLog` via `addToGlobal`; this is outside the DEV-only handle.
- `frontend/src/ts/test/events/{data,types,helpers,stats}.ts`: event log, target words, correctness, automatic/deletion flags and timing semantics.
- `frontend/src/ts/input/handlers/insert-text.ts` and input helpers: log insertion before automatic deletion, normalization, word navigation and correctness.
- `frontend/src/ts/components/layout/header/AccountMenu.tsx`, `Nav.tsx`: account-menu structure and focus/hover behavior.
- `frontend/src/ts/test/test-logic.ts`, `backend/src/utils/result.ts`, `packages/schemas/src/results.ts`, `packages/contracts/src/configs.ts`: native account data and strict API schemas. The saved account results omit per-character errors, so historical native account data cannot reconstruct them. Do not revisit syncing in this task.

## Distribution and public release acceptance

1. Identify the authenticated GitHub owner and check for a conflicting repository before choosing `monkeytype-local-analytics` (or another appropriate name). User authorized a public repo and release. There is currently no remote; do not infer one from the directory name.
2. Audit provenance and add an appropriate license, attribution/independence notice, concise README, privacy/support information and contribution guidance. Do not copy Monkeytype GPL code or logos into a differently licensed distribution without handling its obligations. Referencing its interface is different from copying implementation; review actual assets/code.
3. Create reproducible packaging and CI for tests/checks/build and release artifacts. A public user must download a ready-to-load ZIP from GitHub Releases, extract to a durable folder, enable Developer mode and Load unpacked. Node.js is for contributors, not end users. No Web Store fee/publication.
4. Verify a downloaded/re-extracted release ZIP, not only the checkout. Its root must be the actual extension directory with manifest/assets, without tests, `.git`, backups, personal paths or browser data. Include checksums and accurate install/update instructions. Do not promise Web Store-style automatic updates for an unpacked GitHub distribution.
5. Decide stable extension identity before the public release. A manifest public key can make IDs consistent across fresh installations, but introducing it changes the earlier personal install ID; plan/test migration and preserve existing data. Never commit signing private keys. Do not silently uninstall the previous extension.
6. Verify the fresh-install experience in a disposable Chromium/Chrome profile, initial collection and menu/dashboard access, persistence, unsupported cases, update/reload, backup restore, migration, and actual release asset. State untested platforms honestly. Test on other browsers only if claimed.
7. Record screenshots of the polished UI with synthetic/demo data, not the user's private typing history. Review tracked files/history and release contents for accidental local artifacts or secrets. Keep `.local/` ignored.
8. Publish the public GitHub repository and an appropriate release once these checks pass. If the work creates/pushes a PR, follow T3 linking rules. Do not claim done until the public URL, release assets and install instructions have been verified. Keep the user updated while work continues.

## Suggested execution sequence

Audit/inspect → choose an integrated product design → implement adapter/storage reliability and data migration → redesign UI/recovery/accessibility → test actual extension installation and site interaction → write public docs/license → package and verify the extracted artifact → publish and verify GitHub repo/release → deliver concise links and material limitations.

Update this handoff as decisions and evidence change. Do the work in this checkout rather than creating another source copy or writing back into the retired scratch workspace.
