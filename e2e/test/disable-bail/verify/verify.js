import fs from 'fs';

import { expect } from 'chai';

import { readMutationTestingJsonResultAsMetricsResult, execStryker } from '../../../helpers.js';

describe('disableBail', () => {
  beforeEach(async () => {
    await fs.promises.rm('reports', { recursive: true, force: true });
  });
  it('should be supported in the jest runner', async () => {
    await arrangeActAssertBailWasDisabled('jest');
  });
  it('should be supported in the karma runner', async () => {
    await arrangeActAssertBailWasDisabled('karma');
  });
  it('should be supported in the jasmine runner', async () => {
    await arrangeActAssertBailWasDisabled('jasmine');
  });
  it('should be supported in the mocha runner', async () => {
    await arrangeActAssertBailWasDisabled('mocha');
  });
  it('should be supported in the vitest runner', async () => {
    await arrangeActAssertBailWasDisabled('vitest');
  });
  it('should be supported in the cucumber runner', async () => {
    await arrangeActAssertBailWasDisabled('cucumber', ['Feature: Add -- Scenario: Add 40 and 2', 'Feature: Add -- Scenario: Add 41 and 1']);
  });
  it('should be supported in the tap runner', async () => {
    await arrangeActAssertBailWasDisabled('tap', ['test/math1.tap.js', 'test/math2.tap.js']);
  });
});

/**
 * @param {string} testRunner
 * @returns {Promise<void>}
 */
async function arrangeActAssertBailWasDisabled(
  testRunner,
  expectedKilledBy = ['add should result in 42 for 40 and 2', 'add should result in 42 for 41 and 1'],
) {
  const { exitCode } = execStryker(`stryker run --testRunner ${testRunner}`);
  expect(exitCode).eq(0);

  const result = await readMutationTestingJsonResultAsMetricsResult();
  const theMutant = result.systemUnderTestMetrics.childResults[0].file.mutants.find((mutant) => mutant.replacement === 'a - b');
  expect(theMutant.killedByTests).lengthOf(2);

  const actualKilledBy = theMutant.killedByTests.map(({ name }) => name).sort();

  expectedKilledBy.sort();

  expect(actualKilledBy).deep.eq(expectedKilledBy);
}
