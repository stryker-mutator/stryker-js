import fs from 'fs';

import { expect } from 'chai';

import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

describe('Verify stryker has ran correctly', () => {
  it('should report correct score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
  it('should delete the ".stryker-tmp" dir after the successful run', () => {
    expect(fs.existsSync('.stryker-tmp'), 'Expected the `.stryker-tmp` dir have been deleted.').false;
  });
});
