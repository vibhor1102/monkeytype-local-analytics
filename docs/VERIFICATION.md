# Release checks: 1.4.0

[← Overview](../README.md) · [Supported tests](USAGE.md#what-gets-recorded) · [Development](DEVELOPMENT.md)

Checked on **5 November 2026**, using Fedora Linux and Google Chrome **157.0.8103.38**. These are checks of this release, not a guarantee for every browser or future Monkeytype update.

## What was checked

| Area | Result |
| --- | --- |
| Recording | A completed live test with a wrong character, Backspace, and a correct replacement kept the mistake and counted the replacement. |
| Saved data | Reloads kept the totals without counting the same test twice. Updating an existing install preserved its ID and complete saved data. |
| Navigation | The page opened in the same Monkeytype tab. Idle entry avoided a reload; entry during a test used Monkeytype’s normal navigation. Back, Settings, bookmarks, and keyboard shortcuts were checked. |
| Appearance | Site theme/font inheritance, custom colors, narrow-window layout, table scrolling, and practice links were checked. |
| Backups and errors | Export, restore, reset, previous snapshots, invalid files, failed saves, and stale confirmations were checked. |
| Loading and refresh | The page distinguished loading, failed reads, and older displayed data. Successful retries recovered without recreating unchanged table controls. |
| Browser safeguards | Existing-profile UI checks left analytics and unrelated tabs’ theme preferences unchanged. Temporary light/dark overrides cleared after success and an intentional failure. |
| Download | The GitHub ZIP’s checksum and all 18 extracted files matched the tested build. Browser checks passed from that downloaded ZIP. Anonymous public downloads worked. |
| Automated checks | All 27 Node tests, syntax/manifest/version checks, packaging, and GitHub workflows passed. |

Automated typing used temporary signed-out profiles. No automated results were submitted to a real account. Public screenshots contain synthetic data.

One current-profile timing check from the typing page took about **0.6 seconds** to show the view and allow the account control to be clicked, without a document reload. This is one measurement, not a speed guarantee.

## What hasn’t been checked

- Windows, macOS, alternative browsers, or mobile browsers.
- Every supported Chrome version; 111 is the declared minimum.
- A formal screen-reader or assistive-technology audit.
- Recording for excluded modes or input methods. See [supported tests](USAGE.md#what-gets-recorded).

Monkeytype’s native account page separately stalled at “Downloading user data” during one check, before the extension view opened. The existing-profile extension check passed from the typing page instead. This distinction matters when diagnosing a loading problem.

## Technical boundaries

These details are mainly for contributors and people investigating a problem.

| Boundary | Meaning |
| --- | --- |
| Internal event format | The adapter supports version 1. Unknown formats stop collection rather than being guessed. Monkeytype can change this format or its menu markup. |
| Polling | Tests completed entirely between 750 ms checks can be missed. |
| Pending saves | Up to 100 summaries wait in typing-tab memory. Closing or reloading that tab before a save completes can lose them. |
| Duplicate protection | Only the most recent 10,000 test hashes are retained. Reset keeps those hashes; backups carry their own window. |
| Storage | Saved data and the previous snapshot share Chrome’s local extension quota, normally 10 MB. Imports are limited to 8 MB and can still exceed the quota. Quota failures were simulated, not tested by filling a real user’s storage. |
| In-page display | Monkeytype scripts can see displayed stats. Extension storage operations stay in a separate script context; page messages don’t provide backup/reset commands. This isn’t a tamper-proof record. |
| Navigation | The extension provides the `#typing-mistakes` view. It isn’t a server-provided Monkeytype route. Old `#local-analytics` bookmarks are recognised. |
| Accessibility and themes | Native colors/fonts are inherited. Low-contrast custom themes can remain low contrast. |

No Monkeytype typing engine, authentication, result submission, or configuration methods are replaced. Schema-1 backups remain compatible; legacy display-name updates preserve the existing install identity.

For repeatable commands and the release process, see [development](DEVELOPMENT.md).
