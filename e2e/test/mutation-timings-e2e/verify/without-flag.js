import fs from 'fs';

import { expect } from 'chai';

describe('Verify mutation timings are not written without the flag', () => {
  it('should not write the sidecar report', () => {
    expect(
      fs.existsSync('reports/mutation/mutant-test-timings.json'),
      'Did not expect a mutation timings sidecar report.',
    ).false;
  });
});
