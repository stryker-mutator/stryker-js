import { EnvironmentContext } from '@jest/environment';
import JestEnvironmentNode from 'jest-environment-node';
import sinon from 'sinon';
import { Circus, Config } from '@jest/types';
import { expect } from 'chai';

import * as producers from '../../helpers/producers';

import { mixinJestEnvironment } from '../../../src/jest-plugins';
import { state } from '../../../src/messaging';
import * as constants from '../../../src/jest-plugins/constants';

describe(`jest plugins ${mixinJestEnvironment.name}`, () => {
  class TestJestEnvironment extends JestEnvironmentNode {
    constructor(config: Config.ProjectConfig, _context: EnvironmentContext) {
      super(config);
      this.global.__strykerGlobalNamespace__ = constants.namespaceAlternative;
    }
    public async handleTestEvent(_event: Circus.Event, _eventState: Circus.State) {
      // Idle
    }
  }
  const Sut = mixinJestEnvironment(TestJestEnvironment);

  it('should mixin only once', () => {
    expect(mixinJestEnvironment(Sut)).eq(Sut);
  });

  describe('constructor', () => {
    it('should copy over the instrumenterContext on the __stryker__ variable', async () => {
      // Arrange
      state.clear();

      // Act
      const sut = new Sut(producers.createProjectConfig(), producers.createEnvironmentContext());

      // Assert
      expect(sut.global.__stryker2__).eq(state.instrumenterContext);
    });

    it('should add the testPath to the test files with stryker environment', async () => {
      // Arrange
      state.clear();

      // Act
      new Sut(producers.createProjectConfig(), producers.createEnvironmentContext({ testPath: 'foo/bar.js' }));

      // Act
      expect(state.testFilesWithStrykerEnvironment).lengthOf(1);
      expect(state.testFilesWithStrykerEnvironment).contains('foo/bar.js');
    });
  });

  describe(TestJestEnvironment.prototype.handleTestEvent.name, () => {
    describe('on test_start', () => {
      it('should set the currentTestId with perTest coverage analysis', async () => {
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
    });

    describe('on test_done', () => {
      it('should clear the currentTestId', async () => {
        // Arrange
        state.coverageAnalysis = 'perTest';
        const sut = new Sut(producers.createProjectConfig(), producers.createEnvironmentContext());
        sut.global.__stryker2__!.currentTestId = 'foo should bar';

        // Act
        await sut.handleTestEvent(producers.createCircusTestDoneEvent(), producers.createCircusState());

        // Assert
        expect(sut.global.__stryker2__!.currentTestId).undefined;
      });
    });

    describe('on other events', () => {
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
  });
});
