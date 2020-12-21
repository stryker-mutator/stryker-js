import { MochaOptions } from '../../src-generated/mocha-runner-options';
import { DEFAULT_MOCHA_OPTIONS } from '../../src/mocha-options-loader';

export function createMochaOptions(overrides?: Partial<MochaOptions>): MochaOptions {
  return { ...DEFAULT_MOCHA_OPTIONS, ...overrides };
}
