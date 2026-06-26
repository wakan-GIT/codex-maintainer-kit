import { promises as fs } from "node:fs";
import path from "node:path";

const checks = [
  {
    id: "readme",
    points: 15,
    title: "README explains purpose and usage",
    run: async (root) => {
      const readme = await readFirst(root, ["README.md", "readme.md"]);
      return {
        passed: Boolean(readme && /usage|install|quickstart|getting started/i.test(readme)),
        detail: readme ? "README found with usage-oriented language." : "README.md is missing."
      };
    }
  },
  {
    id: "license",
    points: 10,
    title: "License is present",
    run: async (root) => {
      const exists = await existsAny(root, ["LICENSE", "LICENSE.md", "COPYING"]);
      return {
        passed: exists,
        detail: exists ? "License file found." : "Add a LICENSE file so adopters know how they can use the project."
      };
    }
  },
  {
    id: "agent-guidance",
    points: 15,
    title: "Agent guidance is present",
    run: async (root) => {
      const agentFile = await readFirst(root, ["AGENTS.md", ".github/copilot-instructions.md"]);
      return {
        passed: Boolean(agentFile && /test|review|security|scope|approval|maintenance/i.test(agentFile)),
        detail: agentFile ? "Agent guidance found." : "Add AGENTS.md or .github/copilot-instructions.md for AI coding agents."
      };
    }
  },
  {
    id: "tests",
    points: 15,
    title: "Test command is discoverable",
    run: async (root) => {
      const packageJson = await readJson(path.join(root, "package.json"));
      const hasPackageTest = Boolean(packageJson?.scripts?.test);
      const hasTestDir = await pathExists(path.join(root, "test"));
      return {
        passed: hasPackageTest || hasTestDir,
        detail: hasPackageTest ? "package.json includes a test script." : "No test script found."
      };
    }
  },
  {
    id: "ci",
    points: 10,
    title: "Continuous integration exists",
    run: async (root) => {
      const hasCi = await existsAny(root, [
        ".github/workflows/ci.yml",
        ".github/workflows/ci.yaml",
        ".gitlab-ci.yml"
      ]);
      return {
        passed: hasCi,
        detail: hasCi ? "CI workflow found." : "Add a CI workflow so automated changes can be verified."
      };
    }
  },
  {
    id: "contributing",
    points: 10,
    title: "Contribution path is documented",
    run: async (root) => {
      const hasGuide = await existsAny(root, ["CONTRIBUTING.md", ".github/CONTRIBUTING.md"]);
      return {
        passed: hasGuide,
        detail: hasGuide ? "Contribution guide found." : "Add CONTRIBUTING.md with setup, test, and review expectations."
      };
    }
  },
  {
    id: "secret-hygiene",
    points: 15,
    title: "Secret hygiene looks safe",
    run: async (root) => {
      const findings = await scanForSecretHints(root);
      return {
        passed: findings.length === 0,
        detail: findings.length === 0 ? "No common secret hints found in scanned text files." : `Potential secret hints: ${findings.slice(0, 5).join(", ")}`
      };
    }
  },
  {
    id: "release-notes",
    points: 10,
    title: "Change history is documented",
    run: async (root) => {
      const hasChangelog = await existsAny(root, ["CHANGELOG.md", "RELEASES.md"]);
      return {
        passed: hasChangelog,
        detail: hasChangelog ? "Change history found." : "Add CHANGELOG.md before the first public release."
      };
    }
  }
];

export async function auditRepository(rootPath) {
  const root = path.resolve(rootPath);
  const stat = await fs.stat(root).catch(() => null);
  if (!stat?.isDirectory()) {
    throw new Error(`Repository path does not exist or is not a directory: ${root}`);
  }

  const results = [];
  for (const check of checks) {
    const outcome = await check.run(root);
    results.push({
      id: check.id,
      title: check.title,
      points: check.points,
      passed: outcome.passed,
      detail: outcome.detail
    });
  }

  const score = results.reduce((sum, result) => sum + (result.passed ? result.points : 0), 0);
  return {
    tool: "codex-maintainer-kit",
    auditedPath: root,
    score,
    maxScore: 100,
    grade: grade(score),
    results,
    recommendations: results.filter((result) => !result.passed).map((result) => result.detail)
  };
}

function grade(score) {
  if (score >= 90) return "ready";
  if (score >= 70) return "nearly-ready";
  if (score >= 50) return "needs-work";
  return "not-ready";
}

async function existsAny(root, names) {
  for (const name of names) {
    if (await pathExists(path.join(root, name))) return true;
  }
  return false;
}

async function readFirst(root, names) {
  for (const name of names) {
    const content = await fs.readFile(path.join(root, name), "utf8").catch(() => null);
    if (content !== null) return content;
  }
  return null;
}

async function readJson(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

async function pathExists(filePath) {
  return Boolean(await fs.stat(filePath).catch(() => null));
}

async function scanForSecretHints(root) {
  const findings = [];
  const ignored = new Set([".git", "node_modules", "dist", "build", ".next", ".wrangler"]);
  const secretPattern = /(api[_-]?key|secret|token|password|private[_-]?key)\s*[:=]\s*['"]?[A-Za-z0-9_./+=-]{12,}/i;

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (ignored.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && isTextFile(entry.name)) {
        const content = await fs.readFile(fullPath, "utf8").catch(() => "");
        if (secretPattern.test(content)) {
          findings.push(path.relative(root, fullPath));
        }
      }
    }
  }

  await walk(root);
  return findings;
}

function isTextFile(fileName) {
  return /\.(md|txt|js|mjs|cjs|ts|tsx|json|yaml|yml|toml|env|example|gitignore)$/i.test(fileName) || fileName === "Dockerfile";
}
