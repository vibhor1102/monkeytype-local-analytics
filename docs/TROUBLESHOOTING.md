# Get help

[← Overview](../README.md) · [Setup](SETUP.md) · [Read your stats](USAGE.md)

[Can’t install](#chrome-cant-load-the-extension) · [No new stats](#my-first-test-didnt-appear) · [Missing menu entry](#i-cant-find-typing-mistakes) · [Save errors](#a-save-is-pending-or-failing) · [Missing data](#my-stats-disappeared) · [Report a problem](#report-a-problem)

## Chrome can’t load the extension

- Download the named **monkeytype-local-analytics-1.4.0.zip** from the [latest release](https://github.com/vibhor1102/monkeytype-local-analytics/releases/latest), not “Source code”.
- Extract it before using **Load unpacked**. Chrome needs a folder, not the ZIP itself.
- Select the folder with `manifest.json` directly inside it. If there are two nested folders, choose the inner one containing that file.
- Use desktop Google Chrome and turn on **Developer mode** at `chrome://extensions`.

If Chrome blocks Developer mode because the browser is managed by a school or workplace, this installation method may not be available. Ask the administrator rather than changing security settings.

## My first test didn’t appear

1. Check that **Monkeytype Typing Mistakes** is enabled at `chrome://extensions`.
2. Reload Monkeytype after installing or updating the extension.
3. Start and finish a **new** words or time test with Funbox off. Old results can’t be imported.
4. Open Typing mistakes and click the collection indicator near the top. It shows the current tab’s recording status and any reason a test was skipped.
5. Clear filters or lower **min. attempts** if you’ve changed them.

Some modes and input methods are excluded. [Check what gets recorded →](USAGE.md#what-gets-recorded)

## I can’t find Typing mistakes

The menu entry sits directly below **User stats** when you’re signed in to Monkeytype. It may need a page reload after installation.

You can also use Chrome’s puzzle-piece **Extensions** button → **Monkeytype Typing Mistakes** → **Open on Monkeytype →**. This works without a Monkeytype account.

If the menu stops working after a Monkeytype update, try the toolbar button and [report the problem](#report-a-problem).

## A save is pending or failing

**Keep the typing tab open.** Unsaved tests wait there while the extension retries; closing or reloading it can lose those pending tests.

Click the collection indicator for details. **Export backup** saves a copy of stats already stored; it doesn’t include pending tests or free extension storage.

If the extension has reached its storage limit, ordinary browser cache cleanup won’t increase that limit. Keep an exported backup before considering **Reset data**, which replaces saved stats and also keeps a previous snapshot. That snapshot still uses storage, so reset may not make room. Don’t clear extension data or uninstall it while expecting pending tests to survive. [Report a persistent storage error](#report-a-problem) for help choosing a recovery step.

If the extension was updated or disconnected, wait for any pending save if possible, then reload the extension and idle Monkeytype tabs. A test that never saved may need to be repeated. Failed saves leave earlier saved data intact.

## My stats disappeared

- **Changed folders or Chrome profiles?** The new installation may have separate data. Check the original folder and profile before removing anything.
- **Signed into a different Monkeytype account?** That doesn’t move or switch these stats; they belong to the Chrome profile.
- **Filtered everything out?** Choose **clear filters**.
- **Reset or restored data?** Expand **backups & data** and look for **Restore previous snapshot**. It replaces current stats, including newer tests; export first.
- **Removed the extension or cleared its browser data?** Restore an exported backup. Without a backup or the original browser data, the extension can’t recover those stats.

See [backup and restore instructions](SETUP.md#back-up-and-restore).

## A backup won’t restore

Use a JSON file exported by this extension. Monkeytype account exports and result screenshots aren’t supported backups.

An invalid or oversized file is rejected without replacing your current stats. Backups larger than 8 MB aren’t accepted; a smaller file may still exceed the browser’s available extension storage. Export your current data before trying a different backup.

## The page won’t open or looks disconnected

First, check whether Monkeytype’s ordinary pages work. Its own sign-in or “Downloading user data” loading screen can delay access before the extension opens.

Finish active tests and wait for saves before reloading. Then reload Monkeytype and try the toolbar button. **Don’t reinstall as the first fix**—removing the extension can erase its data.

If you need backups while the site page is unavailable, open `chrome://extensions` → **Monkeytype Typing Mistakes** → **Details** → **Extension options**. This opens a separate recovery page with the same backup controls.

## Report a problem

[Open a bug report](https://github.com/vibhor1102/monkeytype-local-analytics/issues/new/choose) with:

- Your operating system, browser version, and extension version.
- What you expected, what happened, and the steps to repeat it.
- The collection-status message, if recording is affected.

Don’t attach backup files, browser profiles, passwords, or account details. Crop or hide personal details in screenshots. For a security issue, use [private reporting](../SECURITY.md).
