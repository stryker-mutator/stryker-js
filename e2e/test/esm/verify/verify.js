import fs from 'fs';

import { expectMetricsJsonToMatchSnapshot, execStryker } from '../../../helpers.js';

describe('esm', () => {
  beforeEach(async () => {
    await fs.promises.rm('reports', { recursive: true, force: true });
  });

  it('should be supported in the mocha runner', async () => {
    execStryker('stryker run --testRunner mocha');
    await assertStrykerRanCorrectly();
  });

  it('should be supported in the jasmine runner', async () => {
    execStryker('stryker run --testRunner jasmine');
    await assertStrykerRanCorrectly();
  });
});

async function assertStrykerRanCorrectly() {
  await expectMetricsJsonToMatchSnapshot();
}
