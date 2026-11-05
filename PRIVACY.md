# Privacy

**Your typing stats stay in your Chrome profile. The extension doesn’t upload them, track you, or sync them to an account.**

## What it reads

While you use Monkeytype, the extension reads the current or completed test and the settings needed to interpret it, such as language, layout, and test mode. It processes test text in the tab to count attempts and mistakes.

It doesn’t collect passwords, account identifiers, or data from other websites.

## What it saves

- Character attempts, mistakes, and what you typed instead.
- Extra insertions and manual deletion counts.
- Test totals, language/layout/mode labels, and the latest saved test’s timestamp.
- Up to 10,000 test fingerprints to avoid counting the same test twice. These are hashes, not copies of the test text.
- One previous snapshot after a reset or restore, plus small bookkeeping values used to keep changes consistent between tabs.

It **doesn’t save raw test text or a history of individual keystroke timings**. Recent collection messages are temporary. Filters, scroll position, and the focused control are remembered for the tab.

## Who can see the stats?

People using the same Chrome profile share the same stats, even across different Monkeytype sign-ins.

The dashboard appears inside Monkeytype. As with other content displayed on a website, **scripts on that page can read the displayed stats**. Direct storage, backup, and reset operations run in the extension’s separate script context.

There is no account/cloud/Chrome syncing. The extension makes no network requests of its own; Monkeytype continues using its own services normally.

## Permissions

The extension asks for **storage** and runs only on `https://monkeytype.com/*`. It needs that access to read tests and show the Typing mistakes page.

## Backups and removal

Exported backups contain your personal typing stats. Keep them somewhere safe and don’t attach them to public issues.

Restore replaces current data rather than merging it. Reset keeps a previous snapshot and test fingerprints; it isn’t a secure erase. Removing the extension or clearing its browser data can erase saved stats. [Back up before you move or remove it →](docs/SETUP.md#back-up-and-restore)

## A limit to keep in mind

This is a personal practice tool, not a tamper-proof record. A script on Monkeytype can imitate the messages used to report tests. Counts are checked before saving, but the extension can’t prove that a recorded test was genuine.
