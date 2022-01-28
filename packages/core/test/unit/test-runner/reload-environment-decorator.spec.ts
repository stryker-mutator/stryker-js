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
    it('should forward when reloadEnvironment is false', async () => {
      const options = factory.mutantRunOptions({ reloadEnvironment: false });
      await sut.mutantRun({ ...options });
      expect(testRunner.mutantRun).calledWithExactly(options);
      expect(testRunnerFactory).calledOnce;
    });

    it('should cache capabilities', async () => {
      testRunner.capabilities.resolves({ reloadEnvironment: true });
      await sut.mutantRun(factory.mutantRunOptions({ reloadEnvironment: true }));
      await sut.mutantRun(factory.mutantRunOptions({ reloadEnvironment: true }));
      expect(testRunner.capabilities).calledOnce;
    });

    describe('for a test runner that is capable of reloading', () => {
      beforeEach(() => {
        testRunner.capabilities.resolves({ reloadEnvironment: true });
      });
      it('should not recreate the test runner when reloadEnvironment is true', async () => {
        // Arrange
        await sut.mutantRun(factory.mutantRunOptions({ reloadEnvironment: false })); // Mark test env state as loaded

        // Act
        await sut.mutantRun(factory.mutantRunOptions({ reloadEnvironment: true }));

        // Assert
        expect(testRunnerFactory).calledOnce;
      });

      it('should not override "reloadEnvironment" when test environment is pristine', async () => {
        const options = factory.mutantRunOptions({ reloadEnvironment: false });
        await sut.mutantRun(options);
        expect(options.reloadEnvironment).false;
      });

      it('should override "reloadEnvironment" when the previous run loaded a static mutant', async () => {
        await sut.mutantRun(factory.mutantRunOptions({ reloadEnvironment: true })); // Mark test env state as loaded a static mutant
        const options = factory.mutantRunOptions({ reloadEnvironment: false });
        await sut.mutantRun(options);
        expect(options.reloadEnvironment).true;
      });
    });

    describe('for a test runner that is not capable of reloading', () => {
      beforeEach(() => {
        testRunner.capabilities.resolves({ reloadEnvironment: false });
      });
      it('should not recreate the test runner when reloadEnvironment is true when the test env is pristine (first run)', async () => {
        const options = factory.mutantRunOptions({ reloadEnvironment: true });
        await sut.mutantRun(options);
        expect(testRunner.mutantRun).calledWithExactly(options);
        expect(testRunnerFactory).calledOnce;
      });
      it('should override reloadEnvironment with false when reloadEnvironment is true but the test env is pristine (first run)', async () => {
        const options = factory.mutantRunOptions({ reloadEnvironment: true });
        await sut.mutantRun(options);
        expect(options.reloadEnvironment).false;
      });
      it('should recreate the test runner when reloadEnvironment is true and test environment was loaded', async () => {
        // Arrange
        await sut.mutantRun(factory.mutantRunOptions({ reloadEnvironment: false }));

        // Act
        await sut.mutantRun(factory.mutantRunOptions({ reloadEnvironment: true }));

        // Assert
        expect(testRunnerFactory).calledTwice;
      });

      it('should recreate the test runner when reloadEnvironment is true and a dry run was ran before', async () => {
        await sut.dryRun(factory.dryRunOptions());
        await sut.mutantRun(factory.mutantRunOptions({ reloadEnvironment: true }));
        expect(testRunnerFactory).calledTwice;
      });

      it('should recreate the test runner when a static mutant was loaded', async () => {
        await sut.mutantRun(factory.mutantRunOptions({ reloadEnvironment: true })); // Load static mutant
        await sut.mutantRun(factory.mutantRunOptions({ reloadEnvironment: false }));
        expect(testRunnerFactory).calledTwice;
      });

      it('should not recreate the test runner when reloadEnvironment is false and the test environment was already loaded', async () => {
        await sut.mutantRun(factory.mutantRunOptions({ reloadEnvironment: true }));
        await sut.mutantRun(factory.mutantRunOptions({ reloadEnvironment: false }));
        await sut.mutantRun(factory.mutantRunOptions({ reloadEnvironment: false }));
        expect(testRunnerFactory).calledTwice;
      });
    });
  });
});
