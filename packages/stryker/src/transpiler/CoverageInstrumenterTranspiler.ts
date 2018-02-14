import { Transpiler, TranspileResult, TranspilerOptions } from 'stryker-api/transpile';
import { File, FileKind, TextFile } from 'stryker-api/core';
import { createInstrumenter, Instrumenter } from 'istanbul-lib-instrument';
import { errorToString, wrapInClosure } from '../utils/objectUtils';
import { TestFramework } from 'stryker-api/test_framework';
import { Logger, getLogger } from 'log4js';
import { FileCoverageData, Range } from 'istanbul-lib-coverage';

const COVERAGE_CURRENT_TEST_VARIABLE_NAME = '__strykerCoverageCurrentTest__';

export interface CoverageMaps {
  statementMap: { [key: string]: Range };
  fnMap: { [key: string]: Range };
}

export interface CoverageMapsByFile {
  [file: string]: CoverageMaps;
}

export default class CoverageInstrumenterTranspiler implements Transpiler {

  private instrumenter: Instrumenter;
  public fileCoverageMaps: CoverageMapsByFile = Object.create(null);
  private log: Logger;

  constructor(private settings: TranspilerOptions, private testFramework: TestFramework | null) {
    this.instrumenter = createInstrumenter({ coverageVariable: this.coverageVariable, preserveComments: true });
    this.log = getLogger(CoverageInstrumenterTranspiler.name);
  }

  public transpile(files: File[]): Promise<TranspileResult> {
    try {
      const result: TranspileResult = {
        outputFiles: files.map(file => this.instrumentFileIfNeeded(file)),
        error: null
      };
      return Promise.resolve(this.addCollectCoverageFileIfNeeded(result));
    } catch (error) {
      return Promise.resolve(this.errorResult(errorToString(error)));
    }
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
    switch (this.settings.config.coverageAnalysis) {
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
    if (this.settings.config.coverageAnalysis !== 'off' && file.kind === FileKind.Text && file.mutated) {
      return this.instrumentFile(file);
    } else {
      return file;
    }
  }

  private instrumentFile(sourceFile: TextFile): TextFile {
    try {
      const content = this.instrumenter.instrumentSync(sourceFile.content, sourceFile.name);
      const fileCoverage = this.patchRanges(this.instrumenter.lastFileCoverage());
      this.fileCoverageMaps[sourceFile.name] = this.retrieveCoverageMaps(fileCoverage);
      return {
        mutated: sourceFile.mutated,
        included: sourceFile.included,
        name: sourceFile.name,
        transpiled: sourceFile.transpiled,
        kind: FileKind.Text,
        content
      };
    } catch (error) {
      throw new Error(`Could not instrument "${sourceFile.name}" for code coverage. ${errorToString(error)}`);
    }
  }

  private retrieveCoverageMaps(input: FileCoverageData): CoverageMaps {
    const output: CoverageMaps = {
      statementMap: input.statementMap,
      fnMap: {}
    };
    Object.keys(input.fnMap).forEach(key => output.fnMap[key] = input.fnMap[key].loc);
    return output;
  }

  private addCollectCoverageFileIfNeeded(result: TranspileResult): TranspileResult {
    if (Object.keys(this.fileCoverageMaps).length && this.settings.config.coverageAnalysis === 'perTest') {
      if (this.testFramework) {
        // Add piece of javascript to collect coverage per test results
        const content = this.coveragePerTestFileContent(this.testFramework);
        const fileName = '____collectCoveragePerTest____.js';
        result.outputFiles.unshift({
          kind: FileKind.Text,
          name: fileName,
          included: true,
          transpiled: false,
          mutated: false,
          content
        });
        this.log.debug(`Adding test hooks file for coverageAnalysis "perTest": ${fileName}`);
      } else {
        return this.errorResult('Cannot measure coverage results per test, there is no testFramework and thus no way of executing code right before and after each test.');
      }
    }
    return result;
  }

  private coveragePerTestFileContent(testFramework: TestFramework): string {
    return wrapInClosure(`
          var id = 0, globalCoverage, coverageResult;
          window.__coverage__ = globalCoverage = { deviations: {} };
          ${testFramework.beforeEach(beforeEachFragmentPerTest)}
          ${testFramework.afterEach(afterEachFragmentPerTest)}
          ${cloneFunctionFragment};
      `);
  }

  private errorResult(error: string) {
    return {
      error,
      outputFiles: []
    };
  }
}

const cloneFunctionFragment = `    
function clone(source) {
    var result = source;
    if (Array.isArray(source)) {
        result = [];
        source.forEach(function (child, index) {
            result[index] = clone(child);
        });
    } else if (typeof source == "object") {
        result = {};
        for (var i in source) {
            result[i] = clone(source[i]);
        }
    }
    return result;
}`;

const beforeEachFragmentPerTest = `
if (!globalCoverage.baseline && window.${COVERAGE_CURRENT_TEST_VARIABLE_NAME}) {
globalCoverage.baseline = clone(window.${COVERAGE_CURRENT_TEST_VARIABLE_NAME});
}`;

const afterEachFragmentPerTest = `
globalCoverage.deviations[id] = coverageResult = {};
id++;
var coveragePerFile = window.${COVERAGE_CURRENT_TEST_VARIABLE_NAME};
if(coveragePerFile) {
Object.keys(coveragePerFile).forEach(function (file) {
    var coverage = coveragePerFile[file];
    var baseline = globalCoverage.baseline[file];
    var fileResult = { s: {}, f: {} };
    var touchedFile = false;
    for(var i in coverage.s){
      if(coverage.s[i] !== baseline.s[i]){
        fileResult.s[i] = coverage.s[i];
        touchedFile = true;
      }
    }
    for(var i in coverage.f){
      if(coverage.f[i] !== baseline.f[i]){
        fileResult.f[i] = coverage.f[i];
        touchedFile = true;
      }
    }
    if(touchedFile){
      coverageResult[file] = fileResult;
    }
});
}`;