import { promises as fsPromises } from 'fs';

import { expect } from 'chai';

import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

describe('After running stryker with the command test runner', () => {
  it('should report 64% mutation score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
  it('should write to a log file', async () => {
    const strykerLog = await fsPromises.readFile('./stryker.log', 'utf8');
    expect(strykerLog).contains('INFO DryRunExecutor Initial test run succeeded. Ran 1 test');
    expect(strykerLog).matches(/MutationTestExecutor Done in \d+/);
    expect(strykerLog).not.contains('ERROR');
    expect(strykerLog).not.contains('WARN');
  });
});
