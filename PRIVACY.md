# Privacy

The extension requests `storage` and runs content scripts only on `https://monkeytype.com/*`. It makes no network requests. Monkeytype itself continues to use its own services normally.

The page adapter reads the current/completed test event log and language/layout/Funbox/opposite-shift settings. Raw logs and text are processed transiently in the Monkeytype tab. Only aggregate expected-character counts, substitution counts, manual deletions, extra insertions, language/layout/mode labels, test totals, last-test timestamp, and up to 10,000 SHA-256 log hashes are persisted in `chrome.storage.local`. An undo snapshot can retain the preceding aggregates. Recent tab statuses are ephemeral session storage. No account identifiers, credentials, raw test text, or physical keystroke timing history is stored.

Data belongs to the Chrome profile, across Monkeytype sign-ins. There is no account/cloud/Chrome Sync. Browser storage clearing, uninstalling, or losing the profile can erase it. Exported backups contain your aggregates and should be treated as personal data. Restore replaces the current data. Reset keeps one undo snapshot and deduplication hashes; it is not secure erasure. Removing the extension clears its browser-managed storage.

A website script can spoof adapter messages or acknowledgements. This is a personal learning aid, not tamper-resistant evidence. No secrets cross the bridge. Incoming counts are validated and unknown backup fields discarded.
