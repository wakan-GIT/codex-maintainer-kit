# Contributing

Thanks for helping improve Codex Maintainer Kit.

## Setup

```bash
npm install
npm test
```

The package currently has no dependencies, so `npm install` only prepares the lockfile if needed.

## Pull requests

- Keep changes focused.
- Include tests for new checks or formatter behavior.
- Update `README.md` when user-facing behavior changes.
- Do not include secrets, private repository names, or customer data in fixtures.

## Maintainer review

Before merging, maintainers should check:

- `npm test` passes
- output remains readable in markdown and JSON
- new checks have clear remediation text
