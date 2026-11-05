# Privacy

The extension saves stats in your **Chrome profile**. It makes no network requests, uploads, or account/Chrome Sync connections of its own. People sharing a Chrome profile share the same stats, across Monkeytype sign-ins.

It reads Monkeytype tests and relevant settings to count character attempts, mistakes, substitutions, and deletions. It saves those counts, test totals, setting labels, the latest test’s timestamp, and hashes used to avoid duplicate counting. **Raw test text, account identifiers, passwords, and individual keystroke timings aren’t saved.** It runs only on `monkeytype.com` and asks for the `storage` permission.

The dashboard appears inside Monkeytype, so scripts on that page can read the **displayed stats**. Storage and backup/reset operations run in the extension’s separate script context. This is a practice tool, not a tamper-proof record.

Exported backups contain personal typing stats; keep them private. Restore replaces current data. Reset keeps a previous snapshot, so it isn’t a secure erase. Removing the extension or clearing its browser data can erase saved stats.
