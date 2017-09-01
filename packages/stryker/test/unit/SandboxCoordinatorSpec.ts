import { File } from 'stryker-api/core';
import * as os from 'os';
import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import SandboxCoordinator from '../../src/SandboxCoordinator';
import { TestFramework } from 'stryker-api/test_framework';
import { Mock, mock, testFramework, textFile } from '../helpers/producers';
import * as strykerSandbox from '../../src/Sandbox';
import Sandbox from '../../src/Sandbox';
import '../helpers/globals';

describe('SandboxCoordinator', () => {
  let sut: SandboxCoordinator;
  let firstSandbox: Mock<Sandbox>;
  let secondSandbox: Mock<Sandbox>;
  let options: Config;
  let coverageInstrumenter: any;
  let expectedTestFramework: TestFramework;
  let expectedInputFiles: File[];

  beforeEach(() => {
    options = <any>{};
    expectedTestFramework = testFramework();
    coverageInstrumenter = 'a coverage instrumenter';
    firstSandbox = mock(Sandbox);
    firstSandbox.initialize.resolves();
    firstSandbox.dispose.resolves();
    secondSandbox = mock(Sandbox);
    secondSandbox.initialize.resolves();
    secondSandbox.dispose.resolves();
    const genericSandboxForAllSubsequentCallsToNewSandbox = mock(Sandbox);
    genericSandboxForAllSubsequentCallsToNewSandbox.initialize.resolves();
    genericSandboxForAllSubsequentCallsToNewSandbox.dispose.resolves();
    global.sandbox.stub(strykerSandbox, 'default')
      .returns(genericSandboxForAllSubsequentCallsToNewSandbox)
      .onCall(0).returns(firstSandbox)
      .onCall(1).returns(secondSandbox);

    expectedInputFiles = [textFile()];
    sut = new SandboxCoordinator(options, expectedTestFramework, expectedInputFiles);
  });

  describe('streamSandboxes', () => {
    it('should use maxConcurrentTestRunners when set', async () => {
      options.maxConcurrentTestRunners = 1;
      await sut.streamSandboxes().toArray().toPromise();
      expect(strykerSandbox.default).calledWithNew;
      expect(strykerSandbox.default).to.have.callCount(1);
      expect(strykerSandbox.default).calledWith(options, 0, expectedInputFiles, expectedTestFramework, null);
    });

    it('should use cpuCount when maxConcurrentTestRunners is set too high', async () => {
      global.sandbox.stub(os, 'cpus').returns([1, 2, 3]); // stub 3 cpus
      options.maxConcurrentTestRunners = 100;
      const actual = await sut.streamSandboxes().toArray().toPromise();
      expect(strykerSandbox.default).calledWithNew;
      expect(actual).lengthOf(2);
      expect(strykerSandbox.default).to.have.callCount(2);
      expect(strykerSandbox.default).calledWith(options, 0, expectedInputFiles, expectedTestFramework, null);
    });

    it('should use the cpuCount when maxConcurrentTestRunners is <= 0', async () => {
      global.sandbox.stub(os, 'cpus').returns([1, 2, 3]); // stub 3 cpus
      options.maxConcurrentTestRunners = 0;
      const actual = await sut.streamSandboxes().toArray().toPromise();
      expect(strykerSandbox.default).calledWithNew;
      expect(strykerSandbox.default).to.have.callCount(2);
      expect(actual).lengthOf(2);
      expect(strykerSandbox.default).calledWith(options, 0, expectedInputFiles, expectedTestFramework, null);
    });
  });
  describe('dispose', () => {
    it('should have disposed all sandboxes', async () => {
      await sut.streamSandboxes().toArray().toPromise();
      await sut.disposeAll();
      expect(firstSandbox.dispose).called;
      expect(secondSandbox.dispose).called;
    });

    it('should not do anything if no sandboxes were created', async () => {
      await sut.disposeAll();
      expect(firstSandbox.dispose).not.called;
      expect(secondSandbox.dispose).not.called;
    });
  });
});

