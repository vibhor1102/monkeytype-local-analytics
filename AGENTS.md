# Working in this repository

- Read `HANDOFF.md` before implementation and `.local/HANDOFF.local.md` when it exists. This checkout is authoritative; previous scratch and nested source copies are retired.
- The user wants a polished, reliable extension for public GitHub distribution with downloadable releases. Account/cloud/Chrome syncing and Web Store publication are out of scope. No registration fees.
- The user has authorized the redesign, implementation, normal verification, and public GitHub repository/release after readiness checks. Do the work autonomously; do not ask for the same authorization again. Never publish credentials, browser data, local backups, or `.local/`.
- Preserve existing analytics and the intended accounting: correcting a mistake does not erase it; the correction is a new attempt. Do not replace the existing extension identity or clear storage without a tested migration.
- `npm run build` must remain portable and must not install into a user's home directory. Use the explicit `install:local` command for an existing install. Generated `dist/` is not source.
- Before claiming readiness, run appropriate tests/checks, verify a real browser install and the release artifact, and distinguish completed checks from untested platforms. No automated results may enter the user's real Monkeytype account history. Prefer a disposable profile; preserve real sign-in/configuration.
- Improve integration without changing Monkeytype's typing engine, result submissions, authentication, or existing navigation. Keep permissions narrow and local-only behavior truthful.
- Use `pkexec` when elevated access is needed. Explain changes assuming the user is unfamiliar with the codebase but willing to learn. Keep updates and final results concise.
- This repository contains an inherited prototype, not an already audited public release. Audit its assumptions; redesign freely within the user's requirements. Do not merely restyle and call it production-ready.
