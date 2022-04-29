import fs from 'fs';
import { URL } from 'url';

import { LogLevel } from '@stryker-mutator/api/core';
import { factory, LoggingServer, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { CheckResult, CheckStatus } from '@stryker-mutator/api/check';

import { CheckerFacade, createCheckerFactory } from '../../../src/checker/index.js';
import { coreTokens } from '../../../src/di/index.js';
import { LoggingClientContext } from '../../../src/logging/index.js';

import { TwoTimesTheCharm } from './additional-checkers.js';

describe(`${createCheckerFactory.name} integration`, () => {
  let createSut: () => CheckerFacade;
  let loggingContext: LoggingClientContext;
  let sut: CheckerFacade;
  let loggingServer: LoggingServer;
  let pluginModulePaths: string[];

  function rmSync(fileName: string) {
    if (fs.existsSync(fileName)) {
      fs.unlinkSync(fileName);
    }
  }

  beforeEach(async () => {
    // Make sure there is a logging server listening
    pluginModulePaths = [new URL('./additional-checkers.js', import.meta.url).toString()];
    loggingServer = new LoggingServer();
    const port = await loggingServer.listen();
    loggingContext = { port, level: LogLevel.Trace };
    createSut = testInjector.injector
      .provideValue(coreTokens.loggingContext, loggingContext)
      .provideValue(coreTokens.pluginModulePaths, pluginModulePaths)
      .injectFunction(createCheckerFactory);
  });

  afterEach(async () => {
    await sut.dispose?.();
    await loggingServer.dispose();
    rmSync(TwoTimesTheCharm.COUNTER_FILE);
  });

  async function arrangeSut(name: string): Promise<void> {
    testInjector.options.checkers = [name];
    sut = createSut();
    await sut.init?.();
  }

  it('should pass along the check result', async () => {
    const mutantRunPlan = factory.mutantRunPlan({ mutant: factory.mutant({ id: '1' }) });
    await arrangeSut('healthy');
    const expected: CheckResult = { status: CheckStatus.Passed };
    expect(await sut.check('healthy', [mutantRunPlan])).deep.eq([[mutantRunPlan, expected]]);
  });

  it('should reject when the checker behind rejects', async () => {
    await arrangeSut('crashing');
    await expect(sut.check('crashing', [factory.mutantRunPlan()])).rejectedWith('Always crashing');
  });

  it('should recover when the checker behind rejects', async () => {
    const mutantRunPlan = factory.mutantRunPlan();
    await fs.promises.writeFile(TwoTimesTheCharm.COUNTER_FILE, '0', 'utf-8');
    await arrangeSut('two-times-the-charm');
    const actual = await sut.check('two-times-the-charm', [mutantRunPlan]);
    const expected: CheckResult = { status: CheckStatus.Passed };
    expect(actual).deep.eq([[mutantRunPlan, expected]]);
  });

  it('should provide the nodeArgs', async () => {
    // Arrange
    const passingMutantRunPlan = factory.mutantRunPlan({ mutant: factory.mutant({ fileName: 'shouldProvideNodeArgs' }) });
    const failingMutantRunPlan = factory.mutantRunPlan({ mutant: factory.mutant({ fileName: 'somethingElse' }) });
    testInjector.options.checkerNodeArgs = ['--title=shouldProvideNodeArgs'];

    // Act
    await arrangeSut('verify-title');
    const passed = await sut.check('verify-title', [passingMutantRunPlan]);
    const failed = await sut.check('verify-title', [failingMutantRunPlan]);

    // Assert
    expect(passed).deep.eq([[passingMutantRunPlan, factory.checkResult({ status: CheckStatus.Passed })]]);
    expect(failed).deep.eq([[failingMutantRunPlan, factory.checkResult({ status: CheckStatus.CompileError })]]);
  });
});
