import { MutantStatus } from 'mutation-testing-report-schema';
import { expect } from 'chai';

import { expectMetricsJsonToMatchSnapshot, readMutationTestingJsonResult } from '../../../helpers.js';

describe('Verify stryker has ran correctly', () => {
  it('should report correct score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
  it('should report the correct ignore reasons', async () => {
    const report = await readMutationTestingJsonResult();
    const actualIgnoredMutants = Object.values(report.files).flatMap(({ mutants }) =>
      mutants.filter(({ status }) => status === MutantStatus.Ignored)
    );
    expect(actualIgnoredMutants).lengthOf(4);
    actualIgnoredMutants.forEach(({ statusReason }) => expect(statusReason).eq("We're not interested in console.log statements for now"));
  });
});
