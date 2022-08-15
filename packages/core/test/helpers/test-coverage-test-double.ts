import { TestResult } from '@stryker-mutator/api/test-runner';
import { I } from '@stryker-mutator/util';

import { TestCoverage } from '../../src/mutants/index.js';

export class TestCoverageTestDouble implements I<TestCoverage> {
  public testsByMutantId = new Map<string, Set<TestResult>>();

  public testsById = new Map<string, TestResult>();
  public hitsByMutantId = new Map<string, number>();
  public staticCoverage: Record<string, boolean> = {};
  public hasStaticCoverage(mutantId: string): boolean {
    return this.staticCoverage[mutantId] ?? false;
  }
  public hasCoverage = false;

  public addTest(...testResults: TestResult[]): void {
    for (const testResult of testResults) {
      this.testsById.set(testResult.id, testResult);
    }
  }
  public addCoverage(mutantId: number | string, testIds: string[]): void {
    this.hasCoverage = true;
    this.testsByMutantId.set(
      mutantId.toString(),
      new Set(
        testIds.map((testId) => {
          const test = this.testsById.get(testId);
          if (!test) {
            throw new Error(`Test ${testId} not found`);
          }
          return test;
        })
      )
    );
  }
  public forMutant(mutantId: string): Set<TestResult> | undefined {
    return this.testsByMutantId.get(mutantId);
  }
}
