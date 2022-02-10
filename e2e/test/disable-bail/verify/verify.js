import fs from 'fs';
import { readMutationTestingJsonResult, execStryker } from '../../../helpers.js';
import { expect } from 'chai';
describe('disableBail', () => {
    beforeEach(async () => {
        await fs.promises.rm('reports', { recursive: true, force: true });
    });
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
    it('should be supported in the mocha runner', async () => {
        execStryker('stryker run --testRunner mocha');
        await assertBailWasDisabled();
    });
    it('should be supported in the cucumber runner', async () => {
        execStryker('stryker run --testRunner cucumber');
        await assertBailWasDisabled(['Feature: Add -- Scenario: Add 40 and 2', 'Feature: Add -- Scenario: Add 41 and 1']);
    });
});
/** @returns {Promise<void>} */
async function assertBailWasDisabled([killedByName1, killedByName2] = ['add should result in 42 for 40 and 2', 'add should result in 42 for 41 and 1']) {
    const result = await readMutationTestingJsonResult();
    const theMutant = result.systemUnderTestMetrics.childResults[0].file.mutants.find(mutant => mutant.replacement === 'a - b');
    expect(theMutant.killedByTests).lengthOf(2);
    expect(theMutant.killedByTests[0].name).eq(killedByName1);
    expect(theMutant.killedByTests[1].name).eq(killedByName2);
}




