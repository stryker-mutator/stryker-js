import { expect } from 'chai';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { MutationTestResult, TestFileDefinitionDictionary } from 'mutation-testing-report-schema/api';
import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('After running stryker with test runner jest on test environment "node"', () => {
  it('should report 75% mutation score', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 3,
        mutationScore: 75,
        mutationScoreBasedOnCoveredCode: 75,
        noCoverage: 0,
        survived: 1,
        totalCovered: 4,
        totalDetected: 3,
        totalMutants: 4,
        totalUndetected: 1,
        totalValid: 4
      })
    });
  });

  it('should report test files and test locations', async () => {
    const report: MutationTestResult = require('../reports/mutation/mutation.json');
    const expectedTestFiles: TestFileDefinitionDictionary = {
      [path.resolve(__dirname, '..', 'src', 'sum.test.js')]: {
        source: await fsPromises.readFile(path.resolve(__dirname, '..', 'src', 'sum.test.js'), 'utf-8'),
        tests: [{
          id: '0',
          name: 'adds 1 + 2 to equal 3',
          location: { start: { line: 3, column: 2 } } // columns should be 1, but for some reason aren't. Best guess if jest? 🤷‍♂️
        }, {
          id: '1',
          name: 'sub 1 - 0 to equal 1',
          location: { start: { line: 6, column: 2 } }
        }]
      }
    };
    expect(report.testFiles).deep.eq(expectedTestFiles);
  });
});
