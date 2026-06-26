export function formatJson(report) {
  return JSON.stringify(report, null, 2);
}

export function formatMarkdown(report) {
  const rows = report.results.map((result) => {
    const status = result.passed ? "PASS" : "WARN";
    return `| ${status} | ${result.points} | ${result.title} | ${escapePipes(result.detail)} |`;
  });

  const recommendations = report.recommendations.length
    ? report.recommendations.map((item) => `- ${item}`).join("\n")
    : "- No blocking recommendations.";

  return `# Codex Maintainer Kit Report

Score: ${report.score}/${report.maxScore}
Grade: ${report.grade}

| Status | Points | Check | Detail |
| --- | ---: | --- | --- |
${rows.join("\n")}

## Recommendations

${recommendations}`;
}

function escapePipes(value) {
  return String(value).replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}
