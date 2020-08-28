import { expect } from 'chai';

import { TestRunner2 } from '@stryker-mutator/api/test_runner';
import { factory } from '@stryker-mutator/test-helpers';

import TestRunnerDecorator from '../../../src/test-runner/TestRunnerDecorator';

describe('TestRunnerDecorator', () => {
  let sut: TestRunnerDecorator;
  let testRunner: sinon.SinonStubbedInstance<Required<TestRunner2>>;

  beforeEach(() => {
    testRunner = factory.testRunner();
    sut = new TestRunnerDecorator(() => testRunner);
  });

  function actArrangeAssert(methodName: 'init' | 'dispose' | 'dryRun' | 'mutantRun') {
    describe(methodName, () => {
      it('should pass through resolved results', () => {
        testRunner[methodName].resolves('some value');
        return expect((sut[methodName] as any)()).to.eventually.eq('some value');
      });

      it('should pass through rejected results', () => {
        testRunner[methodName].rejects(new Error('some error'));
        return expect((sut[methodName] as any)()).to.be.rejectedWith('some error');
      });
    });
  }

  actArrangeAssert('init');
  actArrangeAssert('dispose');
  actArrangeAssert('dryRun');
  actArrangeAssert('mutantRun');
});
