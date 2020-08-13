import { promises as fs } from 'fs';
import { expect } from 'chai';
import { it } from 'mocha';

describe('Verify stryker runs with mocha < 6', () => {

  let strykerLog: string;

  before(async () => {
    strykerLog = await fs.readFile('./stryker.log', 'utf8');
  });

  it('should warn about old mocha version', async () => {
    expect(strykerLog).contains('DEPRECATED: Mocha < 6 detected. Please upgrade to at least Mocha version 6. Stryker will drop support for Mocha < 6 in V5');
  });

});
