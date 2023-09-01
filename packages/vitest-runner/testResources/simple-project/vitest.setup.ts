import { beforeAll } from 'vitest';
import * as math from './math.js';

beforeAll(() => {
  globalThis.math = math;
});
