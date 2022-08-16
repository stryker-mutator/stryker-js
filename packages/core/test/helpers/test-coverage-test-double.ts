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
    const testResultSet = this.testsByMutantId.get(mutantId.toString()) ?? new Set();
    this.testsByMutantId.set(mutantId.toString(), testResultSet);
    for (const testId of testIds) {
      const test = this.testsById.get(testId);
      if (!test) {
        throw new Error(`Test ${testId} not found`);
      }
      testResultSet.add(test);
    }
  }
  public forMutant(mutantId: string): ReadonlySet<TestResult> | undefined {
    return this.testsByMutantId.get(mutantId);
  }
  public clear(): void {
    this.testsById.clear();
    this.testsByMutantId.clear();
    this.staticCoverage = {};
  }
}
