import JestPromiseTestAdapter from '../../../src/jestTestAdapters/JestPromiseTestAdapter';
import * as sinon from 'sinon';
import { expect, assert } from 'chai';

const loader: any = {
  require: () => { }
};

describe('JestPromiseTestAdapter', () => {
  let sandbox: sinon.SinonSandbox;
  let runCLIStub: sinon.SinonStub;
  let requireStub: sinon.SinonStub;

  let jestPromiseTestAdapter: JestPromiseTestAdapter;

  const projectRoot = '/path/to/project';
  const jestConfig: any = { rootDir: projectRoot };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    runCLIStub = sinon.stub();
    runCLIStub.callsFake((config: Object, projectRootArray: Array<string>) => Promise.resolve({
      result: 'testResult',
      config: config
    }));

    requireStub = sandbox.stub(loader, 'require');
    requireStub.returns({
      runCLI: runCLIStub
    });

    jestPromiseTestAdapter = new JestPromiseTestAdapter(loader.require);
  });

  afterEach(() => sandbox.restore());

  it('should require jest when the constructor is called', () => {
    assert(requireStub.calledWith('jest'), 'require not called with jest');
  });

  it('should set reporters to an empty array', async () => {
    await jestPromiseTestAdapter.run(jestConfig, projectRoot);

    expect(jestConfig.reporters).to.be.an('array').that.is.empty;
  });

  it('should call the runCLI method with the correct projectRoot', async () => {
    await jestPromiseTestAdapter.run(jestConfig, projectRoot);

    assert(runCLIStub.calledWith({
      config: JSON.stringify({ rootDir: projectRoot, reporters: [] }),
      runInBand: true,
      silent: true
    }, [projectRoot]));
  });

  it('should call the runCLI method and return the test result', async () => {
    const result = await jestPromiseTestAdapter.run(jestConfig, projectRoot);

    expect(result).to.deep.equal({
      result: 'testResult',
      config: {
        config: JSON.stringify({ rootDir: projectRoot, reporters: [] }),
        runInBand: true,
        silent: true
      }
    });
  });
});