// @ts-check
import { beforeEach } from "vitest";
import { add } from "./src/math.js";

beforeEach((a) => {
  console.log(`Detected: ${a.task.file.name}`);
  globalThis.add = add;
});
