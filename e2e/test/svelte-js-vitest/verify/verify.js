// @ts-check
import { expect } from 'chai';

import { expectMetricsJsonToMatchSnapshot, readMutationTestingJsonResult } from '../../../helpers.js';

/** @param {number} n */
function pad(n) {
  return n.toString().padStart(2, '0');
}

/**
 * @param {import('mutation-testing-report-schema').MutantResult} mutant
 * @returns {string}
 */
function mutantKey(mutant) {
  return `${pad(mutant.location.start.line)}:${pad(mutant.location.start.column)}-${pad(mutant.location.end.line)}:${pad(
    mutant.location.end.column,
  )}-${mutant.mutatorName}-${mutant.replacement}`;
}

describe('Verify stryker has ran correctly', () => {
  it('should report correct score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });

  it('should report mutants at the correct locations', async () => {
    const actual = await readMutationTestingJsonResult();
    const app = actual.files['src/App.svelte'];
    const locatedMutants = [...app.mutants]
      .sort((a, b) => mutantKey(a).localeCompare(mutantKey(b)))
      .map(({ mutatorName, location: { start, end }, replacement }) => ({
        mutatorName,
        location: `${start.line}:${start.column}-${end.line}:${end.column}`,
        replacement,
      }));
    expect(locatedMutants).matchSnapshot();
  });
});
