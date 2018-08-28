export default class TestRunnerMock {
  public init: sinon.SinonStub = sandbox.stub();
  public run: sinon.SinonStub = sandbox.stub();
  public dispose: sinon.SinonStub = sandbox.stub();
}
