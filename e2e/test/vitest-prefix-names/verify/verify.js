import { expect } from 'chai';

import { readMutationTestingJsonResult } from '../../../helpers.js';

describe('Verify stryker has ran correctly', () => {
  it('should only run the covering test of a surviving mutant, not tests whose name starts with its name', async () => {
    const report = await readMutationTestingJsonResult();
    const mutants = Object.values(report.files).flatMap((file) => file.mutants);
    const survivor = mutants.find(
      (mutant) =>
        mutant.mutatorName === 'ArithmeticOperator' &&
        mutant.replacement === 'a - b',
    );
    expect(survivor?.status).eq('Survived');
    // `calc add` covers the mutant, `calc add negative` doesn't
    expect(survivor?.testsCompleted).eq(1);
  });
});
