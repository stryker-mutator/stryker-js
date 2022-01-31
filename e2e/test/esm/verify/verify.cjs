// @ts-check
const fs = require('fs');
const { expectMetricsJsonToMatchSnapshot, execStryker } = require('../../../helpers');

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
