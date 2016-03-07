import JasmineTestSelector from '../../../src/jasmine_test_selector/JasmineTestSelector';
import {TestSelectorSettings, TestSelectorFactory} from '../../../src/api/test_selector';
import {StrykerTempFolder} from '../../../src/api/util';

import * as sinon from 'sinon';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

let expect = chai.expect;
chai.use(chaiAsPromised);

const INTERCEPTOR_CODE = `(function(window){
    var realIt = window.it, count = 0;
    window.it = function(){
        if(window.____scopedTests && window.____scopedTests.indexOf(count) >= 0){
            var spec = realIt.apply(window, arguments);
            console.log('spec: ', spec);
        }
        count ++;
    }
})(window);`;

describe('JasmineTestSelector', () => {

  let sut: JasmineTestSelector;
  let settings: TestSelectorSettings;
  let sinonSandbox: Sinon.SinonSandbox;
  let sinonStubs: Sinon.SinonStub[];

  beforeEach(() => {
    settings = { options: null };
    sinonSandbox = sinon.sandbox.create();
  });
  
  it('should register it under "jasmine" in the TestSelectorFactory', () =>{
    expect(TestSelectorFactory.instance().create('jasmine', settings)).to.be.instanceof(JasmineTestSelector);
  });

  describe('when constructed', () => {

    beforeEach(() => {
      sinonSandbox.stub(StrykerTempFolder, 'createRandomFolder', () => '/a/temp/folder');
      sinonSandbox.stub(StrykerTempFolder, 'writeFile', () => new Promise<void>(resolve => resolve()));
      sut = new JasmineTestSelector(settings);
    });

    it('should write interceptor to temp file', () => {
      expect(StrykerTempFolder.writeFile).to.have.been.calledWith('/a/temp/folder/interceptor.js', INTERCEPTOR_CODE);
    });

    describe('and files() is called', () => {
      let resultFiles: string[];
      beforeEach(() => {
        resultFiles = sut.files();
      })

      it('should retrieve the selection.js and interceptor.js file names', () => {
        expect(resultFiles.length).to.eq(2);
        expect(resultFiles).to.contain.members(['/a/temp/folder/selection.js', '/a/temp/folder/interceptor.js']);
      });
    })

    describe('when select() is called', () => {
      let writePromise: Promise<void>;

      beforeEach(() => {
        writePromise = sut.select([1, 2, 3, 4]);
      })

      it('should write the correct selection', () => {
        return expect(writePromise).to.eventually.satisfy(() => {
            expect(StrykerTempFolder.writeFile).to.have.been.calledWith('/a/temp/folder/selection.js', 'window.____scopedTests = [1,2,3,4];');
            return true;
        });
      });
    });

  });

  afterEach(() => {
    sinonSandbox.restore();
  });
});