import { expect } from 'chai';
import fs from 'fs';

describe('grunt stryker test', () => {
  it('should not log warnings', () => {
    const logFileContents = fs.readFileSync('stryker.log', 'utf-8');
    expect(logFileContents).empty;
  });
});
