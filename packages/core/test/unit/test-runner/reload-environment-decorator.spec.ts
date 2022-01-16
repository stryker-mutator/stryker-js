import { TestRunner } from '@stryker-mutator/api/test-runner';
import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { ReloadEnvironmentDecorator } from '../../../src/test-runner/reload-environment-decorator';

describe(ReloadEnvironmentDecorator.name, () => {
  let testRunner: sinon.SinonStubbedInstance<Required<TestRunner>>;
  let testRunnerFactory: sinon.SinonStub<[], Required<TestRunner>>;
  let sut: ReloadEnvironmentDecorator;

  beforeEach(() => {
    testRunner = factory.testRunner();
    testRunnerFactory = sinon.stub();
    testRunnerFactory.returns(testRunner);
    sut = new ReloadEnvironmentDecorator(testRunnerFactory);
  });

  describe('mutantRun', () => {
    it('should forward when test filter is filled', async () => {
      const options = factory.mutantRunOptions({ testFilter: ['1'] });
      await sut.mutantRun(options);
      expect(testRunner.mutantRun).calledWithExactly(options);
      expect(testRunnerFactory).calledOnce;
    });

    it('should not recreate the test runner for a static mutant when reload capability is true', async () => {
      testRunner.capabilities.resolves({ reloadEnvironment: true });
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: ['1'] })); // Mark test env state as loaded
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: undefined }));
      expect(testRunnerFactory).calledOnce;
    });

    it('should not set "reloadEnvironment" for a static mutant when reload capability is true and test environment is pristine', async () => {
      testRunner.capabilities.resolves({ reloadEnvironment: true });
      const options = factory.mutantRunOptions({ testFilter: undefined, reloadEnvironment: false });
      await sut.mutantRun(options);
      expect(options.reloadEnvironment).false;
    });

    it('should set "reloadEnvironment" to true on the options for a static mutant when reload capability is true', async () => {
      testRunner.capabilities.resolves({ reloadEnvironment: true });
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: ['1'] })); // Mark test env state as loaded
      const options = factory.mutantRunOptions({ testFilter: undefined, reloadEnvironment: false });
      await sut.mutantRun(options);
      expect(options.reloadEnvironment).true;
    });

    it('should not recreate the test runner for a static mutant when reload capability is false if not ran before', async () => {
      testRunner.capabilities.resolves({ reloadEnvironment: false });
      const options = factory.mutantRunOptions({ testFilter: undefined });
      await sut.mutantRun(options);
      expect(testRunner.mutantRun).calledWithExactly(options);
      expect(testRunnerFactory).calledOnce;
    });

    it('should recreate the test runner for a static mutant when reload capability is false if ran before', async () => {
      testRunner.capabilities.resolves({ reloadEnvironment: false });
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: ['1'] }));
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: undefined }));
      expect(testRunnerFactory).calledTwice;
    });

    it('should recreate the test runner for a static mutant a dry run was ran before', async () => {
      testRunner.capabilities.resolves({ reloadEnvironment: false });
      await sut.dryRun(factory.dryRunOptions());
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: undefined }));
      expect(testRunnerFactory).calledTwice;
    });

    it('should recreate the test runner after running a static mutant', async () => {
      testRunner.capabilities.resolves({ reloadEnvironment: false });
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: undefined }));
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: ['1'] }));
      expect(testRunnerFactory).calledTwice;
    });

    it('should not recreate the test runner after running a non-static mutant', async () => {
      testRunner.capabilities.resolves({ reloadEnvironment: false });
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: undefined }));
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: ['1'] }));
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: ['2'] }));
      expect(testRunnerFactory).calledTwice;
    });

    it('should cache capabilities', async () => {
      testRunner.capabilities.resolves({ reloadEnvironment: true });
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: undefined }));
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: undefined }));
      expect(testRunner.capabilities).calledOnce;
    });
  });
});
