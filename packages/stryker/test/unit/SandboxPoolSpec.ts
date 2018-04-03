import { File } from 'stryker-api/core';
import * as os from 'os';
import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import SandboxPool from '../../src/SandboxPool';
import { TestFramework } from 'stryker-api/test_framework';
import { Mock, mock, testFramework, file, config } from '../helpers/producers';
import Sandbox from '../../src/Sandbox';
import '../helpers/globals';

describe('SandboxPool', () => {
  let sut: SandboxPool;
  let firstSandbox: Mock<Sandbox>;
  let secondSandbox: Mock<Sandbox>;
  let options: Config;
  let expectedTestFramework: TestFramework;
  let expectedInputFiles: File[];

  beforeEach(() => {
    options = config();
    expectedTestFramework = testFramework();
    firstSandbox = mock(Sandbox);
    firstSandbox.dispose.resolves();
    secondSandbox = mock(Sandbox);
    secondSandbox.dispose.resolves();
    const genericSandboxForAllSubsequentCallsToNewSandbox = mock<Sandbox>(Sandbox);
    genericSandboxForAllSubsequentCallsToNewSandbox.dispose.resolves();
    global.sandbox.stub(Sandbox, 'create')
      .resolves(genericSandboxForAllSubsequentCallsToNewSandbox)
      .onCall(0).resolves(firstSandbox)
      .onCall(1).resolves(secondSandbox);

    expectedInputFiles = [file()];
    sut = new SandboxPool(options, expectedTestFramework, expectedInputFiles);
  });

  describe('streamSandboxes', () => {
    it('should use maxConcurrentTestRunners when set', async () => {
      options.maxConcurrentTestRunners = 1;
      await sut.streamSandboxes().toArray().toPromise();
      expect(Sandbox.create).to.have.callCount(1);
      expect(Sandbox.create).calledWith(options, 0, expectedInputFiles, expectedTestFramework);
    });

    it('should use cpuCount when maxConcurrentTestRunners is set too high', async () => {
      global.sandbox.stub(os, 'cpus').returns([1, 2, 3]); // stub 3 cpus
      options.maxConcurrentTestRunners = 100;
      const actual = await sut.streamSandboxes().toArray().toPromise();
      expect(actual).lengthOf(3);
      expect(Sandbox.create).to.have.callCount(3);
      expect(Sandbox.create).calledWith(options, 0, expectedInputFiles, expectedTestFramework);
    });

    it('should use the cpuCount when maxConcurrentTestRunners is <= 0', async () => {
      global.sandbox.stub(os, 'cpus').returns([1, 2, 3]); // stub 3 cpus
      options.maxConcurrentTestRunners = 0;
      const actual = await sut.streamSandboxes().toArray().toPromise();
      expect(Sandbox.create).to.have.callCount(3);
      expect(actual).lengthOf(3);
      expect(Sandbox.create).calledWith(options, 0, expectedInputFiles, expectedTestFramework);
    });

    it('should use the cpuCount - 1 when a transpiler is configured', async () => {
      options.transpilers = ['a transpiler'];
      options.maxConcurrentTestRunners = 2;
      global.sandbox.stub(os, 'cpus').returns([1, 2]); // stub 2 cpus
      const actual = await sut.streamSandboxes().toArray().toPromise();
      expect(Sandbox.create).to.have.callCount(1);
      expect(actual).lengthOf(1);
    });

    // see https://github.com/stryker-mutator/stryker/issues/396
    it('should dispose the newly created sandboxes if the sandbox pool is already disposed', async () => {
      await sut.disposeAll();
      const actualSandboxes = await sut.streamSandboxes().toArray().toPromise();
      actualSandboxes.forEach(actual => expect(actual.dispose).called);
      expect(actualSandboxes).to.have.length.greaterThan(0);
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

