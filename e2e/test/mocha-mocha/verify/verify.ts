import { expectScoreResult } from '../../../helpers';
import * as fs from 'fs';
import { expect } from 'chai';

describe('Verify stryker has ran correctly', () => {

  function expectExists(fileName: string) {
    expect(fs.existsSync(fileName), `Missing ${fileName}!`).true;
  }

  it('should report correct score', async () => {
    await expectScoreResult({
      killed: 16,
      mutationScore: 64,
      noCoverage: 0,
      survived: 9
    });
  });

  it('should report html files', () => {
    expectExists('reports/mutation/html/index.html');
    expectExists('reports/mutation/html/mutation-test-elements.js');
    expectExists('reports/mutation/html/stryker-80x80.png');
    expectExists('reports/mutation/html/bind-mutation-test-report.js');
  });
});
