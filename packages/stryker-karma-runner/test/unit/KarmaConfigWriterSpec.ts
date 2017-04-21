import * as sinon from 'sinon';
import { expect } from 'chai';
import * as karmaConfigReaderModule from '../../src/KarmaConfigReader';
import KarmaConfigWriter from '../../src/KarmaConfigWriter';
import { Config } from 'stryker-api/config';

describe('KarmaConfigWriter', () => {
  let sut: KarmaConfigWriter;
  let sandbox: sinon.SinonSandbox;
  let karmaConfigReader: { read: sinon.SinonStub };
  let config: Config;

  beforeEach(() => {
    sut = new KarmaConfigWriter();
    sandbox = sinon.sandbox.create();
    karmaConfigReader = { read: sandbox.stub() };
    sandbox.stub(karmaConfigReaderModule, 'default').returns(karmaConfigReader);
    config = new Config();
    config['karmaConfigFile'] = 'expectedFile';
  });

  afterEach(() => sandbox.restore());

  describe('write', () => {

    it('should create karmaConfigReader using "karmaConfigFile"', () => {
      sut.write(config);
      expect(karmaConfigReaderModule.default).to.have.been.calledWith('expectedFile');
      expect(karmaConfigReaderModule.default).to.have.been.calledWithNew;
    });

    describe('without readable config', () => {

      it('should not override the runner', () => {
        sut.write(config);
        expect(config.testRunner).to.be.undefined;
      });
    });

    describe('with readable config', () => {
      let karmaConfig: any;

      beforeEach(() => {
        karmaConfig = {};
        karmaConfigReader.read.returns(karmaConfig);
      });

      it('should not override the runner if it was not provided already, as it could result in strange behavior', () => {
        sut.write(config);
        expect(config.testRunner).to.be.undefined;
      });

      it('should not override the runner if it was provided already', () => {
        config.testRunner = 'harry';
        sut.write(config);
        expect(config.testRunner).to.be.eq('harry');
      });

      it('should import files', () => {
        karmaConfig.files = [{ pattern: 'somePattern' }];
        sut.write(config);
        expect(config.files).to.be.deep.eq([{ pattern: 'somePattern', mutated: false, included: false }]);
      });

      it('should not completely override files', () => {
        karmaConfig.files = [{ pattern: 'somePattern' }];
        config.files = ['someFile'];
        sut.write(config);
        expect(config.files).to.be.deep.eq(['someFile', { pattern: 'somePattern', mutated: false, included: false }]);
      });

      it('should exclude the excluded files', () => {
        karmaConfig.exclude = ['someFile'];
        sut.write(config);
        expect(config.files).to.be.deep.eq(['!someFile']);
      });

      it('should add karmaConfig to the options', () => {
        karmaConfig.something = 'blaat';
        sut.write(config);
        expect(config['karmaConfig']).to.be.eq(karmaConfig);
      });

      it('should not override existing karmaConfig', () => {
        config['karmaConfig'] = { value: 'overriden' };
        karmaConfig.value = 'base';
        karmaConfig.theAnswer = 42;
        sut.write(config);
        expect(config['karmaConfig'].value).to.be.eq('overriden');
        expect(config['karmaConfig'].theAnswer).to.be.eq(42);
      });
    });
  });
});
