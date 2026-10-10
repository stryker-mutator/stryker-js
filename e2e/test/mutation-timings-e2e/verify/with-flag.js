import fs from 'fs';

import { expect } from 'chai';

describe('Verify mutation timings are written with the flag', () => {
  it('should write the sidecar report', () => {
    expect(
      fs.existsSync('reports/mutation/mutant-test-timings.json'),
      'Expected a mutation timings sidecar report.',
    ).true;
  });

  it('should contain executed test timings', () => {
    const payload = JSON.parse(
      fs.readFileSync('reports/mutation/mutant-test-timings.json', 'utf8'),
    );
    expect(payload.summary.mutantsWithTimings).to.be.greaterThan(0);
    expect(payload.summary.executedTests).to.be.greaterThan(0);
  });
});
