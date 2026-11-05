# Contributing

For bugs or ideas, [open an issue](https://github.com/vibhor1102/monkeytype-local-analytics/issues/new/choose). Include browser/extension versions and steps to repeat a problem. Don’t attach private backups or account details.

## Build and check

Use **Node.js 24+** and **Python 3**. There are no runtime npm dependencies.

```sh
npm run verify
```

This runs tests, source/manifest checks, and packaging. The ready-to-load folder is `dist/extension`; the ZIP and checksum are also in `dist/`. `npm run build` builds without testing or packaging. Normal builds don’t install into an existing user folder.

Optional browser checks need installed Google Chrome and Playwright:

```sh
npm install --prefix .local/browser playwright
npm run test:view
npm run test:browser
```

These use temporary profiles. Automated typing must stay signed out of real accounts. To test an extracted release, set `MLA_EXTENSION_DIR=/path/to/extracted/extension` for either command. Existing-profile UI checks must type no tests, preserve storage, attach with `noDefaults:true`, and clear tab-only theme overrides in `finally`.

## Submit a change

Keep changes focused and explain how you checked them. Preserve existing data, local-only storage, and corrected-mistake accounting: a correction keeps the error and adds another attempt. Don’t change Monkeytype’s typing, authentication, or result submission.

Keep browser profiles, private backups, credentials, and generated `dist/` out of commits. Public screenshots must use example data.

Before publishing a release, check the extracted ZIP in Chrome, verify the downloaded checksum, and confirm an existing installation keeps its identity and saved data after updating in the same folder.
