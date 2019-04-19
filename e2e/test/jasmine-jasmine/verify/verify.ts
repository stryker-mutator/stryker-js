import { fsAsPromised } from '@stryker-mutator/util';
import { expect } from 'chai';
import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('After running stryker with test runner jasmine, test framework jasmine', () => {
  it('should report 85% mutation score', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 12,
        mutationScore: 85,
        noCoverage: 1
      })
    });
  });

  it('should write to a log file', async () => {
    const strykerLog = await fsAsPromised.readFile('./stryker.log', 'utf8');
    expect(strykerLog).matches(/INFO InputFileResolver Found 2 of 1\d file\(s\) to be mutated/);
    expect(strykerLog).matches(/Stryker Done in \d+/);
    // TODO, we now have an error because of a memory leak: https://github.com/jasmine/jasmine-npm/issues/134
    // expect(strykerLog).not.contains('ERROR');
  });
});
