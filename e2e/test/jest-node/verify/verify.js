import { promises as fsPromises } from 'fs';

import { fileURLToPath } from 'url';

import { expect } from 'chai';

import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

describe('After running stryker with test runner jest on test environment "node"', () => {
  it('should report 75% mutation score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
  it('should report test files and test locations', async () => {
    const sumTestFileName = fileURLToPath(new URL('../src/sum.test.js', import.meta.url));
    const report = JSON.parse(await fsPromises.readFile(fileURLToPath(new URL('../reports/mutation/mutation.json', import.meta.url)), 'utf-8'));
    const expectedTestFiles = {
      [sumTestFileName]: {
        source: await fsPromises.readFile(sumTestFileName, 'utf-8'),
        tests: [
          {
            id: '0',
            name: 'adds 1 + 2 to equal 3',
            location: { start: { line: 3, column: 2 } }, // columns should be 1, but for some reason aren't. Best guess if jest? 🤷‍♂️
          },
          {
            id: '1',
            name: 'sub 1 - 0 to equal 1',
            location: { start: { line: 6, column: 2 } },
          },
        ],
      },
    };
    expect(report.testFiles).deep.eq(expectedTestFiles);
  });
});
