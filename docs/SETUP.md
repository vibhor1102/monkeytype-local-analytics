# Setup and help

## Install

1. Open the [latest release](https://github.com/vibhor1102/monkeytype-local-analytics/releases/latest). Under **Assets**, download **monkeytype-local-analytics-1.4.0.zip**, not “Source code”.
2. Extract it to a folder you’ll keep. Chrome loads the extension from that folder, so don’t delete or move it afterwards.
3. Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the folder with `manifest.json` directly inside it. **Monkeytype Typing Mistakes** should appear and be enabled.
4. Reload Monkeytype and finish a new **words** or **time** test with Funbox off.
5. Open **Typing mistakes** below **User stats** in the account menu. Without signing in, use Chrome’s puzzle-piece **Extensions** button → **Monkeytype Typing Mistakes** → **Open on Monkeytype →**.

Desktop Chrome 111+ is required. Only Linux Chrome has been tested. Installation uses Developer mode rather than the Web Store; updates are manual.

## Reading the stats

Counts belong to the character Monkeytype expected. If **c** was expected and you type **x**, Backspace, then **c**, that records **two attempts and one mistake** for **c**. Deletions are counted separately. This error rate can differ from Monkeytype’s accuracy.

Practice suggestions need at least **20 attempts per character**. The table still shows smaller samples. Use **clear filters** if you’ve hidden rows, and scroll sideways in narrow windows for all columns.

Only new completed standard tests are recorded. Zen, abandoned tests, Funbox, opposite-shift, composition/IME input, and some Unicode characters such as emoji are excluded. Past account results can’t be imported.

## Backups and updates

Expand **backups & data** near the bottom of Typing mistakes. **Export backup** downloads a JSON file; keep it somewhere safe. **Restore backup** replaces current stats rather than merging them. Reset and restore keep one **previous snapshot**, but restoring it can also replace newer tests. Export first.

To update:

1. Finish active tests and wait for pending saves. Export a backup.
2. Extract the new ZIP elsewhere, then copy its files **into your existing install folder**, replacing the old files. Don’t nest the new folder inside it.
3. At `chrome://extensions`, click the extension’s **Reload** button. Reload idle Monkeytype tabs and check your totals.

**Keep the same folder; don’t uninstall to update.** A different folder or Chrome profile can have separate data. To move, export first, install in the new location, then restore. Removing the extension or clearing its data can erase stats.

## Common problems

| Problem | Try this |
| --- | --- |
| Chrome won’t load it | Extract the named ZIP and select the folder containing `manifest.json`, not the ZIP or an outer folder. |
| No tests appear | Reload Monkeytype, finish a new words/time test with Funbox off, and clear filters. Click the collection indicator for any exclusion message. |
| The menu entry is missing | Use the extension’s toolbar button. |
| A save is failing | Keep the typing tab open for retries. Closing or reloading can lose pending tests. Export preserves already-saved stats; it doesn’t free storage or include pending tests. |
| The page won’t open | Check that Monkeytype itself loads. For backup access, use `chrome://extensions` → **Details** → **Extension options**. |

Still stuck? [Open an issue](https://github.com/vibhor1102/monkeytype-local-analytics/issues/new/choose) with your browser/extension versions, what happened, and the collection message. Don’t post private backups or account details.
