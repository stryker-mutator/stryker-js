// @ts-check
const fs = require('fs');
const { expectMetricsJson, execStryker } = require('../../../helpers');
const { expect } = require('chai');

describe('esm', () => {
  beforeEach(async () => {
    await fs.promises.rm('reports', { recursive: true, force: true });
  });

  it('should be supported in the mocha runner', async () => {
    execStryker('stryker run --testRunner mocha');
    await assertStrykerRanCorrectly();
  });
});

async function assertStrykerRanCorrectly() {
  await expectMetricsJson({
    killed: 5,
    survived: 0,
    noCoverage: 0,
    timeout: 0,
  });
}
