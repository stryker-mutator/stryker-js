import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';
import fs from 'fs';
import { expect } from 'chai';

describe('Verify stryker has ran correctly', () => {
  it('should report correct score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });

  it("should not have any warnings, errors or fatal logs, so doesn't create 'stryker.log'", () => {
    expect(fs.existsSync('../stryker.log')).to.be.false;
  });
});
