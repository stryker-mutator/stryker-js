import { MochaOptions } from '../../src/MochaOptions';
import { DEFAULT_MOCHA_OPTIONS } from '../../src/MochaOptionsLoader';

export function createMochaOptions(overrides: Partial<MochaOptions>): MochaOptions {
  return { ...DEFAULT_MOCHA_OPTIONS, ...overrides };
}
