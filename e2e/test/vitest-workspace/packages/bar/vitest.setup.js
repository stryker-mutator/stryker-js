// @ts-check
import { beforeEach } from "vitest";
import * as math from "./src/math.js";

beforeEach(() => {
  globalThis.math = math;
});
