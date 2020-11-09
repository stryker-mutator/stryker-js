import { expect } from 'chai';
import fs from 'fs';
import { describe } from 'mocha';

describe('Verify stryker has ran correctly', () => {

  function expectExists(fileName: string) {
    expect(fs.existsSync(fileName), `Missing ${fileName}!`).true;
  }

  it('should report html files', () => {
    expectExists('reports/mutation/html/index.html');
    expectExists('reports/mutation/html/mutation-test-elements.js');
    expectExists('reports/mutation/html/stryker-80x80.png');
    expectExists('reports/mutation/html/bind-mutation-test-report.js');
  });

  it('should have a clear text report', () => {
    expectExists('reports/stdout.txt');
  });

  it('should have a json report', () => {
    expectExists('reports/mutation/mutation.json');
  });

  describe('clearText report', () => {

    let stdout: string;
    beforeEach(async () => {
      stdout = await fs.promises.readFile('reports/stdout.txt', 'utf8');
    })

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
  })

  
});

const createNoCoverageMutantRegex = () => /#6\.\s*\[NoCoverage\]/;

const createSurvivedMutantRegex = () => /#20\.\s*\[Survived\]/;

const createClearTextTableSummaryRowRegex = () => /All files\s*\|\s*64\.00\s*\|\s*16\s*\|\s*0\s*\|\s*1\s*\|\s*8\s*\|\s*0\s*\|/;
