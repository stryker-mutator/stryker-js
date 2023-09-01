import { beforeAll } from "vitest";
import { min } from "./src/math.js";

beforeAll(() => {
  globalThis.min = min;
});
