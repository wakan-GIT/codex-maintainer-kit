# Codex Maintainer Kit

Codex Maintainer Kit is a small dependency-free CLI for open-source maintainers who want a quick repository readiness check before inviting AI coding agents into their workflow.

It checks for the basics that make automated maintenance safer:

- clear README usage notes
- license and contribution path
- agent instructions for tools such as Codex
- test and CI discoverability
- common secret-hygiene mistakes
- public release notes

## Usage

Run against the current repository:

```bash
node bin/codex-maintainer-kit.js --path . --format markdown
```

Return JSON for automation:

```bash
node bin/codex-maintainer-kit.js --path . --format json
```

Fail CI when the score is too low:

```bash
node bin/codex-maintainer-kit.js --path . --fail-under 80
```

## Why this exists

AI coding agents are most useful when maintainers have already made project intent, test commands, security boundaries, and contribution expectations explicit. This tool turns those expectations into a fast check that can run locally or in CI.

The goal is not to replace human maintainers. The goal is to help maintainers prepare repositories so AI-generated pull requests, reviews, and release tasks are easier to inspect, reproduce, and reject when needed.

## Checks

| Check | Weight |
| --- | ---: |
| README explains purpose and usage | 15 |
| License is present | 10 |
| Agent guidance is present | 15 |
| Test command is discoverable | 15 |
| Continuous integration exists | 10 |
| Contribution path is documented | 10 |
| Secret hygiene looks safe | 15 |
| Change history is documented | 10 |

## Development

```bash
npm test
npm run check
```

The project has no runtime dependencies and targets Node.js 18 or later.

## Roadmap

- add language-specific test command detection
- support configurable check weights
- emit GitHub step summary output
- add reusable AGENTS.md templates for common project types
- add a mode that opens issues for missing maintainer-readiness tasks

## License

MIT
