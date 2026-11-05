# Development

[← Contributing](../CONTRIBUTING.md) · [Release checks](VERIFICATION.md)

This page is for building and testing the extension. To install the public download, use [setup](SETUP.md); it needs no development tools.

## Build locally

Use **Node.js 24+** and **Python 3**. Python is only needed for ZIP packaging. There are no runtime npm dependencies.

```sh
git clone https://github.com/vibhor1102/monkeytype-local-analytics.git
cd monkeytype-local-analytics
npm run verify
```

| Command | Result |
| --- | --- |
| `npm test` | Accounting, validation, collector, and background tests. |
| `npm run check` | JavaScript syntax, manifest references, and matching versions. |
| `npm run build` | Ready-to-load extension in `dist/extension`. |
| `npm run package` | Builds the extension, ZIP, and `dist/SHA256SUMS`. |
| `npm run verify` | Runs tests, checks, and packaging. |

Load `dist/extension` in a disposable Chrome profile. Generated `dist/` is ignored and isn’t source.

Normal builds only write inside `dist/`. To update a separate existing unpacked install deliberately:

```sh
npm run install:local -- --target /absolute/existing/install/path --dry-run
npm run install:local -- --target /absolute/existing/install/path
```

Back up first. This command copies files; it doesn’t reload Chrome. Keep the install path unchanged, then reload the extension and idle Monkeytype tabs.

## Browser checks

Optional Playwright tooling stays under ignored `.local/`:

```sh
npm install --prefix .local/browser playwright
npm run test:view
npm run test:browser
```

Both commands need installed Google Chrome. `test:view` checks the compiled controller’s loading and failure/recovery states with synthetic data and no site requests. `test:browser` uses the live Monkeytype site, a temporary signed-out profile, and automated typing. It must never use a real signed-in account.

To check the actual distribution, extract its ZIP and point the tests at that folder:

```sh
MLA_EXTENSION_DIR=/path/to/extracted/extension npm run test:view
MLA_EXTENSION_DIR=/path/to/extracted/extension npm run test:browser
```

### Existing-profile UI checks

`test:ui` is a separate, deliberate check against a local Chrome debugging endpoint. It types no tests or changes analytics. Keep the endpoint on a trusted local interface.

```sh
MLA_EXTENSION_ID=your-installed-extension-id npm run test:ui
```

Copy the ID from the extension’s card at `chrome://extensions` with Developer mode on. The default endpoint is `http://127.0.0.1:9222`; override it with `MLA_CDP_ENDPOINT`. The profile must already be signed in for the account-menu check. `MLA_START_PATH=/` starts from typing if Monkeytype’s native account route won’t load.

Attach with `noDefaults:true` so Playwright doesn’t change unrelated tabs. Emulate media only on the dedicated test tab, and clear overrides in `finally` on success and failure. The script checks unrelated-tab preferences and complete local storage, then closes its own tabs.

## Release a version

1. Match versions in `package.json` and `extension/manifest.json`.
2. Run `npm run verify`, then test the extracted ZIP in Chrome.
3. Check updates preserve the existing install ID and complete storage. Use private backups; don’t commit them.
4. Push the version tag. The release workflow creates a **draft** with the ZIP and checksum.
5. Download those assets, verify SHA-256 and extracted files, and run browser checks from the download.
6. Write short release notes for users, publish, and check anonymous downloads.

The ZIP is repeatable with the same Python/zlib toolchain. Different compression versions can change archive bytes without changing its files, so verify against the checksum shipped with that release.

Never commit `.local/`, browser data, credentials, private backups, or personal install paths. Public screenshots must use synthetic data. See [maintainer handoff](../HANDOFF.md) for architecture and known technical boundaries.
