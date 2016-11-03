import * as log4js from 'log4js';
import { InputFile } from 'stryker-api/core';
import { PassThrough } from 'stream';
import { StatementMap } from 'stryker-api/test_runner';
import { TestFramework } from 'stryker-api/test_framework';
import { wrapInClosure } from '../utils/objectUtils';
import CoverageInstrumenterStream from './CoverageInstrumenterStream';

const log = log4js.getLogger('CoverageInstrumenter');

export interface StatementMapDictionary {
  [file: string]: StatementMap;
}

/**
 * Represents the CoverageInstrumenter
 * Responsible for managing the instrumentation of all files to be mutated.
 * In case of `perTest` coverageAnalysis it will hookin to the test framework to accomplish that.
 */
export default class CoverageInstrumenter {

  private coverageInstrumenterStreamPerFile: { [fileName: string]: CoverageInstrumenterStream } = Object.create(null);

  constructor(private coverageAnalysis: 'all' | 'off' | 'perTest', private testFramework: TestFramework) { }

  public instrumenterStreamForFile(file: InputFile): NodeJS.ReadWriteStream {
    if (file.mutated) {
      switch (this.coverageAnalysis) {
        case 'all':
          return this.createStreamForFile('__coverage__', file.path);
        case 'perTest':
          return this.createStreamForFile('__strykerCoverageCurrentTest__', file.path);
      }
    }
    // By default, do not instrument for code coverage
    return new PassThrough();
  }

  public hooksForTestRun(): string {
    if (this.coverageAnalysis === 'perTest') {
      log.debug(`Adding test hooks file for coverageAnalysis "perTest"`);
      return wrapInClosure(`
          var id = 0, coverageStateAtStart;
          window.__coverage__ = globalCoverage = {};

          ${this.testFramework.beforeEach(beforeEachFragmentPerTest)}
          ${this.testFramework.afterEach(afterEachFragmentPerTest)}
          ${cloneFunctionFragment};
      `);
    } else {
      return '';
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
            // it is an object literal
            result = {};
            for (var i in source) {
                result[i] = clone(source[i]);
            }
        }
        return result;
    }`;

const beforeEachFragmentPerTest = `
if (!coverageStateAtStart) {
  coverageStateAtStart = clone(window.__strykerCoverageCurrentTest__);
}`;

const afterEachFragmentPerTest = `
       globalCoverage[id] = coverageResult = {};
      id++;
           var coveragePerTest = window.__strykerCoverageCurrentTest__;
            Object.keys(coveragePerTest).forEach(function (file) {
                var coverage = coveragePerTest[file];
                coverageResult[file] = { s: coverage.s };
                coverage.s = clone(coverageStateAtStart[file].s);
            });`;