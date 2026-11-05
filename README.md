# Monkeytype Local Analytics

An independent Chrome extension that shows which characters you mistype on Monkeytype. Statistics stay in this browser profile. Correcting a mistake does not erase it.

**Status:** working prototype (version 1.1.0), moved into a standalone repository. A production redesign and the first public GitHub release are pending; see [HANDOFF.md](HANDOFF.md). There is no published release or Web Store listing yet.

## Use the current prototype

1. Clone or download this source and install Node.js 24 for development.
2. Run `npm test`, `npm run check`, then `npm run build`.
3. In Chrome, open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select the generated `dist/extension` folder.
4. Reload any open Monkeytype tabs. Finish a standard test to collect statistics.
5. In Monkeytype's account menu, choose **Local analytics** below **User stats**. The extension can stay unpinned. The extensions toolbar menu is also available when signed out.

The intended public release will contain a ready-to-load ZIP so ordinary users do not need Node.js. That packaging and fresh-install flow still need implementation and verification. This is an independent project, not an official Monkeytype feature.

## Development

No npm dependencies are required for the current baseline. Source is in `extension/`, accounting tests in `tests/`, and build tools in `scripts/`.

```sh
npm test
npm run check
npm run build
```

`build` writes only to `dist/extension`. It works independently of the shell's current directory and does not update a browser installation.

For an existing, separate unpacked install directory:

```sh
npm run install:local -- --target /absolute/path/to/extension --dry-run
npm run install:local -- --target /absolute/path/to/extension
```

After installing, reload the extension in Chrome, then reload Monkeytype tabs when idle. Keep the install folder at the same path to preserve identity and storage. The installer refuses mismatched names/keys and never deletes unrelated files in the target directory. Export a backup before a substantive update.

## What is recorded

The collector reads Monkeytype's completed test event log. For each supported insertion it uses the target word, character position and Monkeytype's correctness flag. Manual deletions do not remove earlier mistakes. Retyping is another attempt. Spaces and punctuation count; extra characters beyond the target are separate. Early spaces do not fabricate attempts at the remaining untyped letters. This measures characters, not inferred physical keys or finger movements.

The prototype excludes Zen, bailouts, composition/IME, non-BMP input, Funbox and opposite-shift modes. These exclusions need a more precise compatibility audit before release. Layout means Monkeytype's configured layout; `default` does not identify the operating system's physical layout. Aggregate character error rates can differ from Monkeytype's headline accuracy.

Storage contains aggregates by language/layout/mode, totals, update time, and a bounded cache of 10,000 test hashes. It contains no raw test text, account identity, passwords or timing histories. Export/restore uses versioned JSON and reset/restore retains one undo snapshot. Very old reintroduced logs can be counted again after their hashes leave the deduplication cache. Uninstalling removes extension-local storage. Exported backups contain your typing statistics; keep them private.

## Integration and known limits

Only `storage` permission and content-script access to `https://monkeytype.com/*` are requested. MAIN-world code reads the log, an isolated relay forwards aggregates, and the service worker validates and serializes writes. The account-menu button opens the extension's options page without requiring a pinned toolbar icon.

Monkeytype's `lastEventLog()` hook is internal and can change. The adapter was verified against deployed bundle `monkeytype.CKMXFFNn.js` on 2026-11-04; source was subsequently reviewed at upstream commit `2df8cbd468386d6b0cc3dcbf35316b608bf6f8b3`. Reverify at release time. Only event-log version 1 is currently accepted. Settings are read at collection time, so changing settings immediately after a test can misclassify metadata. Page code can spoof bridge messages: this is a personal learning aid, not tamper-resistant evidence.

There is no cloud/account/Chrome sync, analytics upload, or historical reconstruction from Monkeytype's account results. The native account schema does not preserve per-character mistakes. See the handoff for remaining reliability, UI and release work.
