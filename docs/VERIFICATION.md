# Release verification — 1.3.0

2026-11-05, Fedora Linux, Google Chrome 157.0.8103.38. The main experience is now **Typing mistakes** inside Monkeytype. These checks do not imply universal browser/platform support.

## Completed

- 25 Node tests cover corrected-mistake accounting, automatic input, boundaries, exclusions, deduplication, malformed data, backup canonicalization, overflow without mutation, retries/write failures, atomic restore, reset/undo, sender restrictions, isolated view access, toolbar routing, settings snapshots, and navigation waiting for a completed save.
- Syntax, manifest references, portable build, deterministic packaging with a fixed Python/zlib toolchain, and version consistency pass. The archive contains only runtime files with its manifest at the root.
- `npm run test:browser` ran against the extracted ZIP using a temporary signed-out Chrome profile. It verified old bookmark migration to `/#typing-mistakes`, native header/footer, identical site/view fonts and theme variables, a real light-theme change through Monkeytype's picker, immediate custom-color inheritance, filter keyboard isolation, synthetic-reset/page-message rejection, 390px layout, native Settings navigation, Back, reload, and return to typing.
- A trusted menu click during an active test navigated in the same tab without leaving a running timer underneath. A subsequent completed standard test with a wrong character/backspace/replacement still collected exactly one mistake and one manual deletion. No real account was used. Recovery-page reload retained the data.
- Chrome's real extension reload mechanism was exercised while the in-page view was open; leaving through native navigation restored the original page rather than stranding it hidden. The options page remains a separate recovery fallback.
- The renamed personal install retained its path-derived ID and complete local storage. The real signed-in menu entry was verified directly below User stats, opening the same-tab themed page by keyboard. No automated typing occurred in that profile.
- Public screenshots use synthetic data in a disposable profile. No private data/profile/archive is published.

The optional browser test is intentionally separate from CI because it depends on a live third-party deployment and installed Chrome. It never attaches to a regular user profile. Contributor setup is in README.

## Limits and design boundaries

The hash destination is provided by this extension. Without it, `https://monkeytype.com/#typing-mistakes` opens the regular site. Full server paths such as `/typing-mistakes` are not claimed. No Monkeytype router, engine, auth, submission, or configuration methods are replaced.

Entering from the menu uses real document navigation after flushing completed-test saves. This ends active tests through normal page lifecycle. If saves remain pending, the menu asks the user to keep the tab open and retry. Other native navigation may still unload pending tab-memory saves. The site header, footer, and active font/color variables remain intact. Scoped Shadow DOM prevents accidental CSS collisions; displayed aggregates can be inspected by page scripts, while storage access remains behind extension-isolated code. Data-changing controls require trusted events.

Windows/macOS and alternative browsers are untested. Only standard non-composition BMP input is supported. Internal hooks and markup can change. Polling may miss extremely rapid tests; pending retries require an open tab. Storage quota errors use failure injection rather than filling the user's disk. Deduplication covers the most recent 10,000 hashes. No formal screen-reader audit is claimed. Native custom themes can have low contrast; the extension follows the user's chosen theme. No cloud/account sync or automatic updater is included.

## Previous acceptance retained

Version 1.2.0 established export/restore, reset/Undo, malformed import handling, and v1 backup compatibility. Its same-path personal update preserved the extension ID and complete local storage. Version 1.3.0 keeps schema 1 and the same installation identity; the installer explicitly accepts the renamed display name. The old menu label and hash are retired in favor of Typing mistakes, with old bookmarks migrated.
