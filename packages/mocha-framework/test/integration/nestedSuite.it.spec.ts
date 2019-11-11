import * as fs from 'fs';
import * as path from 'path';

import { TestSelection } from '@stryker-mutator/api/test_framework';
import { expect } from 'chai';
import * as execa from 'execa';
import * as rimraf from 'rimraf';

import MochaTestFramework from '../../src/MochaTestFramework';

interface MochaTestRunResult {
  tests: MochaTest[];
  pending: MochaTest[];
  failure: MochaTest[];
  passes: MochaTest[];
}

interface MochaTest {
  title: string;
  fullTitle: string;
}

// See https://github.com/stryker-mutator/stryker/issues/249
describe('Selecting tests with nested suites', () => {
  let sut: MochaTestFramework;
  const nestedSuiteFile = path.resolve(__dirname, '..', '..', 'testResources', 'nested-suite.js');
  const selectTestFile = path.join(__dirname, '..', '..', 'testResources', '__filterSpecs.js');
  const testSelections: ReadonlyArray<Readonly<TestSelection>> = [
    { id: 0, name: 'outer test 1' },
    { id: 1, name: 'outer test 2' },
    { id: 2, name: 'outer inner test 3' }
  ];

  beforeEach(() => {
    sut = new MochaTestFramework();
  });

  afterEach(() => {
    rimraf.sync(selectTestFile);
  });

  it('should run all tests in expected order when running all tests', () => {
    const result = execMocha(nestedSuiteFile);
    expect(result.tests.map(test => test.fullTitle)).deep.eq(['outer test 1', 'outer test 2', 'outer inner test 3']);
  });

  it('should only run test 1 if filtered on index 0', () => {
    filter([0]);
    const result = execMocha(selectTestFile, nestedSuiteFile);
    expect(result.tests).lengthOf(1);
    expect(result.passes).lengthOf(1);
    expect(result.passes[0].fullTitle).eq('outer test 1');
  });

  it('should only run test 2 if filtered on index 1', () => {
    filter([1]);
    const result = execMocha(selectTestFile, nestedSuiteFile);
    expect(result.tests).lengthOf(1);
    expect(result.passes).lengthOf(1);
    expect(result.passes[0].fullTitle).eq('outer test 2');
  });

  it('should only run test 3 if filtered on index 2', () => {
    filter([2]);
    const result = execMocha(selectTestFile, nestedSuiteFile);
    expect(result.tests).lengthOf(1);
    expect(result.passes).lengthOf(1);
    expect(result.passes[0].fullTitle).eq('outer inner test 3');
  });

  it('should run tests 1 and 3 if filtered on indices 0 and 2', () => {
    filter([0, 2]);
    const result = execMocha(selectTestFile, nestedSuiteFile);
    expect(result.tests).lengthOf(2);
    expect(result.passes).lengthOf(2);
    expect(result.passes[0].fullTitle).eq('outer test 1');
    expect(result.passes[1].fullTitle).eq('outer inner test 3');
  });

  function filter(testIds: number[]) {
    const selections = testIds.map(id => testSelections[id]);
    const filterFn = `(function (window) {${sut.filter(selections)}})(global);`;
    fs.writeFileSync(selectTestFile, filterFn, 'utf8');
  }

  function execMocha(...files: string[]) {
    const execResult = execa.sync('mocha', ['--reporter', 'json', ...files]);
    return JSON.parse(execResult.stdout) as MochaTestRunResult;
  }
});
