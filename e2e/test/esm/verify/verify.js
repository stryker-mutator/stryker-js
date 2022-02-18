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

  it('should be supported in the jest runner', async () => {
    execStryker('stryker run --testRunner jest --testRunnerNodeArgs "--experimental-vm-modules"');
    await assertStrykerRanCorrectly();
  });

  it('should be supported in the karma runner', async () => {
    execStryker('stryker run --testRunner karma');
    await assertStrykerRanCorrectly();
  });
});

async function assertStrykerRanCorrectly() {
  await expectMetricsJsonToMatchSnapshot();
}
