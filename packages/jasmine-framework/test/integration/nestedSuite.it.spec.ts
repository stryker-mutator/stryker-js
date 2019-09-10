import { TestSelection } from '@stryker-mutator/api/test_framework';
import { expect } from 'chai';
import * as execa from 'execa';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import JasmineTestFramework from '../../src/JasmineTestFramework';

interface JasmineTest {
  id: string;
  description: string;
  fullName: string;
  failedExpectations: any[];
  passedExpectations: any[];
  status: string;
}

describe('Selecting tests with nested suites', () => {

  let sut: JasmineTestFramework;
  let testSelections: TestSelection[];
  const jsonReporterFile = path.resolve(__dirname, '..', '..', 'testResources', 'json-reporter.js');
  const nestedSuiteFile = path.resolve(__dirname, '..', '..', 'testResources', 'nested-suite.js');
  const selectTestFile = path.join(__dirname, '..', '..', 'testResources', '__filterSpecs.js');

  beforeEach(() => {
    sut = new JasmineTestFramework();
    testSelections = [
      { id: 0, name: 'outer test 1' },
      { id: 1, name: 'outer inner test 2' },
      { id: 2, name: 'outer test 3' }
    ];
  });

  afterEach(() => {
    rimraf.sync(selectTestFile);
  });

  it('should run all tests in expected order when running all tests', () => {
    const result = execJasmine(nestedSuiteFile);
    expect(result.map(test => test.fullName)).deep.eq(['outer test 1', 'outer inner test 2', 'outer test 3']);
  });

  it('should only run test 1 if filtered on index 0', () => {
    filter([0]);
    const result = execJasmine(selectTestFile, nestedSuiteFile);
    expect(result).lengthOf(3);
    expect(result[0].status).eq('passed');
    expect(result[1].status).eq('excluded');
    expect(result[2].status).eq('excluded');
    expect(result[0].fullName).eq('outer test 1');
  });

  it('should only run test 2 if filtered on index 1', () => {
    filter([1]);
    const result = execJasmine(selectTestFile, nestedSuiteFile);
    expect(result).lengthOf(3);
    expect(result[0].status).eq('excluded');
    expect(result[1].status).eq('passed');
    expect(result[2].status).eq('excluded');
    expect(result[1].fullName).eq('outer inner test 2');
  });

  it('should only run test 3 if filtered on index 2', () => {
    filter([2]);
    const result = execJasmine(selectTestFile, nestedSuiteFile);
    expect(result).lengthOf(3);
    expect(result[0].status).eq('excluded');
    expect(result[1].status).eq('excluded');
    expect(result[2].status).eq('passed');
    expect(result[2].fullName).eq('outer test 3');
  });

  it('should only run tests 1 and 3 if filtered on indices 0 and 2', () => {
    filter([0, 2]);
    const result = execJasmine(selectTestFile, nestedSuiteFile);
    expect(result).lengthOf(3);
    expect(result[0].status).eq('passed');
    expect(result[1].status).eq('excluded');
    expect(result[2].status).eq('passed');
    expect(result[0].fullName).eq('outer test 1');
    expect(result[2].fullName).eq('outer test 3');
  });

  function filter(testIds: number[]) {
    const selections = testIds.map(id => testSelections[id]);
    const filterFn = `(function (window) {${sut.filter(selections)}})(global);`;
    fs.writeFileSync(selectTestFile, filterFn, 'utf8');
  }

  function execJasmine(...files: string[]): JasmineTest[] {
    const execResult = execa.sync('jasmine', ['--random=false', jsonReporterFile, ...files]);
    return JSON.parse(execResult.stdout);
  }
});
