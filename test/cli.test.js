import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runCli } from "../src/cli.js";

describe("runCli", () => {
  it("prints help without auditing a path", async () => {
    const output = [];
    await runCli(["--help"], {
      cwd: "/path/that/does/not/exist",
      stdout: { write: (value) => output.push(value) },
      stderr: { write: () => {} }
    });

    assert.match(output.join(""), /Usage:/);
  });
});
