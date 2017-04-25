import * as sinon from 'sinon';

export default class TestRunnerMock {
  init = sinon.stub();
  run = sinon.stub();
  dispose = sinon.stub();
}