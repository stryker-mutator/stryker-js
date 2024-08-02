import { promises as fsPromises } from 'fs';

import { use, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);
describe('Verify stryker has handled dry run failure correctly', () => {
  /**
   * @type {string}
   */
  let strykerLog;
  before(async () => {
    strykerLog = await fsPromises.readFile('./stryker.log', 'utf8');
  });
  it('should about failed tests in initial test run', () => {
    expect(strykerLog).contains('There were failed tests in the initial test run');
  });
  it('should log exactly which test failed and why', () => {
    expect(strykerLog).contains('add 1 + 1 = 3... ? (this is the test that should fail)').contains('expected 2 to equal 3');
  });
  it('should have exited with a non-zero exit code', () => {
    // This line is added in package.json script if the process exited in an error.
    expect(strykerLog).contains('Exited with an error exit code');
  });
  it('should not delete the temp dir', async () => {
    await expect(fsPromises.stat('.stryker-tmp'), 'Expected the `.stryker-tmp` dir to not be deleted.').not.rejected;
  });
});
