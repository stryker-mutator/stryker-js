import test from "node:test";
import assert from "node:assert/strict";

test("a fails fast", () => {
  assert.equal(1, 2);
});

test("b is slow", async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
});
