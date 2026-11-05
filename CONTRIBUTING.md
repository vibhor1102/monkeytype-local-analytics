# Contributing

Bug reports, useful ideas, and focused pull requests are welcome.

## Report a bug or suggest a change

Check [common fixes](docs/TROUBLESHOOTING.md) first, then [open an issue](https://github.com/vibhor1102/monkeytype-local-analytics/issues/new/choose). Include clear steps and browser/extension versions. For an idea, explain the problem it would solve.

Keep private backups, browser profiles, and account details out of issues and screenshots. Report security problems through [the private reporting route](SECURITY.md).

## Change the code

1. Read [the development guide](docs/DEVELOPMENT.md) and the repository’s [working instructions](AGENTS.md).
2. Keep the change focused. Explain what users will notice and why it helps.
3. Run `npm run verify` and any browser checks relevant to the change.
4. In your pull request, describe the change and how you checked it. Say plainly what you couldn’t test.

Please preserve these product choices:

- Correcting a mistake must keep the original mistake; the replacement is another attempt.
- Stats stay local, with narrow permissions and no runtime dependencies.
- Existing saved data and install identities must survive updates. Plan and test migrations before changing storage.
- Monkeytype’s typing, authentication, and result submission keep working normally.

For automated typing and destructive recovery tests, use a temporary signed-out browser profile. Never submit automated results to someone’s account. More detail is in [browser testing](docs/DEVELOPMENT.md#browser-checks).
