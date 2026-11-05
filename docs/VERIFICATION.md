# Release verification — 1.4.0

2026-11-05, Fedora Linux, Google Chrome 157.0.8103.38. The main experience is now **Typing mistakes** inside Monkeytype. These checks do not imply universal browser/platform support.

## Completed

- 27 Node tests cover corrected-mistake accounting, automatic input, boundaries, exclusions, deduplication, malformed data, backup canonicalization, overflow without mutation, retries/write failures, atomic restore, reset/undo, sender restrictions, isolated view access, toolbar routing, settings snapshots, navigation waiting for a completed save, stale destructive confirmations, and toolbar flushes without storage-queue deadlock.
- Syntax, manifest references, portable build, deterministic packaging with a fixed Python/zlib toolchain, and version consistency pass. The archive contains only runtime files with its manifest at the root.
- `npm run test:browser` ran against the extracted ZIP using a temporary signed-out Chrome profile. It verified old bookmark migration to `/#typing-mistakes`, native header/footer, identical site/view fonts and theme variables, a real light-theme change through Monkeytype's picker, immediate custom-color inheritance, filter keyboard isolation, synthetic-reset/page-message rejection, 390px layout, native Settings navigation, Back, reload, and return to typing.
- Idle menu entry now keeps the document and native route instead of repeating site boot/authentication loading. A trusted menu click during an active test leaves through an existing native navigation link without leaving a running timer underneath. A subsequent completed standard test with a wrong character/backspace/replacement still collected exactly one mistake and one manual deletion. No real account was used. Recovery-page reload retained the data.
- Chrome's real extension reload mechanism was exercised while the in-page view was open; leaving through native navigation restored the original page rather than stranding it hidden. The options page remains a separate recovery fallback.
- The renamed personal install retained its path-derived ID and complete local storage. The real signed-in menu entry was verified directly below User stats, opening the same-tab themed page by keyboard. No automated typing occurred in that profile.
- Public screenshots use synthetic data in a disposable profile. No private data/profile/archive is published.

The optional `test:browser` uses a temporary signed-out profile; `test:view` tests compiled loading/failure/recovery behavior with synthetic data and no site requests. `test:ui` explicitly attaches to a current signed-in profile without Playwright defaults. It types no test, changes no analytics, scopes media emulation to its own test tab, and verifies cleanup on success and intentional failure. These checks remain separate from CI because they need installed Chrome and/or a live third-party deployment. Contributor setup is in README.

## Additional 1.4.0 acceptance

- Compact overview and side-by-side desktop panels place filters and character rows in the first viewport. Mobile starts with eight rows, a sticky character column, an explicit overflow hint, a show-all control, and keyboard-accessible jumps to/from practice focus.
- Two independent Sol 6.1 auditors inspected the native/reference screenshots, final desktop/mobile views, source, and browser evidence. Both judged UI/UX and functionality at least on par for each page’s purpose. This is a scoped design assessment, not a formal accessibility certification.
- The compiled controller passes initial read failure with disabled export and nonzero-looking placeholders avoided, successful retry, malformed optional preferences, stale-data retention/recovery with unchanged revision, and stable row/option identity. Export reads current storage; mutation controls serialize interactions and revision tokens reject stale confirmations.
- Current-profile UI acceptance from typing recorded 567 ms to a ready view and 631 ms to an actionable account control, without replacing the document. Light/dark media overrides cleared on success and an intentional failure; all six unrelated tabs kept their media preferences and complete local storage was unchanged. The native account route separately stalled at “Downloading user data” before extension entry and timed out; this check used the existing signed-in typing route instead. An earlier account-route run recorded 441/519 ms.
- The preserved installation was updated at its original path and ID; complete local storage remained unchanged. No automated results were submitted to the real account. Public screenshots are synthetic.

## Limits and design boundaries

The hash destination is provided by this extension. Without it, `https://monkeytype.com/#typing-mistakes` opens the regular site. Full server paths such as `/typing-mistakes` are not claimed. No Monkeytype router, engine, auth, submission, or configuration methods are replaced.

Entering from an idle page uses the existing document after flushing completed saves. Active/unknown state leaves through native navigation, preserving Monkeytype’s guards. If saves remain pending, the menu asks the user to keep the tab open and retry. Other native navigation may still unload pending tab-memory saves. The site header, footer, and active font/color variables remain intact. Scoped Shadow DOM prevents accidental CSS collisions; displayed aggregates can be inspected by page scripts, while storage access remains behind extension-isolated code. Data-changing controls require trusted events.

Windows/macOS and alternative browsers are untested. Only standard non-composition BMP input is supported. Internal hooks and markup can change. Polling may miss extremely rapid tests; pending retries require an open tab. Storage quota errors use failure injection rather than filling the user's disk. Deduplication covers the most recent 10,000 hashes. No formal screen-reader audit is claimed. Native custom themes can have low contrast; the extension follows the user's chosen theme. No cloud/account sync or automatic updater is included.

## Previous acceptance retained

Version 1.2.0 established export/restore, reset/Undo, malformed import handling, and v1 backup compatibility. Its same-path personal update preserved the extension ID and complete local storage. Version 1.4.0 keeps schema 1 and the same installation identity; the installer explicitly accepts the renamed display name. The old menu label and hash are retired in favor of Typing mistakes, with old bookmarks migrated.
