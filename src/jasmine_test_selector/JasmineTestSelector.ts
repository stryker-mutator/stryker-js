import {TestSelector, TestSelectorSettings, TestSelectorFactory} from 'stryker-api/test_selector';

const INTERCEPTOR_CODE = `(function(global){
    var realIt = global.it, count = 0;
    var scoped = %IDS_PLACEHOLDER%;
    global.it = function(){
        if(scoped && scoped.indexOf(count) >= 0){
            var spec = realIt.apply(global, arguments);
        }
        count ++;
    }
})(window || global);`;


export default class JasmineTestSelector implements TestSelector {

  constructor(private settings: TestSelectorSettings) {
  }

  select(ids: number[]): string {
    return INTERCEPTOR_CODE.replace('%IDS_PLACEHOLDER%', JSON.stringify(ids));
  }
}

TestSelectorFactory.instance().register('jasmine', JasmineTestSelector);