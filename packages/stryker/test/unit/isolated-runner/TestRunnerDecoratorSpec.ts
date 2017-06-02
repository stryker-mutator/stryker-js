import { expect } from 'chai';
import TestRunnerDecorator from '../../../src/isolated-runner/TestRunnerDecorator';
import TestRunnerMock from '../../helpers/TestRunnerMock';

describe('TestRunnerDecorator', () => {
  let sut: TestRunnerDecorator;
  let testRunner: TestRunnerMock;

  beforeEach(() => {
    testRunner = new TestRunnerMock();
    sut = new TestRunnerDecorator(() => <any>testRunner);
  });

  function actArrangeAssert(methodName: 'init' | 'dispose' | 'run') {
    describe(methodName, () => {
      it('should pass through resolved results', () => {
        testRunner[methodName].resolves('some value');
        return expect((<any>sut[methodName])()).to.eventually.eq('some value');
      });

      it('should pass through rejected results', () => {
        testRunner[methodName].rejects(new Error('some error'));
        return expect((<any>sut[methodName])()).to.be.rejectedWith('some error');
      });
    });
  }

  actArrangeAssert('init');
  actArrangeAssert('dispose');
  actArrangeAssert('run');
});