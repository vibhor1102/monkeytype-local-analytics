# Monkeytype Local Analytics

Know what to practise on [Monkeytype](https://monkeytype.com). See character mistakes, common substitutions, and a practice focus based on characters with at least 20 attempts. Correcting a mistake keeps the original mistake and adds a new attempt.

Independent, free, local-only Chrome extension. No registration, Node.js, Web Store, account access, or sync required. MIT licensed. Not affiliated with or endorsed by Monkeytype.

![Dashboard showing synthetic practice data](docs/dashboard.png)

[Light theme](docs/dashboard-light.png) · [Small-screen layout](docs/dashboard-mobile.png)

## Install from GitHub Releases

1. Download **monkeytype-local-analytics-1.2.0.zip** from the [latest release](https://github.com/vibhor1102/monkeytype-local-analytics/releases/latest). Download the named asset, not GitHub's “Source code” archive.
2. Extract it into a permanent folder. The folder should contain `manifest.json` directly. Keep this folder: Chrome loads the extension from it.
3. Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and select that folder.
4. Reload open Monkeytype tabs. Finish a new standard test. Open **Local analytics** immediately below **User stats** in the signed-in account menu, or use the extension's toolbar button when signed out. Pinning is optional.

Chrome may show a developer-extension warning. This is an unpacked extension, with manual updates. Never install an unexpected archive or disable browser security to install it.

## Update without losing data

Export a backup from the dashboard first. Close or finish active tests and wait for **Saved**. Extract the new ZIP elsewhere, then replace the files **inside your existing install folder**. Keep the exact folder path. In `chrome://extensions`, click the extension's Reload button, then reload Monkeytype tabs. Verify your test total.

Do not remove the old extension or load a new path as an update: unpacked IDs are path-based, and data belongs to that ID. There is deliberately no manifest signing key, preserving existing prototype installs. If moving to another path/profile, export first, load the new folder, then restore the backup. Restore replaces data; it does not merge it. Reset and restore retain one Undo snapshot. Export remains the durable recovery method.

## Reading the results

Counts belong to the **expected character**, including spaces and punctuation, rather than a physical key or finger. A wrong `x` where `c` was expected adds a mistake to `c`. Backspacing does not erase it. Typing `c` afterwards adds another attempt. Manual deletion actions and extra characters beyond the target word are separate counts. Untyped letters are not invented as attempts. This differs from Monkeytype's overall accuracy calculation.

Practice focus ranks error rates with at least 20 attempts; it is a hint, not a statistical diagnosis. The table also ranks absolute mistake counts and shows the three most common substitutions (all appear in the cell tooltip). Filters combine stored language and Monkeytype layout settings. “Default” layout does not identify your operating system layout. Historical account results cannot be imported: they lack per-character attempts.

## Compatibility and recovery

- Verified on desktop Linux Chrome; Windows, macOS, Edge, Brave, and Firefox are untested. Manifest minimum is Chrome 111; release testing uses current Chrome.
- Standard finished tests use Monkeytype's internal version-1 event-log hook. This can change without notice. Unknown formats fail closed and show a status instead of collecting guesses.
- Zen, bailouts, Funbox (including weakspot), opposite-shift, composition/IME, and surrogate-pair characters are conservatively excluded. Automatic input/deletion does not count.
- Only tests started after the extension connects are eligible. Reload tabs after an extension update. No retroactive collection of earlier results.
- Collection status lists recent tab reports and expires after 45 seconds. “Saved” confirms local storage accepted a summary. If saving fails, keep the tab open: up to 100 summaries retry in memory. Closing/reloading before saving can lose pending tests. Very rapid tests between polls (750 ms) can be missed.
- The last 10,000 test hashes prevent duplicate counting. Reintroducing an older log can count again. Reset retains those hashes; restored backups use their own deduplication window.
- Storage full? Export a backup, free browser space, and keep the Monkeytype tab open for retries. Malformed backups are rejected. Data plus the undo snapshot share Chrome's local storage quota (normally 10 MB); imports are limited to 8 MB and may still exceed available storage. Failed writes leave the previous data intact.
- The account menu depends on Monkeytype's markup. Use toolbar access if upstream changes break the entry. Never post private backups in a public issue.

See [privacy](PRIVACY.md), [verification](docs/VERIFICATION.md), and [contributing](CONTRIBUTING.md). Report reproducible problems through [GitHub Issues](https://github.com/vibhor1102/monkeytype-local-analytics/issues), with browser/extension versions and collection status.

## Develop

Node.js 24+ and Python 3 (packaging only). No npm dependencies.

```sh
npm test
npm run check
npm run build     # writes dist/extension only
npm run package   # ready-to-load ZIP and SHA256SUMS
```

Load `dist/extension` in a disposable Chrome profile. `npm run install:local -- --target /absolute/existing/install/path [--dry-run]` explicitly copies runtime files into a separate install folder; it does not reload Chrome. Normal builds never install into your home directory.

The ZIP is deterministic for the same source. Verify with `sha256sum -c SHA256SUMS` from the directory containing both downloaded assets (or `Get-FileHash` on Windows). CI runs accounting, background/recovery tests, syntax checks, and packaging; live Monkeytype/browser acceptance is a separate release check.

## Attribution

Original extension code and chart icon are distributed under MIT. Monkeytype is a separate GPL-3.0 project; its name is used to identify compatibility. No Monkeytype logo, fonts, or implementation code is bundled. The adapter observes its exposed event format without replacing the typing engine, authentication, navigation, or result submission.
