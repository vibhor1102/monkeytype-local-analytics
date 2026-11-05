# Contributing

Use Node 24+ and Python 3. Run `npm run verify` before submitting a change. Keep runtime dependency-free, storage local, and permissions narrow. Tests must preserve corrected mistakes and exercise observable behavior, especially storage failure, recovery, duplicate handling, and event-format compatibility.

Use a disposable signed-out Chrome profile for automated typing and destructive recovery tests. Existing-profile UI checks must type no tests or change analytics; use `noDefaults:true` when attaching over CDP, emulate media only on a dedicated test tab, and always clear overrides in `finally`, including failures. Never submit automated results to a real account, publish browser profiles/backups, or commit `.local/`, `dist/`, credentials, or personal paths. Test the extracted release ZIP. Document unsupported platforms and adapter limitations honestly.

Keep storage schema 1 and path-derived install identities compatible. Version and test any future migration. Build must only write `dist/`; local installation is explicit. Public releases require tests, archive inspection, clean-profile Chrome acceptance, and checksum verification. See `docs/VERIFICATION.md`.

For security concerns, avoid attaching sensitive data to public issues. Report a minimal reproduction without private typing history or credentials; use GitHub private vulnerability reporting if enabled.
