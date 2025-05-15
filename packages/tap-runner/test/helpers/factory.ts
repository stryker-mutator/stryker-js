import type { TapRunnerOptions } from '../../src-generated/tap-runner-options.js';
import { strykerValidationSchema } from '../../src/index.js';

export function tapRunnerOptions(
  overrides?: Partial<TapRunnerOptions>,
): TapRunnerOptions {
  return {
    testFiles: [
      ...strykerValidationSchema.properties.tap.properties.testFiles.default,
    ],
    nodeArgs: [
      ...strykerValidationSchema.properties.tap.properties.nodeArgs.default,
    ],
    forceBail:
      strykerValidationSchema.properties.tap.properties.forceBail.default,
    ...overrides,
  };
}
