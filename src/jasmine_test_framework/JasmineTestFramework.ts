import { TestFramework, TestFrameworkSettings, TestFrameworkFactory } from 'stryker-api/test_framework';

export default class JasmineTestFramework implements TestFramework {

  constructor(private settings: TestFrameworkSettings) {
  }

  beforeEach(codeFragment: string) {
    return `
    jasmine.getEnv().addReporter({
      specStarted: function () {
        ${codeFragment}
      }
    });`;
  }

  afterEach(codeFragment: string) {
    return `
    jasmine.getEnv().addReporter({
      specDone: function () {
        ${codeFragment}
      }
    });`;
  }

  filter(testIds: number[]) {
    return `    
    var currentTestId = 0;
    jasmine.getEnv().specFilter = function (spec) {
        var filterOut = false;
        if(${JSON.stringify(testIds)}.indexOf(currentTestId) >= 0){
          filterOut = true;
        }
        currentTestId++;
        return filterOut;
    }`;
  }
}

TestFrameworkFactory.instance().register('jasmine', JasmineTestFramework);