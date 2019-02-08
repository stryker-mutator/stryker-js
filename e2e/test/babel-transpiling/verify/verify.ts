import { expect } from 'chai';
import { fsAsPromised } from '@stryker-mutator/util';
import { expectScoreResult } from '../../../helpers';

async function expectFileExists(path: string) {
  expect(await fsAsPromised.exists(path), `File ${path} does not exist`).eq(true);
}

describe('Verify stryker has ran correctly', () => {

  it('should report expected score', async () => {
    // File       | % score | # killed | # timeout | # survived | # no cov | # error |
    // All files  |   58.54 |       24 |         0 |         17 |        0 |       1 |
    await expectScoreResult({
      killed: 24,
      mutationScore: 58.54,
      runtimeErrors: 1,
      survived: 17,
      timedOut: 0
    });
  });

  describe('html reporter', () => {

    it('should report in html files', async () => {
      await Promise.all([
        expectFileExists('reports/mutation/html/Bank.js.html'),
        expectFileExists('reports/mutation/html/Casino.js.html'),
        expectFileExists('reports/mutation/html/User.js.html'),
        expectFileExists('reports/mutation/html/index.html')
      ]);
    });

    it('should copy over the resources', async () => {
      await Promise.all([
        expectFileExists('reports/mutation/html/strykerResources/stryker/stryker.css'),
        expectFileExists('reports/mutation/html/strykerResources/stryker.js'),
        expectFileExists('reports/mutation/html/strykerResources/stryker/stryker-80x80.png'),
        expectFileExists('reports/mutation/html/strykerResources/bootstrap/css/bootstrap.min.css'),
        expectFileExists('reports/mutation/html/strykerResources/bootstrap/js/bootstrap.min.js'),
        expectFileExists('reports/mutation/html/strykerResources/highlightjs/styles/default.css')
      ]);
    });
  });
});
