import { promises as fs } from 'fs';
import chai, { expect } from 'chai';
import { it } from 'mocha';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

describe('Verify stryker has handled dry run failure correctly', () => {

  let strykerLog: string;

  before(async () => {
    strykerLog = await fs.readFile('./stryker.log', 'utf8');
  });

  it('should about failed tests in initial test run', async () => {
    expect(strykerLog).contains('There were failed tests in the initial test run');
  });

  it('should log exactly which test failed and why', async () => {
    expect(strykerLog)
      .contains('add 1 + 1 = 3... ? (this is the test that should fail)')
      .contains('expected 2 to equal 3');
  });

  it('should have exited with a non-zero exit code', async () => {
    // This line is added in package.json script if the process exited in an error.
    expect(strykerLog)
      .contains('Exited with an error exit code');
  });

  
  it('should not delete the temp dir', async () => {
    await expect(fs.stat('.stryker-tmp'), 'Expected the `.stryker-tmp` dir to not be deleted.').not.rejected;
  });
});
