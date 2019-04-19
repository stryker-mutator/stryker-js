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
        killed: 16,
        mutationScore: 64,
        survived: 9
      })
    });
  });

  it('should report html files', () => {
    expectExists('reports/mutation/html/index.html');
    expectExists('reports/mutation/html/mutation-test-elements.js');
    expectExists('reports/mutation/html/stryker-80x80.png');
    expectExists('reports/mutation/html/bind-mutation-test-report.js');
  });
});
