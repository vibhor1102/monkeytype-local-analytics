# Monkeytype Typing Mistakes

Know what to practise on [Monkeytype](https://monkeytype.com). See character mistakes, common substitutions, and a practice focus based on characters with at least 20 attempts. Correcting a mistake keeps the original mistake and adds a new attempt.

A same-tab **Typing mistakes** page inside Monkeytype, using its active theme and font. Independent, free, local-only Chrome extension. No registration, Node.js, Web Store, account access, or sync required. MIT licensed. Not affiliated with or endorsed by Monkeytype.

![Dashboard showing synthetic practice data](docs/dashboard.png)

[Light theme](docs/dashboard-light.png) · [Small-screen layout](docs/dashboard-mobile.png)

## Install from GitHub Releases

1. Download **monkeytype-local-analytics-1.4.0.zip** from the [latest release](https://github.com/vibhor1102/monkeytype-local-analytics/releases/latest). Download the named asset, not GitHub's “Source code” archive.
2. Extract it into a permanent folder. The folder should contain `manifest.json` directly. Keep this folder: Chrome loads the extension from it.
3. Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and select that folder.
4. Reload open Monkeytype tabs. Finish a new standard test. Open **Typing mistakes** immediately below **User stats** in the signed-in account menu, or use the extension's toolbar button when signed out. It opens [monkeytype.com/#typing-mistakes](https://monkeytype.com/#typing-mistakes) in your Monkeytype tab. Pinning is optional.

Chrome may show a developer-extension warning. This is an unpacked extension, with manual updates. Never install an unexpected archive or disable browser security to install it.

## Update without losing data

Export a backup from the dashboard first. Close or finish active tests and wait for **Saved**. Extract the new ZIP elsewhere, then replace the files **inside your existing install folder**. Keep the exact folder path. In `chrome://extensions`, click the extension's Reload button, then reload Monkeytype tabs. Verify your test total.

Do not remove the old extension or load a new path as an update: unpacked IDs are path-based, and data belongs to that ID. There is deliberately no manifest signing key, preserving existing prototype installs. If moving to another path/profile, export first, load the new folder, then restore the backup. Restore replaces data; it does not merge it. Reset and restore retain one previous snapshot. Restoring that snapshot also replaces newer tests, with a warning and a check that the data has not changed during confirmation. Export remains the durable recovery method.

## Reading the results

Counts belong to the **expected character**, including spaces and punctuation, rather than a physical key or finger. A wrong `x` where `c` was expected adds a mistake to `c`. Backspacing does not erase it. Typing `c` afterwards adds another attempt. Manual deletion actions and extra characters beyond the target word are separate counts. Untyped letters are not invented as attempts. This differs from Monkeytype's overall accuracy calculation.

Practice focus ranks error rates with at least 20 attempts; it is a hint, not a statistical diagnosis. The table also ranks absolute mistake counts and shows common substitutions (expand the cell to see longer lists). Filters combine stored language and Monkeytype layout settings. “Default” layout does not identify your operating system layout. Historical account results cannot be imported: they lack per-character attempts.

## Compatibility and recovery

- Verified on desktop Linux Chrome; Windows, macOS, Edge, Brave, and Firefox are untested. Manifest minimum is Chrome 111; release testing uses current Chrome.
- Standard finished tests use Monkeytype's internal version-1 event-log hook. This can change without notice. Unknown formats fail closed and show a status instead of collecting guesses.
- Zen, bailouts, Funbox (including weakspot), opposite-shift, composition/IME, and surrogate-pair characters are conservatively excluded. Automatic input/deletion does not count.
- Only tests started after the extension connects are eligible. Reload tabs after an extension update. No retroactive collection of earlier results.
- Collection status lists recent tab reports and expires after 45 seconds. “Saved” confirms local storage accepted a summary. If saving fails, keep the tab open: up to 100 summaries retry in memory. Closing/reloading before saving can lose pending tests. Very rapid tests between polls (750 ms) can be missed.
- The last 10,000 test hashes prevent duplicate counting. Reintroducing an older log can count again. Reset retains those hashes; restored backups use their own deduplication window.
- Storage full? Export a backup, free browser space, and keep the Monkeytype tab open for retries. Malformed backups are rejected. Data plus the undo snapshot share Chrome's local storage quota (normally 10 MB); imports are limited to 8 MB and may still exceed available storage. Failed writes leave the previous data intact.
- The account menu depends on Monkeytype's markup. Use toolbar access if upstream changes break the entry. Never post private backups in a public issue.

The page keeps Monkeytype’s header, footer, font and theme, including custom theme colors. Filters and backup controls stay inside that page. A short note says the data is saved on this browser and is not synced with your Monkeytype account. The extension’s separate options page remains a recovery fallback.

The `#typing-mistakes` URL works with reloads and bookmarks. Older `#local-analytics` bookmarks redirect to it. Without the extension, the hash opens Monkeytype’s regular typing page; it is not a server-provided Monkeytype route. Opening from an idle page adds the hash to the current native route without reloading the site or its account menu. Active tests leave through an existing native navigation link, preserving Monkeytype’s own navigation guards. Completed-test saves finish first; if saving stays pending, keep the tab open and retry. Back/Forward and native navigation remain available. Filters and view position are remembered within the tab.

See [privacy](PRIVACY.md), [verification](docs/VERIFICATION.md), and [contributing](CONTRIBUTING.md). Report reproducible problems through [GitHub Issues](https://github.com/vibhor1102/monkeytype-local-analytics/issues), with browser/extension versions and collection status.

## Develop

Node.js 24+ and Python 3 (packaging only). No runtime npm dependencies.

```sh
npm test
npm run check
npm run build     # writes dist/extension only
npm run package   # ready-to-load ZIP and SHA256SUMS
```

Load `dist/extension` in a disposable Chrome profile. `npm run install:local -- --target /absolute/existing/install/path [--dry-run]` explicitly copies runtime files into a separate install folder; it does not reload Chrome. Normal builds never install into your home directory.

The ZIP is deterministic for the same source and Python/zlib toolchain; compression versions can change archive bytes without changing runtime files. Always verify downloads against the release’s own SHA256SUMS. Verify with `sha256sum -c SHA256SUMS` from the directory containing both downloaded assets (or `Get-FileHash` on Windows). Optional browser acceptance (uses temporary signed-out Chrome profiles, never your regular profile):

```sh
npm install --prefix .local/browser playwright
npm run test:browser
# To test an extracted ZIP instead:
MLA_EXTENSION_DIR=/path/to/extracted/extension npm run test:browser
npm run test:view # compiled loading/recovery checks, synthetic data, no site access
```

For UI checks in an existing signed-in Chrome profile, use `MLA_EXTENSION_ID=<installed-id> npm run test:ui` with a local CDP endpoint (`MLA_CDP_ENDPOINT` overrides the default). It types no tests and changes no analytics or site theme settings. It attaches with `noDefaults:true`, applies light/dark media emulation only to its own Monkeytype tab, clears it in `finally` on success/failure, checks unrelated-tab preferences and complete local storage, and closes its test tabs. The profile must already be signed in for the account-menu check; `MLA_START_PATH=/` starts from typing when the native account route is unavailable; upstream account loading can delay or fail this optional test. Do not enable remote debugging on an untrusted interface.

CI runs accounting, background/recovery tests, syntax checks, and packaging; live Monkeytype/browser acceptance is a separate release check.

## Attribution

Original extension code and chart icon are distributed under MIT. Monkeytype is a separate GPL-3.0 project; its name is used to identify compatibility. No Monkeytype logo, fonts, or implementation code is bundled. The adapter observes its exposed event format without replacing the typing engine, authentication, navigation, or result submission.
