import { expectMetricsResult, produceMetrics } from '../../../helpers';
import fs from 'fs';
import { expect } from 'chai';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetricsResult({
      
      metrics: produceMetrics({
        killed: 26,
        mutationScore: 74.29,
        mutationScoreBasedOnCoveredCode: 96.3,
        noCoverage: 8,
        survived: 1,
        totalCovered: 27,
        totalDetected: 26,
        totalMutants: 35,
        totalUndetected: 9,
        totalValid: 35
      })
    });
  });

  it('should delete the ".stryker-tmp" dir after the successful run', () => {
    expect(fs.existsSync('.stryker-tmp'), 'Expected the `.stryker-tmp` dir have been deleted.').false;
  });

});
