import { wrapInClosure } from '../utils/objectUtils';
import { TestFramework } from '@stryker-mutator/api/test_framework';

export const COVERAGE_CURRENT_TEST_VARIABLE_NAME = '__strykerCoverageCurrentTest__';

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

export function coveragePerTestHooks(testFramework: TestFramework): string {
  return wrapInClosure(`
        var id = 0, globalCoverage, coverageResult;
        window.__coverage__ = globalCoverage = { deviations: {} };
        ${testFramework.beforeEach(beforeEachFragmentPerTest)}
        ${testFramework.afterEach(afterEachFragmentPerTest)}
        ${cloneFunctionFragment};
    `);
}
