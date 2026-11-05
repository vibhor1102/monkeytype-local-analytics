# Set up Typing Mistakes

[← Overview](../README.md) · [Read your stats](USAGE.md) · [Help](TROUBLESHOOTING.md)

You’ll need desktop Google Chrome. The extension has been tested on Linux Chrome; Windows, macOS, and other browsers haven’t been tested. Chrome 111 or newer is required.

**Free to install. No extra account, Node.js, or terminal commands needed.** Installation uses Chrome’s Developer mode rather than the Chrome Web Store. Updates are manual.

[Install](#install) · [Update](#update-without-losing-your-stats) · [Backups](#back-up-and-restore) · [Move or remove](#move-or-remove-the-extension)

## Install

### 1. Download and extract

Open the [latest release](https://github.com/vibhor1102/monkeytype-local-analytics/releases/latest). Under **Assets**, download **monkeytype-local-analytics-1.4.0.zip**.

Choose the named ZIP, not either “Source code” download. Extract it into a folder you plan to keep, such as `Documents/Monkeytype Typing Mistakes`. Don’t leave it in a temporary extraction folder or delete it after installation.

Inside that folder, you should see **manifest.json** alongside the extension’s other files. If extraction adds an extra outer folder, use the inner folder containing `manifest.json` in the next step.

### 2. Load it in Chrome

1. Paste `chrome://extensions` into Chrome’s address bar and press Enter.
2. Turn on **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the extracted folder containing `manifest.json`.
4. Check that **Monkeytype Typing Mistakes** appears and is enabled.

Chrome may show a warning about developer extensions. Only load files downloaded from this repository’s releases. Keep the extracted folder in place.

### 3. Record your first test

1. Open [Monkeytype](https://monkeytype.com), or reload any Monkeytype tab that was already open.
2. Finish a new standard test. For a first check, use **words** or **time** with Funbox off.
3. Open **Typing mistakes** immediately below **User stats** in the account menu.

**Not signed in?** Click Chrome’s puzzle-piece **Extensions** button, choose **Monkeytype Typing Mistakes**, then **Open on Monkeytype →**. You can pin the extension for easier access later. No Monkeytype sign-in is required.

Your test total should increase. The table shows character attempts even if you made no mistakes. Practice suggestions need at least **20 attempts per character**, so they may take a few tests to appear.

Recording starts with new tests; it can’t analyse your past Monkeytype results. If nothing appears, follow [the first-test checks](TROUBLESHOOTING.md#my-first-test-didnt-appear).

## Update without losing your stats

**Keep the same folder and the same Chrome extension. Don’t uninstall it as part of an update.** Loading a different folder can give you a separate installation with separate data.

1. Finish active tests. If a save is pending, keep the tab open and wait for **saved locally**. You can click the collection indicator for details.
2. In Typing mistakes, expand **backups & data** and click **Export backup**. Keep the downloaded JSON file somewhere safe.
3. Download the new release and extract it **elsewhere first**.
4. Copy the extracted files into your **existing install folder**, replacing the old files. Don’t put the new folder inside the old one.
5. Open `chrome://extensions`. On **Monkeytype Typing Mistakes**, click the circular **Reload** button.
6. Reload your idle Monkeytype tabs, open Typing mistakes, and check your test total.

Updates are not automatic. You don’t need to repeat **Load unpacked** when updating in the same folder.

## Back up and restore

In Typing mistakes, scroll down and expand **backups & data**.

| Control | What it does |
| --- | --- |
| **Export backup** | Downloads a JSON file containing your saved stats. Keep it outside the extension folder. |
| **Restore backup** | Replaces the current stats with the backup you choose. It does **not** merge them. |
| **Reset data** | Starts your visible stats over, keeping one previous snapshot. |
| **Restore previous snapshot** | Replaces the current stats with the snapshot kept before the last reset or restore. Newer tests can be replaced too. |

**Export before restoring or resetting.** The previous snapshot is only one level deep; a downloaded backup is the safer long-term copy. Backups contain personal typing stats, so don’t post them in public issues.

## Move or remove the extension

**Moving to another folder, profile, or computer:** export a backup first, install in the new location, then restore the backup there. Check the totals before removing the old copy. Stats don’t move through your Monkeytype account or Chrome Sync.

**Removing it:** export anything you want to keep, then use **Remove** in `chrome://extensions`. Removing the extension or clearing its browser data can erase your saved stats. Deleting the extracted folder also stops Chrome from loading it.

## Check a download’s checksum (optional)

The release includes **SHA256SUMS**, a short file used to check that a ZIP downloaded correctly. This step isn’t required to install.

Download it beside the ZIP. On Linux, run `sha256sum -c SHA256SUMS` from that folder. On Windows, use `Get-FileHash` on the ZIP and compare its SHA-256 value with the one in SHA256SUMS. Use the checksum from the same release as the ZIP.
