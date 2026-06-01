import test from "node:test";

test("exits the process instead of finishing", () => {
  process.exit(0); // crashes the run before a terminal message
});
