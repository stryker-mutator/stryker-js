import sinon from 'sinon';

export class TestRunnerMock {
  public init: sinon.SinonStub = sinon.stub();
  public run: sinon.SinonStub = sinon.stub();
  public dispose: sinon.SinonStub = sinon.stub();
}
