import { auditRepository } from "./index.js";
import { formatJson, formatMarkdown } from "./format.js";

export async function runCli(argv, io) {
  const options = parseArgs(argv, io.cwd);
  if (options.help) {
    io.stdout.write(helpText());
    return;
  }

  const report = await auditRepository(options.path);
  const output = options.format === "json" ? formatJson(report) : formatMarkdown(report);
  io.stdout.write(`${output}\n`);

  if (options.failUnder !== null && report.score < options.failUnder) {
    io.stderr.write(`Score ${report.score} is below --fail-under ${options.failUnder}\n`);
    process.exitCode = 2;
  }
}

function parseArgs(argv, cwd) {
  const options = {
    path: cwd,
    format: "markdown",
    failUnder: null,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--path") {
      options.path = readValue(argv, index, arg);
      index += 1;
    } else if (arg === "--format") {
      options.format = readValue(argv, index, arg);
      index += 1;
    } else if (arg === "--fail-under") {
      options.failUnder = Number(readValue(argv, index, arg));
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
      return options;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!["markdown", "json"].includes(options.format)) {
    throw new Error("--format must be markdown or json");
  }

  if (options.failUnder !== null && (!Number.isFinite(options.failUnder) || options.failUnder < 0 || options.failUnder > 100)) {
    throw new Error("--fail-under must be a number from 0 to 100");
  }

  return options;
}

function readValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function helpText() {
  return `codex-maintainer-kit

Usage:
  codex-maintainer-kit --path . --format markdown

Options:
  --path <dir>          Repository path to audit
  --format <type>      markdown or json
  --fail-under <score> Exit with code 2 when score is below the threshold
`;
}
