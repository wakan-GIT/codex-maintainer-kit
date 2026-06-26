# Agent Instructions

Use these rules when an AI coding agent works in this repository.

- Keep the CLI dependency-free unless a dependency removes substantial complexity.
- Run `npm test` after code changes.
- Run `npm run check` before proposing a release.
- Do not add sample credentials, real tokens, private URLs, or customer data.
- Keep output stable enough for CI logs and pull-request comments.
- Prefer small changes that preserve the public API in `src/index.js`.
- Ask for maintainer approval before publishing packages, creating releases, or changing repository visibility.
