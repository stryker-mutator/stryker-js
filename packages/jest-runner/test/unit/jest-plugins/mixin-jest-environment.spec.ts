import vm from 'vm';

import { JestEnvironmentConfig, EnvironmentContext } from '@jest/environment';
import { MutantCoverage } from '@stryker-mutator/api/core';
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
    public async handleTestEvent(
      _event: Circus.Event,
      _eventState: Circus.State,
    ) {
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
      const sut = new Sut(
        producers.createEnvironmentConfig(),
        producers.createEnvironmentContext(),
      );

      // Assert
      expect(sut.global.__stryker2__).eq(state.instrumenterContext);
    });

    it('should default to __stryker__ when there is no global stryker variable name configured', () => {
      // Arrange
      state.clear();

      // Act
      const sut = new (mixinJestEnvironment(
        class extends JestEnvironmentNode {
          public async handleTestEvent(
            _event: Circus.Event,
            _eventState: Circus.State,
          ) {
            // Idle
          }
        },
      ))(
        producers.createEnvironmentConfig(),
        producers.createEnvironmentContext(),
      );

      // Assert
      expect(sut.global.__stryker__).eq(state.instrumenterContext);
    });

    it('should add the testPath to the test files with stryker environment', () => {
      // Arrange
      state.clear();

      // Act
      new Sut(
        producers.createEnvironmentConfig(),
        producers.createEnvironmentContext({ testPath: 'foo/bar.js' }),
      );

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
        const sut = new Sut(
          producers.createEnvironmentConfig(),
          producers.createEnvironmentContext(),
        );

        // Act
        await sut.handleTestEvent(
          producers.createCircusTestStartEvent(
            producers.createCircusTestEntry({
              name: 'should be bar',
              parent: producers.createCircusDescribeBlock({
                name: 'foo',
                parent: producers.createCircusDescribeBlock(),
              }),
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
        const sut = new Sut(
          producers.createEnvironmentConfig(),
          producers.createEnvironmentContext(),
        );

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
        const sut = new Sut(
          producers.createEnvironmentConfig(),
          producers.createEnvironmentContext(),
        );

        await sut.handleTestEvent(
          producers.createCircusTestStartEvent(),
          producers.createCircusState(),
        );

        expect(sut.global.__stryker2__?.currentTestId).undefined;
      });
    });

    describe('on test_done', () => {
      it('should clear the currentTestId', async () => {
        // Arrange
        state.coverageAnalysis = 'perTest';
        const sut = new Sut(
          producers.createEnvironmentConfig(),
          producers.createEnvironmentContext(),
        );
        sut.global.__stryker2__!.currentTestId = 'foo should bar';

        // Act
        await sut.handleTestEvent(
          producers.createCircusTestDoneEvent(),
          producers.createCircusState(),
        );

        // Assert
        expect(sut.global.__stryker2__!.currentTestId).undefined;
      });
    });

    describe('on other events', () => {
      it('should call super.handleTestEvent', async () => {
        // Arrange
        const spy = sinon.spy(TestJestEnvironment.prototype, 'handleTestEvent');
        const sut = new Sut(
          producers.createEnvironmentConfig(),
          producers.createEnvironmentContext(),
        );
        const event = producers.createCircusRunStartEvent();
        const producersState = producers.createCircusState();

        // Act
        await sut.handleTestEvent(event, producersState);

        // Assert
        expect(spy).calledWith(event, producersState);
      });
    });
  });

  describe('teardown', () => {
    function createSut() {
      return new Sut(
        producers.createEnvironmentConfig(),
        producers.createEnvironmentContext(),
      );
    }

    beforeEach(() => {
      state.clear();
      state.coverageAnalysis = 'perTest';
    });

    it('should replace coverage objects created by the test file with copies, so the test file can be garbage collected', async () => {
      // Arrange
      const sut = createSut();
      vm.runInContext(
        "__stryker2__.mutantCoverage = { static: { 1: 1 }, perTest: { 'foo should bar': { 2: 3 } } };",
        sut.getVmContext()!,
      );
      expect(state.instrumenterContext.mutantCoverage).not.instanceOf(Object);

      // Act
      await sut.teardown();

      // Assert
      const coverage = state.instrumenterContext.mutantCoverage!;
      expect(coverage).deep.eq({
        static: { 1: 1 },
        perTest: { 'foo should bar': { 2: 3 } },
      });
      for (const object of [
        coverage,
        coverage.static,
        coverage.perTest,
        coverage.perTest['foo should bar'],
      ]) {
        expect(object).instanceOf(Object);
      }
    });

    it('should keep the static and per-test coverage objects the test runner already owns', async () => {
      // Arrange
      const earlierCoverage: MutantCoverage = {
        static: { 1: 1 },
        perTest: { 'foo should bar': { 2: 3 } },
      };
      state.instrumenterContext.mutantCoverage = earlierCoverage;
      const sut = createSut();
      vm.runInContext(
        "__stryker2__.mutantCoverage.perTest['baz should qux'] = { 4: 1 };",
        sut.getVmContext()!,
      );

      // Act
      await sut.teardown();

      // Assert
      const coverage = state.instrumenterContext.mutantCoverage;
      expect(coverage.static).eq(earlierCoverage.static);
      expect(coverage.perTest).eq(earlierCoverage.perTest);
      expect(coverage.perTest['foo should bar']).eq(
        earlierCoverage.perTest['foo should bar'],
      );
      expect(coverage.perTest['baz should qux']).deep.eq({ 4: 1 });
      expect(coverage.perTest['baz should qux']).instanceOf(Object);
    });

    it('should copy coverage added by a teardown that is a class property', async () => {
      // Arrange
      class EnvironmentWithTeardownProperty extends TestJestEnvironment {
        public teardown = () => {
          vm.runInContext(
            '__stryker2__.mutantCoverage = { static: { 1: 1 }, perTest: {} };',
            this.getVmContext()!,
          );
          return Promise.resolve();
        };
      }
      const sut = new (mixinJestEnvironment(EnvironmentWithTeardownProperty))(
        producers.createEnvironmentConfig(),
        producers.createEnvironmentContext(),
      );

      // Act
      await sut.teardown();

      // Assert
      expect(state.instrumenterContext.mutantCoverage).instanceOf(Object);
      expect(state.instrumenterContext.mutantCoverage).deep.eq({
        static: { 1: 1 },
        perTest: {},
      });
    });

    it('should copy coverage added after super.teardown() in a subclass of a Stryker environment', async () => {
      // Arrange
      class SubclassOfStrykerEnvironment extends Sut {
        public async teardown() {
          const coverageFromTestFile = vm.runInContext(
            '({ static: { 1: 1 }, perTest: {} })',
            this.getVmContext()!,
          ) as MutantCoverage;
          await super.teardown();
          state.instrumenterContext.mutantCoverage = coverageFromTestFile;
        }
      }
      const sut = new (mixinJestEnvironment(SubclassOfStrykerEnvironment))(
        producers.createEnvironmentConfig(),
        producers.createEnvironmentContext(),
      );

      // Act
      await sut.teardown();

      // Assert
      expect(state.instrumenterContext.mutantCoverage).instanceOf(Object);
      expect(state.instrumenterContext.mutantCoverage).deep.eq({
        static: { 1: 1 },
        perTest: {},
      });
    });

    it('should leave the mutant coverage undefined when no test reached a mutant', async () => {
      // Arrange
      const sut = createSut();

      // Act
      await sut.teardown();

      // Assert
      expect(state.instrumenterContext.mutantCoverage).undefined;
    });
  });
});
