import { ConfigOptions } from './../../src/KarmaTestRunner';
import { expect } from 'chai';
import KarmaTestRunner from '../../src/KarmaTestRunner';
import { RunnerOptions } from 'stryker-api/test_runner';
import * as karma from 'karma';
import * as sinon from 'sinon';
import * as rawCoverageReporter from '../../src/RawCoverageReporter';
import { TEST_HOOKS_FILE_NAME } from '../../src/TestHooksMiddleware';
import KarmaConfigReader, * as karmaConfigReaderModule from '../../src/KarmaConfigReader';

describe('KarmaTestRunner', () => {

  let options: RunnerOptions;
  let sut: KarmaTestRunner;
  let sandbox: sinon.SinonSandbox;
  let karmaConfigReader: sinon.SinonStubbedInstance<KarmaConfigReader>;

  beforeEach(() => {
    options = {
      port: 0,
      strykerOptions: {},
      fileNames: []
    };
    karmaConfigReader = sinon.createStubInstance(KarmaConfigReader);
    sandbox = sinon.createSandbox();
    sandbox.stub(karmaConfigReaderModule, 'default').returns(karmaConfigReader);
    sandbox.stub(karma.stopper, 'stop');
    sandbox.stub(karma, 'Server').returns({ on: sandbox.stub(), start: sandbox.stub() });
  });

  describe('when constructed', () => {

    it('should create karmaConfigReader using "karmaConfigFile"', () => {
      // options.strykerOptions.karmaConfig = karmaConfig;
      options.strykerOptions['karmaConfigFile'] = 'expectedFile';
      new KarmaTestRunner(options);
      expect(karmaConfigReaderModule.default).to.have.been.calledWith('expectedFile');
      expect(karmaConfigReaderModule.default).to.have.been.calledWithNew;
      expect(karmaConfigReader.read).called;
    });

    it('should read karma configuration from karma.conf.js file', () => {
      const karmaConfig: ConfigOptions = {
        browsers: ['foobar-browser']
      };
      karmaConfigReader.read.returns(karmaConfig);
      new KarmaTestRunner(options);
      expect(karma.Server).to.have.been.calledWith(sinon.match({
        browsers: ['foobar-browser']
      }));
    });

    it('should allow a user to override karmaConfig directly from stryker config', () => {
      karmaConfigReader.read.returns({
        browsers: ['foobar-browser']
      });
      options.strykerOptions['karmaConfig'] = { browsers: ['baz-browser'] };
      new KarmaTestRunner(options);
      expect(karma.Server).to.have.been.calledWith(sinon.match({
        browsers: ['baz-browser']
      }));
    });

    it('should force some non-overridable options', () => {
      const karmaConfig: ConfigOptions = {
        browserNoActivityTimeout: 100,
        basePath: '../',
        autoWatch: true,
        singleRun: true,
        detached: true
      };
      options.strykerOptions.karmaConfig = karmaConfig;
      new KarmaTestRunner(options);
      expect(karma.Server).to.have.been.calledWith(sinon.match({
        browserNoActivityTimeout: 1000000,
        basePath: '.',
        autoWatch: false,
        singleRun: false,
        detached: false
      }));
    });

    it('should configure TestHooksMiddleware', () => {
      const karmaConfig: ConfigOptions = {
        browserNoActivityTimeout: 100,
        basePath: '../',
        autoWatch: true,
        singleRun: true,
        detached: true,
        plugins: []
      };
      options.strykerOptions.coverageAnalysis = 'off';
      options.strykerOptions.karmaConfig = karmaConfig;
      new KarmaTestRunner(options);
      expect(karma.Server).to.have.been.calledWith(sinon.match({
        plugins: [{
          ['middleware:TestHooksMiddleware']: ['value', sinon.match.func]
        }],
        middleware: ['TestHooksMiddleware']
      }));
    });

    it('should add "karma-*" as plugin if karma config did not already have a `plugins` section', () => {
      const karmaConfig: ConfigOptions = {
        browserNoActivityTimeout: 100,
        basePath: '../',
        autoWatch: true,
        singleRun: true,
        detached: true
      };
      options.strykerOptions.coverageAnalysis = 'off';
      options.strykerOptions.karmaConfig = karmaConfig;
      new KarmaTestRunner(options);
      expect(karma.Server).to.have.been.calledWith(sinon.match({
        plugins: ['karma-*', {
          ['middleware:TestHooksMiddleware']: ['value', sinon.match.func]
        }],
        middleware: ['TestHooksMiddleware']
      }));
    });

    describe('and no testFramework is supplied', () => {
      beforeEach(() => sut = new KarmaTestRunner(options));

      it('should use "jasmine" as a default', () => {
        expect(karma.Server).to.have.been.calledWithNew;
        expect(karma.Server).to.have.been.calledWithMatch(sinon.match({ 'frameworks': ['jasmine'] }), sinon.match.func);
      });
    });

    describe(`and coverageAnalysis = 'off'`, () => {

      beforeEach(() => {
        options.strykerOptions.coverageAnalysis = 'off';
        sut = new KarmaTestRunner(options);
      });

      it('should not configure raw coverage reporter', () =>
        expect(karma.Server).to.not.have.been.calledWithMatch(sinon.match({ 'reporters': ['rawCoverage'] }), sinon.match.func));
    });

    describe(`and coverageAnalysis != 'off'`, () => {
      beforeEach(() => {
        options.strykerOptions.coverageAnalysis = 'all';
        sut = new KarmaTestRunner(options);
      });

      it('should configure raw coverage reporter', () => {
        expect(karma.Server).to.have.been.calledWithMatch(
          sinon.match({
            reporters: ['rawCoverage'],
            plugins: ['karma-*', rawCoverageReporter, { ['middleware:TestHooksMiddleware']: ['value', sinon.match.func] }],
            files: [
              {
                included: true,
                nocache: true,
                pattern: TEST_HOOKS_FILE_NAME,
                served: false,
                watched: false
              }
            ]
          }),
          sinon.match.func);
      });
    });

    describe('and testFramework is supplied', () => {

      beforeEach(() => {
        options.strykerOptions.testFramework = 'some framework';
      });

      describe('but karmaConfig overrides the frameworks', () => {

        beforeEach(() => {
          options.strykerOptions['karmaConfig'] = { frameworks: ['karma config override', 'second framework'] };
          sut = new KarmaTestRunner(options);
        });

        it('should use the testFramework specified in karma config', () => {
          expect(karma.Server).to.have.been.calledWithNew;
          expect(karma.Server).to.have.been.calledWithMatch(sinon.match({ 'frameworks': ['karma config override', 'second framework'] }), sinon.match.func);
        });

      });

      describe('without karmaConfig overriding the framework', () => {

        beforeEach(() => {
          sut = new KarmaTestRunner(options);
        });

        it('should use the testFramework', () => {
          expect(karma.Server).to.have.been.calledWithNew;
          expect(karma.Server).to.have.been.calledWithMatch(sinon.match({ 'frameworks': ['some framework'] }), sinon.match.func);
        });
      });
    });
  });

  afterEach(() => sandbox.restore());
});