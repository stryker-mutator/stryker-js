import fs from 'fs';

import { expect } from 'chai';

describe('grunt stryker test', () => {
  it('should not log warnings', () => {
    const logFileContents = fs.readFileSync('stryker.log', 'utf-8');
    expect(logFileContents).empty;
  });
});
