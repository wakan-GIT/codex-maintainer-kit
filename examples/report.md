# Example Report

```bash
node bin/codex-maintainer-kit.js --path . --format markdown
```

The command prints a repository readiness score and a table of pass/warn checks that can be pasted into pull requests, issue triage notes, or release preparation docs.

Example summary:

| Status | Points | Check |
| --- | ---: | --- |
| PASS | 15 | README explains purpose and usage |
| WARN | 10 | Contribution path is documented |

Warnings are meant to be actionable, not punitive. A repository can adopt the checklist incrementally.
