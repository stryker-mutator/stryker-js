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
        killed: 18,
        mutationScore: 66.67,
        mutationScoreBasedOnCoveredCode: 66.67,
        survived: 9,
        totalCovered: 27,
        totalDetected: 18,
        totalMutants: 27,
        totalUndetected: 9,
        totalValid: 27
      })
    });
  });

});
