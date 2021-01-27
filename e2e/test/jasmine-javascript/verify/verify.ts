import { promises as fsPromises } from 'fs';

import { expect } from 'chai';
import { expectMetrics } from '../../../helpers';

describe('After running stryker with test runner jasmine, test framework jasmine', () => {
  it('should report 85% mutation score', async () => {
    await expectMetrics({
      killed: 12,
      mutationScore: 85.71,
      mutationScoreBasedOnCoveredCode: 100,
      noCoverage: 2,
      survived: 0,
      totalCovered: 12,
      totalDetected: 12,
      totalMutants: 14,
      totalUndetected: 2,
      totalValid: 14
    });
  });

  it('should write to a log file', async () => {
    const strykerLog = await fsPromises.readFile('./stryker.log', 'utf8');
    expect(strykerLog).matches(/INFO InputFileResolver Found 2 of 9 file\(s\) to be mutated/);
    expect(strykerLog).matches(/Done in \d+ second/);
    // TODO, we now have an error because of a memory leak: https://github.com/jasmine/jasmine-npm/issues/134
    // expect(strykerLog).not.contains('ERROR');
  });
});
