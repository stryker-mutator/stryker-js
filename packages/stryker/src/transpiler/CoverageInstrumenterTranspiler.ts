import { Transpiler, TranspileResult, FileLocation, TranspilerOptions } from 'stryker-api/transpile';
import { File, FileKind, TextFile } from 'stryker-api/core';
import { StatementMap } from 'stryker-api/test_runner';
import { Instrumenter } from 'istanbul';
import { errorToString, wrapInClosure } from '../utils/objectUtils';
import { TestFramework } from 'stryker-api/test_framework';
import { Logger, getLogger } from 'log4js';

const coverageObjRegex = /\{.*"path".*"fnMap".*"statementMap".*"branchMap".*\}/g;
const COVERAGE_CURRENT_TEST_VARIABLE_NAME = '__strykerCoverageCurrentTest__';

export interface StatementMapDictionary {
  [file: string]: StatementMap;
}

export default class CoverageInstrumenterTranspiler implements Transpiler {

  private instrumenter: Instrumenter;
  public statementMapsPerFile: StatementMapDictionary = Object.create(null);
  private log: Logger;

  constructor(private settings: TranspilerOptions, private testFramework: TestFramework | null) {
    this.instrumenter = new Instrumenter({ coverageVariable: this.coverageVariable });
    this.log = getLogger(CoverageInstrumenterTranspiler.name);
  }

  transpile(files: File[]): TranspileResult {
    try {
      const result: TranspileResult = {
        outputFiles: files.map(file => this.instrumentFileIfNeeded(file)),
        error: null
      };
      return this.addCollectCoverageFileIfNeeded(result);
    } catch (error) {
      return this.errorResult(errorToString(error));
    }
  }

  getMappedLocation(sourceFileLocation: FileLocation): FileLocation {
    return sourceFileLocation;
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

  private retrieveStatementMap(instrumentedCode: string): StatementMap {
    coverageObjRegex.lastIndex = 0;
    const coverageObjectMatch = coverageObjRegex.exec(instrumentedCode) + '';
    const statementMap = JSON.parse(coverageObjectMatch).statementMap as StatementMap;
    Object.keys(statementMap).forEach(key => {
      // Lines from istanbul are one-based, lines in Stryker are 0-based
      statementMap[key].end.line--;
      statementMap[key].start.line--;
    });
    return statementMap;
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
      this.statementMapsPerFile[sourceFile.name] = this.retrieveStatementMap(content);
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

  private addCollectCoverageFileIfNeeded(result: TranspileResult): TranspileResult {
    if (Object.keys(this.statementMapsPerFile).length && this.settings.config.coverageAnalysis === 'perTest') {
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
    var fileResult = { s: {} };
    var touchedFile = false;
    for(var i in coverage.s){
      if(coverage.s[i] !== baseline.s[i]){
        fileResult.s[i] = coverage.s[i];
        touchedFile = true;
      }
    }
    if(touchedFile){
      coverageResult[file] = fileResult;
    }
});
}`;