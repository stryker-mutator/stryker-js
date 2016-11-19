import { expect } from 'chai';
import KarmaTestRunner from '../../src/KarmaTestRunner';
import { RunnerOptions } from 'stryker-api/test_runner';
import * as karma from 'karma';
import * as sinon from 'sinon';
import * as rawCoverageReporter from '../../src/RawCoverageReporter';

describe('KarmaTestRunner', () => {

  let options: RunnerOptions;
  let sut: KarmaTestRunner;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    options = {
      files: [],
      port: 0,
      strykerOptions: {}
    };
    sandbox = sinon.sandbox.create();
    sandbox.stub(karma, 'Server').returns({ on: sandbox.stub(), start: sandbox.stub() });
  });

  describe('when no testFramework is supplied', () => {
    beforeEach(() => sut = new KarmaTestRunner(options));

    it('should use "jasmine" as a default', () => {
      expect(karma.Server).to.have.been.calledWithNew;
      expect(karma.Server).to.have.been.calledWithMatch(sinon.match({ 'frameworks': ['jasmine'] }), sinon.match.func);
    });
  });

  describe(`when coverageAnalysis = 'off'`, () => {

    beforeEach(() => {
      options.strykerOptions.coverageAnalysis = 'off';
      sut = new KarmaTestRunner(options);
    });

    it('should not configure raw coverage reporter', () =>
      expect(karma.Server).to.not.have.been.calledWithMatch(sinon.match({ 'reporters': ['rawCoverage'] }), sinon.match.func));
  });

  describe(`when coverageAnalysis != 'off'`, () => {
    beforeEach(() => {
      options.strykerOptions.coverageAnalysis = 'all';
      sut = new KarmaTestRunner(options);
    });

    it('should configure raw coverage reporter', () =>
      expect(karma.Server).to.have.been.calledWithMatch(sinon.match({ reporters: ['rawCoverage'], plugins: ['karma-*', rawCoverageReporter] }), sinon.match.func));
  });

  describe('when testFramework is supplied', () => {

    beforeEach(() => {
      options.strykerOptions.testFramework = 'some framework';
    });

    describe('and karmaConfig overrides the frameworks', () => {

      beforeEach(() => {
        options.strykerOptions['karmaConfig'] = { frameworks: ['karma config override', 'second framework'] };
        sut = new KarmaTestRunner(options);
      });

      it('should use the testFramework specified in karma config', () => {
        expect(karma.Server).to.have.been.calledWithNew;
        expect(karma.Server).to.have.been.calledWithMatch(sinon.match({ 'frameworks': ['karma config override', 'second framework'] }), sinon.match.func);
      });

    });

    describe('and no karmaConfig overrides the framework', () => {

      beforeEach(() => {
        sut = new KarmaTestRunner(options);
      });

      it('should use the testFramework', () => {
        expect(karma.Server).to.have.been.calledWithNew;
        expect(karma.Server).to.have.been.calledWithMatch(sinon.match({ 'frameworks': ['some framework'] }), sinon.match.func);
      });

    });
  });

  afterEach(() => sandbox.restore());
});