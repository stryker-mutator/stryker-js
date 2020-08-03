import { promises as fs } from 'fs';

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
    const strykerLog = await fs.readFile('./stryker.log', 'utf8');
    expect(strykerLog).contains('INFO DryRunExecutor Initial test run succeeded. Ran 1 test');
    expect(strykerLog).matches(/MutationTestExecutor Done in \d+/);
    expect(strykerLog).not.contains('ERROR');
    expect(strykerLog).not.contains('WARN');
  });
});
