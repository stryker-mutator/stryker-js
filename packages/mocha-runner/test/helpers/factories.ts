import { MochaOptions } from '../../src-generated/mocha-runner-options';
import { DEFAULT_MOCHA_OPTIONS } from '../../src/MochaOptionsLoader';

export function createMochaOptions(overrides?: Partial<MochaOptions>): MochaOptions {
  return { ...DEFAULT_MOCHA_OPTIONS, ...overrides };
}
