export default class TestRunnerMock {
  public dispose: sinon.SinonStub = sandbox.stub();
  public init: sinon.SinonStub = sandbox.stub();
  public run: sinon.SinonStub = sandbox.stub();
}
