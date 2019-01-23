import * as sinon from 'sinon';

export default class TestRunnerMock {
  public init: sinon.SinonStub = sinon.stub();
  public run: sinon.SinonStub = sinon.stub();
  public dispose: sinon.SinonStub = sinon.stub();
}
