# Release verification — 1.2.0

2026-11-05, Fedora Linux, Google Chrome 157.0.8103.38 (headless isolated profile and the existing desktop profile). These are bounded acceptance checks, not a claim of universal compatibility.

## Completed

- 22 Node tests: accounting, corrected mistakes, automatic input, boundaries, exclusions, duplicate handling, malformed data, backup canonicalization, safe-integer overflow without mutation, concurrent retries, quota/write failure recovery, atomic restore, reset/undo, sender restrictions, per-tab status, collector queueing, settings snapshots, and thrown hooks.
- Syntax, manifest references/icons/HTML dependencies, version consistency, portable build, deterministic ZIP and checksums. ZIP root contains only extension runtime files; no source tests, private data, or development dependencies.
- Extracted ZIP loaded through Chrome's extension installation mechanism into a disposable profile. Empty dashboard, popup, live production hook and finished signed-out standard test worked. A deliberately corrected mistake produced 264 attempts, one mistake, and one manual deletion. The site displayed “Sign in to save your result”; no personal account was used.
- Reloaded dashboard/site retained counts without duplication. Real worker v1 restore, reset, Undo, JSON export round trip, invalid backup rejection, and menu opening/reuse were exercised. A representative menu fixture was used in the disposable signed-out profile.
- Desktop, 390px viewport (no document overflow), light/dark color schemes inspected. Restore is a keyboard-accessible button, native controls retain labels, tables have column headers, status text is live, and focus styles are explicit. No formal screen-reader audit is claimed.
- Existing desktop install was privately backed up, updated at the same path without adding a manifest key, and reloaded. Its extension ID and complete local storage remained identical. No automated typing was performed in that profile. Real signed-in menu placement and keyboard dashboard access were checked separately.
- Public screenshots use deliberately synthetic data in the disposable profile. No private data/profile/archive is published.

- GitHub CI checks passed. The draft asset was downloaded, its own SHA-256 verified, and all 16 extracted runtime files compared byte-for-byte with source. Python/zlib versions may produce different compressed archive bytes; determinism was checked with a fixed local toolchain.

## Limits

Windows/macOS and alternative browsers are untested. Only standard non-composition BMP character input is supported; exclusions are described in README. Internal Monkeytype hooks and menu markup may change. Polling can miss extremely rapid successive tests. Pending retries are tab-memory only and require keeping the tab open until Saved. Storage quota errors are covered with failure injection, not by filling the user's browser disk. Deduplication covers the most recent 10,000 hashes. There is no Web Store or automatic updater, account import, or sync.

The full dashboard uses the operating system's light/dark preference. The small site-menu entry inherits Monkeytype's actual classes/theme. A separate extension page keeps account data and storage controls isolated and avoids disrupting typing or navigation; it intentionally does not copy arbitrary Monkeytype custom themes.

## Reproduce

Run `npm run verify`, extract the named ZIP, and load it in a disposable Chrome profile. Reject optional cookies, stay signed out, complete a standard test with a wrong character/backspace/replacement, then inspect saved counts. Reload, export, reset, Undo, and restore. Try malformed JSON; verify data survives. Use the account-menu entry in a signed-in manual session without automated results, or toolbar access signed out. Replace files in the same folder, reload the extension/site, and verify identity and counts. Compare repeat packages with SHA256SUMS.

GitHub Actions builds draft releases on version tags; publishing follows browser acceptance. Verify the published ZIP's checksum and re-extract it before loading. Download and public-release checks are also recorded in the release notes.
