import { EnvironmentContext } from '@jest/environment';
import JestEnvironmentNode from 'jest-environment-node';
import sinon from 'sinon';
import { Circus, Config } from '@jest/types';
import { MutantCoverage } from '@stryker-mutator/api/core';
import { expect } from 'chai';

import * as producers from '../../helpers/producers.js';

import { mixinJestEnvironment } from '../../../src/jest-plugins/index.js';
import { state } from '../../../src/jest-plugins/cjs/messaging.js';

describe(`jest plugins ${mixinJestEnvironment.name}`, () => {
  class TestJestEnvironment extends JestEnvironmentNode {
    constructor(config: Config.ProjectConfig, _context: EnvironmentContext) {
      super(config);
      this.global.__strykerGlobalNamespace__ = '__stryker2__';
    }
    public async handleTestEvent(_event: Circus.Event, _eventState: Circus.State) {
      // Idle
    }
  }
  const Sut = mixinJestEnvironment(TestJestEnvironment);

  it('should mixin only once', () => {
    expect(mixinJestEnvironment(Sut)).eq(Sut);
  });

  describe(TestJestEnvironment.prototype.handleTestEvent.name, () => {
    it('should set the currentTestId on test_start with perTest coverage analysis', async () => {
      // Arrange
      state.coverageAnalysis = 'perTest';
      const sut = new Sut(producers.createProjectConfig(), producers.createEnvironmentContext());

      // Act
      await sut.handleTestEvent(
        producers.createCircusTestStartEvent(
          producers.createCircusTestEntry({
            name: 'should be bar',
            parent: producers.createCircusDescribeBlock({ name: 'foo', parent: producers.createCircusDescribeBlock() }),
          })
        ),
        producers.createCircusState()
      );

      // Assert
      expect(sut.global.__stryker2__?.currentTestId).eq('foo should be bar');
    });

    it('should choose correct test name when it is not situated in a describe block', async () => {
      // Arrange
      state.coverageAnalysis = 'perTest';
      const sut = new Sut(producers.createProjectConfig(), producers.createEnvironmentContext());

      // Act
      await sut.handleTestEvent(
        producers.createCircusTestStartEvent(
          producers.createCircusTestEntry({
            name: 'concat',
            parent: producers.createCircusDescribeBlock(), // direct root describe block
          })
        ),
        producers.createCircusState()
      );

      // Assert
      expect(sut.global.__stryker2__?.currentTestId).eq('concat');
    });

    it('should not set the currentTestId if coverage analysis is not perTest', async () => {
      state.coverageAnalysis = 'all';
      const sut = new Sut(producers.createProjectConfig(), producers.createEnvironmentContext());

      await sut.handleTestEvent(producers.createCircusTestStartEvent(), producers.createCircusState());

      expect(sut.global.__stryker2__?.currentTestId).undefined;
    });

    it('should call super.handleTestEvent', async () => {
      // Arrange
      const spy = sinon.spy(TestJestEnvironment.prototype, 'handleTestEvent');
      const sut = new Sut(producers.createProjectConfig(), producers.createEnvironmentContext());
      const event = producers.createCircusRunStartEvent();
      const producersState = producers.createCircusState();

      // Act
      await sut.handleTestEvent(event, producersState);

      // Assert
      expect(spy).calledWith(event, producersState);
    });
  });

  describe(TestJestEnvironment.prototype.setup.name, () => {
    it('should initialize the hitLimit and hitCount on the __stryker__ variable', async () => {
      const sut = new Sut(producers.createProjectConfig(), producers.createEnvironmentContext());
      state.hitLimit = 99;
      state.firstTestFile = true;
      await sut.setup();
      expect(sut.global.__stryker2__?.hitLimit).eq(99);
      expect(sut.global.__stryker2__?.hitCount).eq(0);
    });

    it('should only initialize the hitLimit the first time (it gets called per test file)', async () => {
      // Arrange
      const sut = new Sut(producers.createProjectConfig(), producers.createEnvironmentContext());
      state.hitLimit = 99;
      state.firstTestFile = true;
      await sut.setup();

      // Act
      state.hitLimit = 5;
      state.hitCount = 100;
      await sut.setup();

      // Assert
      expect(sut.global.__stryker2__?.hitLimit).eq(99);
      expect(sut.global.__stryker2__?.hitCount).eq(0);
    });
  });

  describe(TestJestEnvironment.prototype.teardown.name, () => {
    it('should report mutant coverage', async () => {
      // Arrange
      const handleMutantCoverageSpy = sinon.spy(state, 'handleMutantCoverage');
      const sut = new Sut(producers.createProjectConfig(), producers.createEnvironmentContext({ testPath: 'foo/bar.js' }));
      const expectedMutantCoverage: MutantCoverage = { static: { 0: 1, 6: 7 }, perTest: {} };
      sut.global.__stryker2__!.mutantCoverage = expectedMutantCoverage;

      // Act
      await sut.teardown();

      // Assert
      expect(handleMutantCoverageSpy).calledWith('foo/bar.js', expectedMutantCoverage);
    });

    it('should report the file without mutant coverage if no coverage could be collected', async () => {
      // Arrange
      const handleMutantCoverageSpy = sinon.spy(state, 'handleMutantCoverage');
      const sut = new Sut(producers.createProjectConfig(), producers.createEnvironmentContext({ testPath: 'foo/bar.js' }));

      // Act
      await sut.teardown();

      // Assert
      expect(handleMutantCoverageSpy).calledWith('foo/bar.js', undefined);
    });

    it('should call super.teardown', async () => {
      // Arrange
      const superTearDownSpy = sinon.spy(JestEnvironmentNode.prototype, 'teardown');
      const sut = new Sut(producers.createProjectConfig(), producers.createEnvironmentContext());

      // Act
      await sut.teardown();

      // Assert
      expect(superTearDownSpy).called;
    });

    it('should call setup', async () => {
      // Arrange
      const superSetupSpy = sinon.spy(JestEnvironmentNode.prototype, 'setup');
      const sut = new Sut(producers.createProjectConfig(), producers.createEnvironmentContext());

      // Act
      await sut.setup();

      // Assert
      expect(superSetupSpy).called;
    });
  });
});
