import { expect } from 'chai';

import TestRunnerDecorator from '../../../src/test-runner/TestRunnerDecorator';
import TestRunnerMock from '../../helpers/TestRunnerMock';

describe('TestRunnerDecorator', () => {
  let sut: TestRunnerDecorator;
  let testRunner: TestRunnerMock;

  beforeEach(() => {
    testRunner = new TestRunnerMock();
    sut = new TestRunnerDecorator(() => testRunner as any);
  });

  function actArrangeAssert(methodName: 'init' | 'dispose' | 'run') {
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
  actArrangeAssert('run');
});
