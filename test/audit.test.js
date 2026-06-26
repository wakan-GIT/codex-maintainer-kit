import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { auditRepository } from "../src/index.js";

describe("auditRepository", () => {
  it("scores a maintained repository as ready", async () => {
    const root = await makeRepo({
      "README.md": "# Demo\n\n## Usage\n\nRun the tool.",
      "LICENSE": "MIT",
      "AGENTS.md": "Run tests, keep scope small, review security, ask approval for releases.",
      "package.json": JSON.stringify({ scripts: { test: "node --test" } }),
      ".github/workflows/ci.yml": "name: CI",
      "CONTRIBUTING.md": "Run npm test before opening a PR.",
      "CHANGELOG.md": "# Changelog"
    });

    const report = await auditRepository(root);

    assert.equal(report.score, 100);
    assert.equal(report.grade, "ready");
  });

  it("warns when secret-like values are present", async () => {
    const secretLikeLine = ["api", "_key = ", "\"example_secret_value_12345\""].join("");
    const root = await makeRepo({
      "README.md": "# Demo\n\n## Usage\n\nRun the tool.",
      "config.example": secretLikeLine
    });

    const report = await auditRepository(root);
    const secretCheck = report.results.find((result) => result.id === "secret-hygiene");

    assert.equal(secretCheck.passed, false);
    assert.match(secretCheck.detail, /config\.example/);
  });
});

async function makeRepo(files) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "codex-maintainer-kit-"));
  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = path.join(root, relativePath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);
  }
  return root;
}
