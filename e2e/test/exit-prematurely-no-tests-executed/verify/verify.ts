import fs from 'fs';
import { expect } from 'chai';

describe('Verify stryker has ran correctly', () => {

  const strykerLog = fs.readFileSync('./stryker.log', 'utf8');

  it('exit prematurely', () => {
    expect(strykerLog).contains('No tests were executed. Stryker will exit prematurely.');
  });

  it('should exit with a non-zero exit code', () => {
    expect(strykerLog).contains('Exit with non-zero exit code');
  });

  it('should not report the mutant run', () => {
    expect(fs.existsSync('reports'), 'Expected no reports to be written to disk, but they did').false;
  });
});
