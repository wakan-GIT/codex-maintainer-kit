# Security Policy

## Reporting a vulnerability

Please open a private security advisory on GitHub when available. If that is not available, contact the maintainer privately before publishing exploit details.

Include:

- affected version or commit
- reproduction steps
- expected and actual behavior
- whether the issue can expose secrets or change files unexpectedly

## Scope

This project reads repository files and prints a local report. It should not send repository contents to external services.

Security-sensitive changes include:

- expanding the set of scanned files
- adding network access
- adding dependencies
- changing secret detection behavior
- changing CI failure behavior

These changes need maintainer review before release.
