import fs from 'fs';

import { expect } from 'chai';
import { describe } from 'mocha';

import { readMutationTestingJsonResult } from '../../../helpers.js';

describe('Verify stryker has ran correctly', () => {
  /**
   * @param {string} fileName
   */
  function expectExists(fileName) {
    expect(fs.existsSync(fileName), `Missing ${fileName}!`).true;
  }

  it('should report the html file', () => {
    expectExists('reports/mutation/mutation.html');
  });

  it('should have a clear text report', () => {
    expectExists('reports/stdout.txt');
  });

  it('should have a json report', () => {
    expectExists('reports/mutation/mutation.json');
  });

  it('should report json report with expected results', async () => {
    const result = await readMutationTestingJsonResult();
    const files = Object.fromEntries(
      Object.entries(result.files)
        .map(([fileName, fileResult]) => [fileName, { ...fileResult, mutants: fileResult.mutants.sort((a, b) => (a.id < b.id ? -1 : 1)) }])
        .sort(([a], [b]) => (a < b ? -1 : 1)),
    );
    const testFiles = Object.fromEntries(
      Object.entries(result.testFiles)
        .map(([fileName, fileResult]) => [fileName, { ...fileResult, tests: fileResult.tests.sort((a, b) => (a.id < b.id ? -1 : 1)) }])
        .sort(([a], [b]) => (a < b ? -1 : 1)),
    );
    expect(files).matchSnapshot();
    expect(testFiles).matchSnapshot();
  });

  describe('clearText report', () => {
    /**
     * @type {string}
     */
    let stdout;
    beforeEach(async () => {
      stdout = await fs.promises.readFile('reports/stdout.txt', 'utf8');
    });
    it('should report all tests', () => {
      expect(stdout).matches(createTestsRegex());
    });
    it('should report NoCoverage mutants', () => {
      expect(stdout).matches(createNoCoverageMutantRegex());
    });
    it('should report Survived mutants', () => {
      expect(stdout).matches(createSurvivedMutantRegex());
    });
    it('should report average tests per mutant', () => {
      expect(stdout).contains('Ran 0.80 tests per mutant on average.');
    });
    it('should report the clearText table', () => {
      const clearTextTableRegex = createClearTextTableSummaryRowRegex();
      expect(stdout).matches(clearTextTableRegex);
    });
    it('should finish up with the clear text report', () => {
      const clearTextTableRegex = createClearTextTableSummaryRowRegex();
      const survivedMutantRegex = createSurvivedMutantRegex();
      const indexOfSurvivedMutant = survivedMutantRegex.exec(stdout).index;
      const indexOfClearTextTable = clearTextTableRegex.exec(stdout).index;
      expect(indexOfSurvivedMutant).lessThan(indexOfClearTextTable);
    });
  });
});
const createTestsRegex = () => /All tests\s*add\.spec\.js\s*\s*✓ Add should be able to add two numbers \(killed 2\)/;
const createNoCoverageMutantRegex = () => /\[NoCoverage\]/;
const createSurvivedMutantRegex = () => /\[Survived\]/;
const createClearTextTableSummaryRowRegex = () => /All files\s*\|\s*64\.00\s*\|\s*94\.12\s*\|\s*16\s*\|\s*0\s*\|\s*1\s*\|\s*8\s*\|\s*0\s*\|/;
