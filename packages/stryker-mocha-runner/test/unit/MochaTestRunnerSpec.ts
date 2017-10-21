import * as Mocha from 'mocha';
import MochaTestRunner from '../../src/MochaTestRunner';
import LibWrapper from '../../src/LibWrapper';
import { Mock, mock, fileDescriptor, logger, runnerOptions } from '../helpers/mockHelpers';
import { expect } from 'chai';
import MochaRunnerOptions from '../../src/MochaRunnerOptions';
import * as log4js from 'log4js';

describe('MochaTestRunner', () => {

  let MochaStub: sinon.SinonStub;
  let mocha: Mock<Mocha>;
  let sut: MochaTestRunner;
  let requireStub: sinon.SinonStub;
  let log: Mock<log4js.Logger>;

  beforeEach(() => {
    MochaStub = sandbox.stub(LibWrapper, 'Mocha');
    requireStub = sandbox.stub(LibWrapper, 'require');
    mocha = mock(Mocha);
    MochaStub.returns(mocha);
    log = logger();
    sandbox.stub(log4js, 'getLogger').returns(log);
  });

  it('should should add all included files on run()', async () => {
    sut = new MochaTestRunner(runnerOptions({
      files: [
        fileDescriptor({ name: 'foo.js', included: true }),
        fileDescriptor({ name: 'bar.js', included: false }),
        fileDescriptor({ name: 'foo2.js', included: true })
      ]
    }));
    await actRun();
    expect(mocha.addFile).calledTwice;
    expect(mocha.addFile).calledWith('foo.js');
    expect(mocha.addFile).calledWith('foo2.js');
  });

  it('should pass along supported options to mocha', async () => {
    // Arrange
    const mochaOptions: MochaRunnerOptions = {
      require: [],
      asyncOnly: true,
      opts: 'opts',
      timeout: 2000,
      ui: 'assert'
    };
    sut = new MochaTestRunner(runnerOptions({ strykerOptions: { mochaOptions } }));

    // Act
    await actRun();

    // Assert
    expect(mocha.asyncOnly).calledWith(true);
    expect(mocha.timeout).calledWith(2000);
    expect(mocha.ui).calledWith('assert');
  });

  it('should pass require additional require options when constructed', () => {
    const mochaOptions: MochaRunnerOptions = { require: ['ts-node', 'babel-register'] };
    new MochaTestRunner(runnerOptions({ strykerOptions: { mochaOptions } }));
    expect(requireStub).calledTwice;
    expect(requireStub).calledWith('ts-node');
    expect(requireStub).calledWith('babel-register');
  });

  function actRun() {
    const promise = sut.run();
    mocha.run.callArg(0);
    return promise;
  }

});
