// @ts-check
import { expect } from 'chai';

import { expectMetricsJsonToMatchSnapshot, readMutationTestingJsonResult } from '../../../helpers.js';

describe('Verify stryker has ran correctly', () => {
  it('should report correct score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });

  it('should report mutants at the correct locations', async () => {
    const actual = await readMutationTestingJsonResult();
    const app = actual.files['src/App.svelte'];
    const locatedMutants = [...app.mutants]
      .sort((a, b) => (a.location.start.line - b.location.start.line) * 1000 + (a.location.start.column - a.location.start.column))
      .map(({ mutatorName, location: { start, end }, replacement }) => ({
        mutatorName,
        location: `${start.line}:${start.column}-${end.line}:${end.column}`,
        replacement,
      }));
    expect(locatedMutants).matchSnapshot();
  });
});
