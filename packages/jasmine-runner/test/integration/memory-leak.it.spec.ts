import path = require('path');

import execa = require('execa');

import { expect } from 'chai';

import { JasmineTestRunner } from '../../src';

describe(JasmineTestRunner.name, () => {
  it('should not leak memory when running multiple times (#2461)', async function () {
    if (process.version.startsWith('10')) {
      console.log('OOM error test is unstable on node 10');
      this.skip();
    }
    const childProcess = await execa.node(path.resolve(__dirname, 'memory-leak.worker.js'), [], {
      stdio: 'pipe',
      nodeOptions: ['--max-old-space-size=32', '--max-semi-space-size=1'],
    });
    expect(childProcess.exitCode).eq(0);
    expect(childProcess.stdout).contains('Iterator count 1');
  });
});
