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

});
