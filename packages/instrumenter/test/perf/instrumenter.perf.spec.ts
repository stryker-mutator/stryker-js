import { promises as fsPromises } from 'fs';
import { platform } from 'os';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createInstrumenter, File, Instrumenter } from '../../src/index.js';
import { createInstrumenterOptions } from '../helpers/factories.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

const isGitHubActionsEnvironment = process.env.GITHUB_ACTIONS === 'true';

/**
 * Prints formatted performance metrics
 */
function logPerformanceMetrics(
  fileName: string,
  actual: number,
  threshold: number,
): void {
  if (isGitHubActionsEnvironment) {
    const message = `Performance: ${fileName} | Actual: ${actual.toFixed(2)}ms | Threshold: ${threshold}ms`;
    console.log(`::notice title=Performance Metrics::${message}`);
  } else {
    const metrics = [
      `Performance: ${fileName}`,
      `  Actual:    ${actual.toFixed(2)}ms`,
      `  Threshold: ${threshold}ms`,
    ];

    console.log('\n' + metrics.join('\n'));
  }
}

describe('instrumenter performance', () => {
  let sut: Instrumenter;

  beforeEach(() => {
    sut = testInjector.injector.injectFunction(createInstrumenter);
  });

  /**
   * Test helper to benchmark instrumentation of a file
   * @param fileName The test resource file name
   */
  async function benchmarkFile(
    fileName: string,
    expectedMutantCount: number,
    performanceThresholdMs: number,
  ): Promise<void> {
    // Arrange
    const filePath = resolveTestResource('instrumenter', 'perf', fileName);
    const file: File = {
      name: filePath,
      mutate: true,
      content: await fsPromises.readFile(filePath, 'utf-8'),
    };
    const options = createInstrumenterOptions();

    // Act
    const startTime = performance.now();
    const result = await sut.instrument([file], options);
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Assert
    expect(result.mutants).lengthOf(
      expectedMutantCount,
      `Expected ${expectedMutantCount} mutants but got ${result.mutants.length}`,
    );
    expect(result.files).lengthOf(1);
    expect(result.files[0].content).to.be.a('string');

    expect(duration).to.be.lessThan(
      performanceThresholdMs,
      `Instrumentation of ${fileName} took ${duration.toFixed(2)}ms, ` +
        `which exceeds the threshold of ${performanceThresholdMs}ms`,
    );

    logPerformanceMetrics(fileName, duration, performanceThresholdMs);
  }

  it('should instrument ts-sample.ts with expected mutant count and within performance threshold', async () => {
    await benchmarkFile('ts-sample.ts', 10, 15);
  });

  it('should instrument benchmark-big.ts with expected mutant count and within performance threshold', async () => {
    await benchmarkFile(
      'benchmark-big.ts',
      948,
      platform() === 'win32' ? 500 : 325,
    );
  });
});
