import fs from 'fs';

import { readMutationTestingJsonResult, execStryker} from '../../../helpers';
import { expect } from 'chai';

describe('disableBail', () => {

  beforeEach(async () => {
    await fs.promises.rm('reports', { recursive: true, force: true })
  })

  it('should be supported in the jest runner', async () => {
    execStryker('stryker run --testRunner jest');
    await assertBailWasDisabled();
  });

  it('should be supported in the karma runner', async () => {
    execStryker('stryker run --testRunner karma');
    await assertBailWasDisabled();
  });

  it('should be supported in the jasmine runner', async () => {
    execStryker('stryker run --testRunner jasmine');
    await assertBailWasDisabled();
  });
});

async function assertBailWasDisabled() {
  const result = await readMutationTestingJsonResult();
  const theMutant = result.systemUnderTestMetrics.childResults[0].file.mutants.find(mutant => mutant.replacement === 'a - b');
  expect(theMutant.killedByTests).lengthOf(2);
  expect(theMutant.killedByTests[0].name).eq('add should result in 42 for 40 and 2');
  expect(theMutant.killedByTests[1].name).eq('add should result in 42 for 41 and 1');
}

