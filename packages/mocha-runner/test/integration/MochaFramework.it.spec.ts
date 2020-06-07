import * as path from 'path';

import { expect } from 'chai';
import { TestSelection } from '@stryker-mutator/api/test_framework';
import { TestStatus, RunStatus } from '@stryker-mutator/api/test_runner';
import { LoggingServer, testInjector } from '@stryker-mutator/test-helpers';
import MochaTestFramework from '@stryker-mutator/mocha-framework/src/MochaTestFramework';
import ChildProcessProxy from '@stryker-mutator/core/src/child-proxy/ChildProcessProxy';
import { LogLevel } from '@stryker-mutator/api/core';
import { commonTokens } from '@stryker-mutator/api/plugin';

import { MochaTestRunner } from '../../src/MochaTestRunner';

const test0: Readonly<TestSelection> = Object.freeze({
  id: 0,
  name: 'MyMath should be able to add two numbers'
});
const test3: Readonly<TestSelection> = Object.freeze({
  id: 3,
  name: 'MyMath should be able to recognize a negative number'
});

export function wrapInClosure(codeFragment: string) {
  return `
    (function (window) {
      ${codeFragment}
    })((Function('return this'))());`;
}

describe('Integration with @stryker-mutator/mocha-framework', () => {
  let testFramework: MochaTestFramework;
  let loggingServer: LoggingServer;
  let sut: ChildProcessProxy<MochaTestRunner>;

  beforeEach(async () => {
    testFramework = new MochaTestFramework();
    loggingServer = new LoggingServer();
    const resolveSampleProject: typeof path.resolve = path.resolve.bind(path, __dirname, '../../testResources/sampleProject');
    const port = await loggingServer.listen();
    testInjector.options.mochaOptions = {
      file: [],
      ignore: [],
      spec: [resolveSampleProject('MyMathSpec.js')]
    };
    testInjector.options.plugins = [];

    sut = ChildProcessProxy.create(
      require.resolve('../../src/MochaTestRunner'),
      { level: LogLevel.Trace, port },
      testInjector.options,
      {
        [commonTokens.sandboxFileNames]: [resolveSampleProject('MyMath.js'), resolveSampleProject('MyMathSpec.js')]
      },
      __dirname,
      MochaTestRunner
    );
    await sut.proxy.init();
  });

  afterEach(async () => {
    await sut.dispose();
    await loggingServer.dispose();
  });

  it('should be able to filter tests', async () => {
    const testHooks = wrapInClosure(testFramework.filter([test0, test3]));
    const actualResult = await sut.proxy.run({ testHooks });
    expect(actualResult.tests.map((test) => ({ name: test.name, status: test.status }))).deep.eq([
      {
        name: 'MyMath should be able to add two numbers',
        status: TestStatus.Success
      },
      {
        name: 'MyMath should be able to recognize a negative number',
        status: TestStatus.Success
      }
    ]);
  });

  it('should be able to clear the filter after a filtered run', async () => {
    await sut.proxy.run({ testHooks: wrapInClosure(testFramework.filter([test0, test3])) });
    const actualResult = await sut.proxy.run({ testHooks: wrapInClosure(testFramework.filter([])) });
    expect(actualResult.tests).lengthOf(5);
  });

  it('should be able to run beforeEach and afterEach', async () => {
    const testHooks = wrapInClosure(
      testFramework.beforeEach('console.log("beforeEach from hook");') + testFramework.afterEach('console.log("afterEach from hook");')
    );
    const actualProcessOutput = await sut.proxy.run({ testHooks });
    expect(actualProcessOutput.status).eq(RunStatus.Complete);
    expect(sut.stdout).includes('beforeEach from hook');
    expect(sut.stdout).includes('afterEach from hook');
  });
});
