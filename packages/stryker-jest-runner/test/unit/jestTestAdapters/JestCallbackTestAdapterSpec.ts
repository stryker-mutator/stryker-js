import JestCallbackTestAdapter from '../../../src/jestTestAdapters/JestCallbackTestAdapter';
import * as sinon from 'sinon';
import { expect, assert } from 'chai';

const loader: any = {
  require: () => { }
};

describe('JestCallbackTestAdapter', () => {
  let sandbox: sinon.SinonSandbox;
  let runCLIStub: sinon.SinonStub;
  let requireStub: sinon.SinonStub;

  let jestCallbackTestAdapter: JestCallbackTestAdapter;

  const projectRoot = '/path/to/project';
  const jestConfig: any = { rootDir: projectRoot };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    runCLIStub = sinon.stub();
    runCLIStub.callsArgWith(2, 'testResult');

    requireStub = sandbox.stub(loader, 'require');
    requireStub.returns({
      runCLI: runCLIStub
    });

    jestCallbackTestAdapter = new JestCallbackTestAdapter(loader.require);
  });

  afterEach(() => sandbox.restore());

  it('should require jest when the constructor is called', () => {
    assert(requireStub.calledWith('jest'), 'require not called with jest');
  });

  it('should set reporters to an empty array', async () => {
    await jestCallbackTestAdapter.run(jestConfig, projectRoot);

    expect(jestConfig.reporters).to.be.an('array').that.is.empty;
  });

  it('should call the runCLI method with the correct projectRoot', async () => {
    await jestCallbackTestAdapter.run(jestConfig, projectRoot);

    assert(runCLIStub.calledWith({
      config: JSON.stringify({ rootDir: projectRoot, reporters: [] }),
      runInBand: true,
      silent: true
    }, [projectRoot]));
  });

  it('should call the runCLI method and return the test result', async () => {
    const result = await jestCallbackTestAdapter.run(jestConfig, projectRoot);

    expect(result).to.deep.equal({
      results: 'testResult'
    });
  });
});