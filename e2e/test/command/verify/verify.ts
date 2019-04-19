import { fsAsPromised } from '@stryker-mutator/util';
import { expect } from 'chai';
import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('After running stryker with the command test runner', () => {
  it('should report 64% mutation score', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 16,
        mutationScore: 64,
        mutationScoreBasedOnCoveredCode: 64,
        survived: 9,
        totalCovered: 25,
        totalDetected: 16,
        totalMutants: 25,
        totalUndetected: 9,
        totalValid: 25
      })
    });
  });

  it('should write to a log file', async () => {
    const strykerLog = await fsAsPromised.readFile('./stryker.log', 'utf8');
    expect(strykerLog).contains('INFO InitialTestExecutor Initial test run succeeded. Ran 1 test');
    expect(strykerLog).matches(/Stryker Done in \d+/);
    expect(strykerLog).not.contains('ERROR');
  });
});
