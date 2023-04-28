import childProcess from 'child_process';

import { EventEmitter } from 'events';

import { PassThrough, Readable } from 'stream';

import fs from 'fs/promises';

import sinon from 'sinon';

import { TestRunnerCapabilities } from '@stryker-mutator/api/test-runner';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import * as tap from 'tap-parser';

import { createTapTestRunnerFactory, TapTestRunner } from '../../src/tap-test-runner.js';
import { TapParser } from '../../src/tap-parser-factory.js';

class ChildProcessMock extends EventEmitter {
  public stdout: Readable = new PassThrough();
}

describe(TapTestRunner.name, () => {
  let sut: TapTestRunner;
  let childProcessMock: ChildProcessMock;
  let forkStub: sinon.SinonStub;
  let tapParser: tap.Parser;

  beforeEach(async () => {
    childProcessMock = new ChildProcessMock();
    sinon.stub(TapParser, 'Parser').callsFake((options, onComplete) => {
      tapParser = new tap.Parser(options, onComplete);
      return tapParser;
    });

    // Stub out the fs module because the file will not be created
    sinon.stub(fs, 'readFile').callsFake(() => Promise.resolve('{}'));
    sinon.stub(fs, 'rm').callsFake(() => Promise.resolve());

    forkStub = sinon.stub(childProcess, 'spawn');
    forkStub.returns(childProcessMock);
    sut = testInjector.injector.injectFunction(createTapTestRunnerFactory('__stryker2__'));
  });

  afterEach(() => {
    childProcessMock.removeAllListeners();
    childProcessMock.stdout.removeAllListeners();
  });

  describe('capabilities', () => {
    it('should communicate reloadEnvironment = true', () => {
      const expectedCapabilities: TestRunnerCapabilities = {
        reloadEnvironment: true,
      };

      expect(sut.capabilities()).deep.eq(expectedCapabilities);
    });
  });

  describe('mutantRun', () => {
    it('should wait for process to exit before returning result', async () => {
      // Added this test because it was possible that two process were trying to use the same mutated files resulting in a locked file error.
      // For more info see: https://github.com/stryker-mutator/stryker-js/issues/4122

      const runPromise = sut.mutantRun(factory.mutantRunOptions({ testFilter: ['test.js'] }));
      let processFinished = false;

      // End the tapParser manually so the process is not killed
      tapParser.end('');

      childProcessMock.on('exit', () => {
        processFinished = true;
      });

      // Wait a second before emitting the exit event
      setTimeout(() => {
        childProcessMock.emit('exit', 0);
      }, 1000);

      // Should wait for the process to finish before resolving
      await runPromise;
      expect(processFinished).to.be.true;
    });
  });
});
