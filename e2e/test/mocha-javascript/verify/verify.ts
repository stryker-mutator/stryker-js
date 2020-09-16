import { expect } from 'chai';
import * as fs from 'fs';
import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  function expectExists(fileName: string) {
    expect(fs.existsSync(fileName), `Missing ${fileName}!`).true;
  }

  it('should report correct score', async () => {
    await expectMetricsResult({
      
      metrics: produceMetrics({
        killed: 26,
        mutationScore: 74.29,
        mutationScoreBasedOnCoveredCode: 74.29,
        survived: 9,
        totalCovered: 35,
        totalDetected: 26,
        totalMutants: 35,
        totalUndetected: 9,
        totalValid: 35
      })
    });
  });

});
