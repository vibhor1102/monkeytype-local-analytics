# Monkeytype Local Analytics — maintainer handoff

This root checkout is authoritative. Read AGENTS.md and (when present) ignored `.local/HANDOFF.local.md` before implementation. Retired copies must not receive source edits.

Version 1.2.0 was the first public distribution. Version 1.3.1 integrates the primary UI into Monkeytype and renames it Typing mistakes. The public repository slug stays stable. See README for installation/update, PRIVACY.md for data flow, and docs/VERIFICATION.md for acceptance evidence and limits. The public repository is https://github.com/vibhor1102/monkeytype-local-analytics.

## Product decisions

- Primary experience: `https://monkeytype.com/#typing-mistakes`, rendered inside the native main area with unchanged header/footer. Menu entry Typing mistakes is directly below User stats; toolbar reuses a connected site tab. Old #local-analytics links migrate. CSS inherits native colors and fonts, including live custom themes. A concise browser-only/not-account-synced note stays on the page. The separate options page is recovery fallback.
- Same-tab menu navigation flushes completed-test saves and uses real document navigation to avoid hiding a running test timer. Same-document entry into the hash also reloads. SPA navigation removes the view and restores exact previous display/inert state. Shadow DOM keeps styles scoped and filter key events away from native shortcuts. Storage/reset controls require trusted events; displayed aggregates are visible to page scripts.
- Practice focus ranks characters with mistakes and at least 20 attempts. The full table supports count/rate/attempt rankings, language/layout filters, substitutions, and separate extras/deletions. No physical-finger inference.
- Correcting an error retains it. A replacement is another attempt. Automatic input/deletion is excluded. Spaces/punctuation count; skipped letters are not fabricated.
- Schema remains version 1. Canonical v1 imports discard unknown fields. No manifest key was added: unpacked path identities remain compatible. The installer explicitly accepts the tested old-to-new display name transition, not arbitrary name mismatches. Updates must replace files in the same folder, reload extension, then reload idle site tabs. Backup before updating.
- No accounts, sync, cloud service, telemetry, paid registration, or Web Store distribution. Only storage permission and monkeytype.com content injection.

## Architecture and reliability

`core.js` owns pure analysis, bounds/consistency validation, canonical backup copying, transactional safe-integer merges and 10,000-hash deduplication. `collector.js` observes hooks without wrapping them, snapshots settings during trusted input, queues up to 100 pending summaries and retries independently of newer completed tests. It skips stale pre-connection logs. `relay.js` bridges aggregates; site messages are not tamper-resistant. `background.js` serializes storage operations, isolates per-tab session statuses, restricts dashboard mutations to extension pages, and acknowledges only accepted writes. Failed writes preserve earlier data. Reset/restore retain one Undo snapshot.

`menu.js` has a guarded/remountable native link and throttles searches while unmounted. `integrated.js` owns hash navigation, mounting, focus, shell restoration and trusted toolbar messages. `integrated.css` maps the shared view onto live native theme variables. `dashboard.*` supplies one shared UI/controller plus recovery page; the build prepends canonical HTML/CSS/core assets into the controller for isolated in-page rendering without extra web-accessible resources. `popup.*` supplies toolbar access. `scripts/build.cjs` only writes dist/extension. `install-local.cjs` is explicit and checks identity/checkout overlap. `package.py` makes a deterministic extension-root ZIP plus SHA256SUMS. CI runs tests/check/build/package; version tags create a draft for final acceptance before publication.

## Known boundaries

The internal version-1 event hook and menu markup can change. Standard tests only: Zen, bailouts, Funbox, opposite-shift, composition/IME and surrogate-pair characters are excluded. Pending tab-memory saves can be lost on unload. Polling can miss tests entirely between 750ms checks. Snapshot capture requires trusted keyboard input after connection. Unknown settings are not invented from an old log. Data/undo share Chrome's quota; overflow and quota errors must never silently clear data. Other browsers/platforms and a formal assistive-technology audit are untested. Hash destinations are extension-provided; full path /typing-mistakes would need server support or broader interception. Do not modify Monkeytype router/engine internals. Native themes can have low contrast; integration deliberately follows the user’s chosen theme.

Keep private backups, personal installation paths/profile details, and local validation tooling under ignored `.local/`. Public screenshots must use synthetic data. No automated results in the user's real account history. The user authorized public repository/release publication after checks; do not request the same permission again.
