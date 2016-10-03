import JasmineTestSelector from '../../../src/jasmine_test_selector/JasmineTestSelector';
import { TestSelectorSettings, TestSelectorFactory } from 'stryker-api/test_selector';
import { expect } from 'chai';

describe('JasmineTestSelector', () => {

  let sut: JasmineTestSelector;
  let settings: TestSelectorSettings;

  beforeEach(() => {
    settings = { options: null };
  });

  it('should register it under "jasmine" in the TestSelectorFactory', () => {
    expect(TestSelectorFactory.instance().create('jasmine', settings)).to.be.instanceof(JasmineTestSelector);
  });

  describe('when constructed', () => {

    beforeEach(() => {
      sut = new JasmineTestSelector(settings);
    });

    describe('when select() is called with an array', () => {
      let result: string;

      beforeEach(() => {
        result = sut.select([1, 2, 3, 4]);
      });

      it('should give the correct file content', () => {
        expect(result).to.be.eq(`(function(global){
    var realIt = global.it, count = 0;
    var scoped = [1,2,3,4];
    global.it = function(){
        if(scoped && scoped.indexOf(count) >= 0){
            var spec = realIt.apply(global, arguments);
        }
        count ++;
    }
})(window || global);`);
      });
    });

  });
});