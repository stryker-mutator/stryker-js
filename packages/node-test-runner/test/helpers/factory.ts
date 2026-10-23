import type { NodeTestRunnerOptions } from '../../src-generated/node-test-runner-options.js';
import { strykerValidationSchema } from '../../src/index.js';

export function nodeTestRunnerOptions(
  overrides?: Partial<NodeTestRunnerOptions>,
): NodeTestRunnerOptions {
  return {
    testFiles: [
      ...strykerValidationSchema.properties.nodeTest.properties.testFiles
        .default,
    ],
    concurrency:
      strykerValidationSchema.properties.nodeTest.properties.concurrency
        .default,
    nodeArgs: [
      ...strykerValidationSchema.properties.nodeTest.properties.nodeArgs
        .default,
    ],
    ...overrides,
  };
}
