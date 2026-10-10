import childProcess from 'child_process';

import { EventEmitter } from 'events';

import { PassThrough, Readable } from 'stream';

import fs from 'fs/promises';

import sinon from 'sinon';

import {
  DryRunStatus,
  TestRunnerCapabilities,
} from '@stryker-mutator/api/test-runner';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import * as tap from 'tap-parser';

import {
  createTapTestRunnerFactory,
  TapTestRunner,
} from '../../src/tap-test-runner.js';
import { TapParser } from '../../src/tap-parser-factory.js';
import { tapRunnerOptions } from '../helpers/factory.js';

class ChildProcessMock extends EventEmitter {
  public stdout: Readable = new PassThrough();
  public stderr = new PassThrough();
}

describe(TapTestRunner.name, () => {
  let sut: TapTestRunner;
  let childProcessMock: ChildProcessMock;
  let forkStub: sinon.SinonStub;
  let tapParser: tap.Parser;

  beforeEach(() => {
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
    sut = testInjector.injector.injectFunction(
      createTapTestRunnerFactory('__stryker2__'),
    );
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

  describe('dryRun', () => {
    it('should hide the test process console window', async () => {
      Object.assign(testInjector.options, { tap: tapRunnerOptions() });
      const result = sut.dryRun(
        factory.dryRunOptions({ testFiles: ['test.js'] }),
      );
      childProcessMock.stdout.push('TAP version 13\n1..1\nok 1 - passes\n');
      childProcessMock.stdout.push(null);
      childProcessMock.emit('exit', 0);

      expect(await result).property('status', DryRunStatus.Complete);
      expect(forkStub).calledOnceWithExactly(
        'node',
        sinon.match.array,
        sinon.match({ windowsHide: true }),
      );
    });
  });
});
