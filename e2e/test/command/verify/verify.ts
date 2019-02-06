import { fsAsPromised } from '@stryker-mutator/util';
import { expect } from 'chai';
import { expectScoreResult } from '../../../helpers';

describe('After running stryker with the command test runner', () => {
  it('should report 64% mutation score', async () => {
    expectScoreResult({
      killed: 16,
      mutationScore: 64,
      noCoverage: 0,
      timedOut: 0
    });
  });

  it('should write to a log file', async () => {
    const strykerLog = await fsAsPromised.readFile('./stryker.log', 'utf8');
    expect(strykerLog).contains('INFO InitialTestExecutor Initial test run succeeded. Ran 1 test');
    expect(strykerLog).matches(/Stryker Done in \d+/);
    expect(strykerLog).not.contains('ERROR');
  });
});
