import { Config } from 'stryker-api/config';
import * as sinon from 'sinon';
import { TestFramework } from 'stryker-api/test_framework';
import { MutantStatus, MatchedMutant, MutantResult, Reporter, ScoreResult } from 'stryker-api/report';
import { MutationScoreThresholds } from 'stryker-api/core';

export type Mock<T> = {
  [P in keyof T]: sinon.SinonStub;
};

export function mock<T>(constructorFn: { new(...args: any[]): T; }): Mock<T> {
  return sinon.createStubInstance(constructorFn) as Mock<T>;
}

export function mutantResult(overrides: Partial<MutantResult>): MutantResult {
  const defaults: MutantResult = {
    location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
    mutatedLines: '',
    mutatorName: '',
    originalLines: '',
    replacement: '',
    sourceFilePath: '',
    testsRan: [''],
    status: MutantStatus.Killed,
    range: [0, 0]
  };
  return Object.assign(defaults, overrides);
}

export function testFramework(overrides?: Partial<TestFramework>): TestFramework {
  const defaults: TestFramework = {
    beforeEach(codeFragment: string) { return `beforeEach(){ ${codeFragment}}`; },
    afterEach(codeFragment: string) { return `afterEach(){ ${codeFragment}}`; },
    filter(ids: number[]) { return `filter: ${ids}`; }
  };
  return Object.assign(defaults, overrides);
}

export function scoreResult(score: Partial<ScoreResult>): ScoreResult {
  const defaults: ScoreResult = {
    name: 'name',
    path: 'path',
    childResults: [],
    representsFile: true,
    killed: 0,
    timedOut: 0,
    survived: 0,
    totalCovered: 0,
    totalMutants: 0,
    totalDetected: 0,
    totalUndetected: 0,
    errors: 0,
    noCoverage: 0,
    mutationScore: 0,
    mutationScoreBasedOnCoveredCode: 0
  };
  return Object.assign(defaults, score);
}

export function mutationScoreThresholds(overrides?: Partial<MutationScoreThresholds>) {
  const defaults: MutationScoreThresholds = {
    high: 80,
    low: 60,
    break: null
  };
  return Object.assign(defaults, overrides);
}

export function config(overrides?: Partial<Config>) {
  const defaults: Config = new Config();
  return Object.assign(defaults, overrides);
}

export const ALL_REPORTER_EVENTS: Array<keyof Reporter> =
  ['onSourceFileRead', 'onAllSourceFilesRead', 'onAllMutantsMatchedWithTests', 'onMutantTested', 'onAllMutantsTested', 'onScoreCalculated', 'wrapUp'];

export function reporterStub() {
  return {
    onAllMutantsMatchedWithTests: sinon.stub(),
    onSourceFileRead: sinon.stub(),
    onAllMutantsTested: sinon.stub(),
    onAllSourceFilesRead: sinon.stub(),
    onMutantTested: sinon.stub(),
    onScoreCalculated: sinon.stub(),
    wrapUp: sinon.stub()
  };
}

export function matchedMutant(numberOfTests: number): MatchedMutant {
  let scopedTestIds: number[] = [];
  for (let i = 0; i < numberOfTests; i++) {
    scopedTestIds.push(1);
  }
  return {
    mutatorName: '',
    scopedTestIds: scopedTestIds,
    timeSpentScopedTests: 0,
    filename: '',
    replacement: ''
  };
}
