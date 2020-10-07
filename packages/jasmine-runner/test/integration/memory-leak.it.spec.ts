import path = require('path');

import execa = require('execa');

import { expect } from 'chai';

import { JasmineTestRunner } from '../../src';

describe(JasmineTestRunner.name, () => {
  it('should not leak memory when running multiple times (#2461)', async () => {
    const childProcess = await execa.node(path.resolve(__dirname, 'MemoryLeak.worker.js'), [], {
      stdio: 'pipe',
      nodeOptions: ['--max-old-space-size=32', '--max-semi-space-size=1'],
    });
    expect(childProcess.exitCode).eq(0);
    expect(childProcess.stdout).contains('Iterator count 1');
  });
});
