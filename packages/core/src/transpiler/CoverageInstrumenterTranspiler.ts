import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { Transpiler } from '@stryker-mutator/api/transpile';
import { StrykerError } from '@stryker-mutator/util';
import { FileCoverageData, Range } from 'istanbul-lib-coverage';
import { createInstrumenter, Instrumenter } from 'istanbul-lib-instrument';

import { COVERAGE_CURRENT_TEST_VARIABLE_NAME } from './coverageHooks';

export interface CoverageMaps {
  statementMap: { [key: string]: Range };
  fnMap: { [key: string]: Range };
}

export interface CoverageMapsByFile {
  [file: string]: CoverageMaps;
}

export default class CoverageInstrumenterTranspiler implements Transpiler {
  private readonly instrumenter: Instrumenter;
  public fileCoverageMaps: CoverageMapsByFile = Object.create(null);

  constructor(private readonly settings: StrykerOptions, private readonly filesToInstrument: readonly string[]) {
    this.instrumenter = createInstrumenter({ coverageVariable: this.coverageVariable, preserveComments: true });
  }

  public async transpile(files: readonly File[]): Promise<readonly File[]> {
    return files.map(file => this.instrumentFileIfNeeded(file));
  }

  /**
   * Coverage variable *must* have the name '__coverage__'. Only that variable
   * is reported back to the TestRunner process when using one of the karma
   * test framework adapters (karma-jasmine, karma-mocha, ...).
   *
   * However, when coverageAnalysis is 'perTest' we don't choose that variable name right away,
   * because we need that variable to hold all coverage results per test. Instead, we use __strykerCoverageCurrentTest__
   * and after each test copy over the value of that current test to the global coverage object __coverage__
   */
  private get coverageVariable() {
    switch (this.settings.coverageAnalysis) {
      case 'perTest':
        return COVERAGE_CURRENT_TEST_VARIABLE_NAME;
      default:
        return '__coverage__';
    }
  }

  private patchRanges(fileCoverage: FileCoverageData) {
    function patchRange(range: Range) {
      // Lines from istanbul are one-based, lines in Stryker are 0-based
      range.end.line--;
      range.start.line--;
    }

    Object.keys(fileCoverage.statementMap).forEach(key => patchRange(fileCoverage.statementMap[key]));
    Object.keys(fileCoverage.branchMap).forEach(key => {
      patchRange(fileCoverage.branchMap[key].loc);
      fileCoverage.branchMap[key].locations.forEach(patchRange);
      fileCoverage.branchMap[key].line--;
    });
    Object.keys(fileCoverage.fnMap).forEach(key => {
      patchRange(fileCoverage.fnMap[key].loc);
      patchRange(fileCoverage.fnMap[key].decl);
      fileCoverage.fnMap[key].line--;
    });

    return fileCoverage;
  }

  private instrumentFileIfNeeded(file: File) {
    if (this.settings.coverageAnalysis !== 'off' && this.filesToInstrument.some(fileName => fileName === file.name)) {
      return this.instrumentFile(file);
    } else {
      return file;
    }
  }

  private instrumentFile(sourceFile: File): File {
    try {
      const content = this.instrumenter.instrumentSync(sourceFile.textContent, sourceFile.name);
      const fileCoverage = this.patchRanges(this.instrumenter.lastFileCoverage());
      this.fileCoverageMaps[sourceFile.name] = this.retrieveCoverageMaps(fileCoverage);
      return new File(sourceFile.name, Buffer.from(content));
    } catch (error) {
      throw new StrykerError(`Could not instrument "${sourceFile.name}" for code coverage`, error);
    }
  }

  private retrieveCoverageMaps(input: FileCoverageData): CoverageMaps {
    const output: CoverageMaps = {
      fnMap: {},
      statementMap: input.statementMap
    };
    Object.keys(input.fnMap).forEach(key => (output.fnMap[key] = input.fnMap[key].loc));
    return output;
  }
}
