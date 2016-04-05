import {TestSelector, TestSelectorSettings, TestSelectorFactory} from '../api/test_selector';
import {StrykerTempFolder} from '../api/util';
import {InputFile} from '../api/core';
import * as fs from 'fs';
import {Promise} from 'es6-promise';


const INTERCEPTOR_CODE = `(function(window){
    var realIt = window.it, count = 0;
    window.it = function(){
        if(window.____scopedTests && window.____scopedTests.indexOf(count) >= 0){
            var spec = realIt.apply(window, arguments);
        }
        count ++;
    }
})(window);`;


export default class JasmineTestSelector implements TestSelector {

  private tempFolder: string;
  private interceptorFilePath: string;
  private selectionFilePath: string;
  private interceptorWritePromise: Promise<void>;

  constructor(private settings: TestSelectorSettings) {
    this.tempFolder = StrykerTempFolder.createRandomFolder('jasmine-test-selector');
    this.interceptorFilePath = `${this.tempFolder}/interceptor.js`;
    this.selectionFilePath = `${this.tempFolder}/selection.js`;
    this.interceptorWritePromise = StrykerTempFolder.writeFile(this.interceptorFilePath, INTERCEPTOR_CODE);
  }

  files(): string[] {
    return [this.interceptorFilePath, this.selectionFilePath];
  }

  select(ids: number[]): Promise<void> {
    return this.interceptorWritePromise.then(() => StrykerTempFolder.writeFile(this.selectionFilePath, this.selectionCode(ids)));
  }

  private selectionCode(ids: number[]) {
    return `window.____scopedTests = ${JSON.stringify(ids)};`;
  }
}

TestSelectorFactory.instance().register('jasmine', JasmineTestSelector);