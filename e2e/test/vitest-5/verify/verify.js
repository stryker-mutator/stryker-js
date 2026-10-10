import { expect } from 'chai';
import { readMutationTestingJsonResult } from '../../../helpers.js';

describe('Vitest 5 mutation filtering', () => {
  it('kills covered mutants in nested suites', async () => {
    const report = await readMutationTestingJsonResult();
    expect(report.testFiles?.['src/add.test.js'].tests).deep.eq([
      { id: '0', name: 'math (numbers) > add > adds two numbers' },
    ]);
    const mutants = report.files['src/add.js'].mutants;
    expect(mutants).not.empty;
    for (const mutant of mutants) {
      expect(mutant.status).eq('Killed');
      expect(mutant.killedBy).deep.eq(['0']);
    }
  });
});
