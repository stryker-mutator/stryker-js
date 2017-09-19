import * as log4js from 'log4js';
import { FileDescriptor } from 'stryker-api/core';
import { PassThrough } from 'stream';
import { StatementMap } from 'stryker-api/test_runner';
import { TestFramework } from 'stryker-api/test_framework';
import { wrapInClosure } from '../utils/objectUtils';
import CoverageInstrumenterStream from './CoverageInstrumenterStream';

const log = log4js.getLogger('CoverageInstrumenter');

export interface StatementMapDictionary {
  [file: string]: StatementMap;
}

const COVERAGE_CURRENT_TEST_VARIABLE_NAME = '__strykerCoverageCurrentTest__';

/**
 * Represents the CoverageInstrumenter
 * Responsible for managing the instrumentation of all files to be mutated.
 * In case of `perTest` coverageAnalysis it will hookin to the test framework to accomplish that.
 */
export default class CoverageInstrumenter {

  private coverageInstrumenterStreamPerFile: { [fileName: string]: CoverageInstrumenterStream } = Object.create(null);

  constructor(private coverageAnalysis: 'all' | 'off' | 'perTest', private testFramework: TestFramework | null) { }

  public instrumenterStreamForFile(file: FileDescriptor): NodeJS.ReadWriteStream {
    if (file.mutated) {
      /*
      Coverage variable *must* have the name '__coverage__'. Only that variable 
      is reported back to the TestRunner process when using one of the karma 
      test framework adapters (karma-jasmine, karma-mocha, ...).

      However, when coverageAnalysis is 'perTest' we don't choose that variable name right away,
      because we need that variable to hold all coverage results per test. Instead, we use __strykerCoverageCurrentTest__
      and after each test copy over the value of that current test to the global coverage object __coverage__
       */
      switch (this.coverageAnalysis) {
        case 'all':
          return this.createStreamForFile('__coverage__', file.name);
        case 'perTest':
          return this.createStreamForFile(COVERAGE_CURRENT_TEST_VARIABLE_NAME, file.name);
      }
    }
    // By default, do not instrument for code coverage
    return new PassThrough();
  }

  public hooksForTestRun(): string | null {
    if (this.testFramework && this.coverageAnalysis === 'perTest') {
      log.debug(`Adding test hooks file for coverageAnalysis "perTest"`);
      return wrapInClosure(`
          var id = 0;
          window.__coverage__ = globalCoverage = { deviations: {} };
          ${this.testFramework.beforeEach(beforeEachFragmentPerTest)}
          ${this.testFramework.afterEach(afterEachFragmentPerTest)}
          ${cloneFunctionFragment};
      `);
    } else {
      return null;
    }
  }

  public retrieveStatementMapsPerFile(): StatementMapDictionary {
    const statementMapsPerFile: StatementMapDictionary = Object.create(null);
    Object.keys(this.coverageInstrumenterStreamPerFile)
      .forEach(key => statementMapsPerFile[key] = this.coverageInstrumenterStreamPerFile[key].statementMap);
    return statementMapsPerFile;
  }

  private createStreamForFile(coverageVariable: string, fileName: string) {
    const stream = new CoverageInstrumenterStream(coverageVariable, fileName);
    this.coverageInstrumenterStreamPerFile[fileName] = stream;
    return stream;
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