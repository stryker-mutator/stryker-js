import { expect } from 'chai';
import * as sinon from 'sinon';
import * as log4js from 'log4js';
import MochaConfigWriter from '../../src/MochaConfigWriter';


describe('MochaConfigWriter', () => {
  let sut: MochaConfigWriter;
  let log: {
    warn: sinon.SinonStub
  };
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    log = {
      warn: sandbox.stub()
    };
    sandbox.stub(log4js, 'getLogger').returns(log);
    sut = new MochaConfigWriter();
  });

  afterEach(() => sandbox.restore());

  describe('when coverageAnalysis is "perTest"', () => {
    let options: any;

    beforeEach(() => options = { coverageAnalysis: 'perTest' });

    it('should not do anything when test runner is "mocha" and test framework is "mocha"', () => {
      options.testFramework = 'mocha';
      options.testRunner = 'mocha';
      sut.write(options);
      expect(log.warn).to.not.have.been.called;
      expect(options.coverageAnalysis).to.be.eq('perTest');
    });

    it('should not do anything when test framework isn\'t mocha', () => {
      options.testFramework = 'asd';
      options.testRunner = 'mocha';
      sut.write(options);
      expect(log.warn).to.not.have.been.called;
      expect(options.coverageAnalysis).to.be.eq('perTest');
    });

    it('should not do anything when test runner is\'t mocha but test framework is "mocha"', () => {
      options.testFramework = 'mocha';
      options.testRunner = 'asd';
      sut.write(options);
      expect(log.warn).to.have.been.calledWith('Framework "mocha" with coverageAnalysis "perTest" is only supported with the "mocha" test runner (not "asd"). Downgrading to coverageAnalysis "all".');
      expect(options.coverageAnalysis).to.be.eq('all');
    });
  });


});