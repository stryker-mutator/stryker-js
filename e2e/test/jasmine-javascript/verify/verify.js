import { promises as fsPromises } from 'fs';

import { expect } from 'chai';

import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

describe('After running stryker with test runner jasmine, test framework jasmine', () => {
  it('should report 85% mutation score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
  it('should write to a log file', async () => {
    const strykerLog = await fsPromises.readFile('./stryker.log', 'utf8');
    expect(strykerLog).matches(/INFO ProjectReader Found 2 of \d+ file\(s\) to be mutated/);
    expect(strykerLog).matches(/Done in \d+ second/);
    // TODO, we now have an error because of a memory leak: https://github.com/jasmine/jasmine-npm/issues/134
    // expect(strykerLog).not.contains('ERROR');
  });
});
