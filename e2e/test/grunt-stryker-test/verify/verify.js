import fs from 'fs';

import { expect } from 'chai';

describe('grunt stryker test', () => {
  it('should not log warnings', () => {
    expect(fs.existsSync('stryker.log')).false;
  });
});
