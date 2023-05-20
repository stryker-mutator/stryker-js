import { beforeAll } from 'vitest';
import * as math from './math';

beforeAll(() => {
  globalThis.math = math;
});
