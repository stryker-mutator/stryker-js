import test from "node:test";

test("exits the process with a non-zero code instead of finishing", () => {
  process.exit(1); // aborts the run with a failure code before a terminal message
});
