export default class TestRunnerMock {
  init: sinon.SinonStub = sandbox.stub();
  run: sinon.SinonStub = sandbox.stub();
  dispose: sinon.SinonStub = sandbox.stub();
}