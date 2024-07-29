import { JestEnvironmentConfig, EnvironmentContext } from '@jest/environment';

import sinon from 'sinon';
import { Circus } from '@jest/types';
import { expect } from 'chai';

import * as producers from '../../helpers/producers.js';
import { mixinJestEnvironment } from '../../../src/jest-plugins/index.js';
import { state } from '../../../src/jest-plugins/messaging.cjs';

import { JestEnvironmentNode } from './jest-environment-node.cjs';

describe(`jest plugins ${mixinJestEnvironment.name}`, () => {
  class TestJestEnvironment extends JestEnvironmentNode {
    constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
      super(config, context);
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

  describe('constructor', () => {
    it('should copy over the instrumenterContext on the __stryker__ variable', () => {
      // Arrange
      state.clear();

      // Act
      const sut = new Sut(producers.createEnvironmentConfig(), producers.createEnvironmentContext());

      // Assert
      expect(sut.global.__stryker2__).eq(state.instrumenterContext);
    });

    it('should default to __stryker__ when there is no global stryker variable name configured', () => {
      // Arrange
      state.clear();

      // Act
      const sut = new (mixinJestEnvironment(
        class extends JestEnvironmentNode {
          public async handleTestEvent(_event: Circus.Event, _eventState: Circus.State) {
            // Idle
          }
        },
      ))(producers.createEnvironmentConfig(), producers.createEnvironmentContext());

      // Assert
      expect(sut.global.__stryker__).eq(state.instrumenterContext);
    });

    it('should add the testPath to the test files with stryker environment', () => {
      // Arrange
      state.clear();

      // Act
      new Sut(producers.createEnvironmentConfig(), producers.createEnvironmentContext({ testPath: 'foo/bar.js' }));

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
        const sut = new Sut(producers.createEnvironmentConfig(), producers.createEnvironmentContext());

        // Act
        await sut.handleTestEvent(
          producers.createCircusTestStartEvent(
            producers.createCircusTestEntry({
              name: 'should be bar',
              parent: producers.createCircusDescribeBlock({ name: 'foo', parent: producers.createCircusDescribeBlock() }),
            }),
          ),
          producers.createCircusState(),
        );

        // Assert
        expect(sut.global.__stryker2__?.currentTestId).eq('foo should be bar');
      });

      it('should choose correct test name when it is not situated in a describe block', async () => {
        // Arrange
        state.coverageAnalysis = 'perTest';
        const sut = new Sut(producers.createEnvironmentConfig(), producers.createEnvironmentContext());

        // Act
        await sut.handleTestEvent(
          producers.createCircusTestStartEvent(
            producers.createCircusTestEntry({
              name: 'concat',
              parent: producers.createCircusDescribeBlock(), // direct root describe block
            }),
          ),
          producers.createCircusState(),
        );

        // Assert
        expect(sut.global.__stryker2__?.currentTestId).eq('concat');
      });

      it('should not set the currentTestId if coverage analysis is not perTest', async () => {
        state.coverageAnalysis = 'all';
        const sut = new Sut(producers.createEnvironmentConfig(), producers.createEnvironmentContext());

        await sut.handleTestEvent(producers.createCircusTestStartEvent(), producers.createCircusState());

        expect(sut.global.__stryker2__?.currentTestId).undefined;
      });
    });

    describe('on test_done', () => {
      it('should clear the currentTestId', async () => {
        // Arrange
        state.coverageAnalysis = 'perTest';
        const sut = new Sut(producers.createEnvironmentConfig(), producers.createEnvironmentContext());
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
        const sut = new Sut(producers.createEnvironmentConfig(), producers.createEnvironmentContext());
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
