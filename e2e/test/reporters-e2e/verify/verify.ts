import { expect } from 'chai';
import * as fs from 'fs';
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

  describe('clearText report', () => {

    let stdout: string;
    beforeEach(async () => {
      stdout = await fs.promises.readFile('reports/stdout.txt', 'utf8');
    })

    it('should report NoCoverage mutants', () => {
      expect(stdout).contains(noCoverageMutantSnippet);
    });

    it('should report Survived mutants', () => {
      expect(stdout).contains(survivedMutantSnippet);
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
      const indexOfSurvivedMutant = stdout.indexOf(survivedMutantSnippet);
      const match = clearTextTableRegex.exec(stdout);
      expect(indexOfSurvivedMutant).not.eq(-1);
      expect(match).is.not.null;
      expect(indexOfSurvivedMutant).lessThan(match.index);
    });
  })

});

const noCoverageMutantSnippet = `#6. [NoCoverage] BlockStatement
/home/nicojs/stryker/e2e/test/reporters-e2e/src/Add.js:13:45
-   module.exports.notCovered = function(number) {
-     return number > 10;
-   };
+   module.exports.notCovered = function(number) {};`

const survivedMutantSnippet = `#20. [Survived] ArithmeticOperator
/home/nicojs/stryker/e2e/test/reporters-e2e/src/Circle.js:2:9
-     return 2 * Math.PI * radius;
+     return 2 * Math.PI / radius;`;

const createClearTextTableSummaryRowRegex = () => /All files\s*\|\s*64\.00\s*\|\s*16\s*\|\s*0\s*\|\s*1\s*\|\s*8\s*\|\s*0\s*\|/;
