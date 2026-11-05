# Monkeytype Typing Mistakes

See which characters you mistype on [Monkeytype](https://monkeytype.com), including the mistakes you correct.

**[Download](https://github.com/vibhor1102/monkeytype-local-analytics/releases/latest)** · [Setup guide](docs/SETUP.md) · [Help](docs/TROUBLESHOOTING.md)

A free Chrome extension. Your stats stay in this browser, with no extra account, uploads, or sync. Tested on **Linux Chrome**; other platforms and browsers haven’t been tested.

![Typing mistakes inside Monkeytype, showing example character stats and practice suggestions](docs/dashboard.png)

*Example data, not a real person’s typing history.* [Light theme](docs/dashboard-light.png) · [Narrow window](docs/dashboard-mobile.png)

## What you get

- **Your common mistakes:** character counts, error rates, and what you typed instead.
- **Practice focus:** suggestions once a character has at least 20 attempts.
- **Corrected mistakes included:** Backspace doesn’t erase the original mistake; the replacement is another attempt.
- **A page inside Monkeytype:** the same tab, theme, and font you already use.
- **Backups:** export your stats and restore them later.

<a id="install-from-github-releases"></a>

## Install

1. [Open the latest release](https://github.com/vibhor1102/monkeytype-local-analytics/releases/latest) and download **monkeytype-local-analytics-1.4.0.zip**, not “Source code”.
2. Extract it to a **permanent folder**. Keep that folder: Chrome loads the extension from it.
3. Open `chrome://extensions`, turn on **Developer mode**, choose **Load unpacked**, and select the folder containing `manifest.json`.
4. Reload Monkeytype and finish a new standard test.
5. Open **Typing mistakes** below **User stats** in the account menu, or use the extension’s toolbar button. You can use the toolbar without signing in.

No Node.js, terminal commands, or payment needed. [Detailed setup and update instructions →](docs/SETUP.md)

## Before you start

- Recording starts with **new tests after installation**. Past account results can’t be imported.
- Standard completed tests are supported. Zen, Funbox, abandoned tests, and some input methods are excluded. [What gets recorded →](docs/USAGE.md#what-gets-recorded)
- Stats belong to this **browser profile**, across Monkeytype sign-ins. They don’t follow your account or sync to another device.
- Updates are manual. **Export a backup before updating, moving, or removing the extension.** [Update safely →](docs/SETUP.md#update-without-losing-your-stats)

## Learn more or get help

[Read your stats](docs/USAGE.md) · [Back up your data](docs/SETUP.md#back-up-and-restore) · [Fix a problem](docs/TROUBLESHOOTING.md) · [Privacy](PRIVACY.md)

Found a bug or have an idea? [Open an issue](https://github.com/vibhor1102/monkeytype-local-analytics/issues/new/choose). Don’t attach private backups or account details.

## For contributors

See [contributing](CONTRIBUTING.md), [development](docs/DEVELOPMENT.md), and [release checks](docs/VERIFICATION.md).

Independent project; not affiliated with or endorsed by Monkeytype. Extension code and chart icon are [MIT licensed](LICENSE). Monkeytype is a separate GPL-3.0 project; its name identifies compatibility. No Monkeytype logo, fonts, or implementation code is bundled.
