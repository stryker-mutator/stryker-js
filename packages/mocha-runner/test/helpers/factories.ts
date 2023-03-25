import { MochaOptions } from '../../src-generated/mocha-runner-options.js';
import { DEFAULT_MOCHA_OPTIONS } from '../../src/mocha-options-loader.js';

export function createMochaOptions(overrides?: Partial<MochaOptions>): MochaOptions {
  return { ...DEFAULT_MOCHA_OPTIONS, ...overrides };
}
