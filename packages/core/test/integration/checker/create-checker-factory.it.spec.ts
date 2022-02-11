import fs from 'fs';

import { LogLevel } from '@stryker-mutator/api/core';
import { factory, LoggingServer, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { CheckStatus } from '@stryker-mutator/api/check';

import { createCheckerFactory } from '../../../src/checker';
import { coreTokens } from '../../../src/di';
import { LoggingClientContext } from '../../../src/logging';

import { CheckerResource } from '../../../src/checker/checker-resource';

import { TwoTimesTheCharm } from './additional-checkers';

describe(`${createCheckerFactory.name} integration`, () => {
  let createSut: () => CheckerResource;
  let loggingContext: LoggingClientContext;
  let sut: CheckerResource;
  let loggingServer: LoggingServer;

  function rmSync(fileName: string) {
    if (fs.existsSync(fileName)) {
      fs.unlinkSync(fileName);
    }
  }

  beforeEach(async () => {
    // Make sure there is a logging server listening
    loggingServer = new LoggingServer();
    const port = await loggingServer.listen();
    loggingContext = { port, level: LogLevel.Trace };
    testInjector.options.plugins = [require.resolve('./additional-checkers')];
    createSut = testInjector.injector.provideValue(coreTokens.loggingContext, loggingContext).injectFunction(createCheckerFactory);
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
    const checkerName = 'healthy';
    await arrangeSut(checkerName);
    const mutant = factory.mutant({ id: '1' });
    const result = await sut.check(checkerName, [mutant]);
    expect(result[mutant.id]).deep.eq({ status: CheckStatus.Passed });
  });

  it('should reject when the checker behind rejects', async () => {
    const checkerName = 'crashing';
    await arrangeSut(checkerName);
    await expect(sut.check(checkerName, [factory.mutant()])).rejectedWith('Always crashing');
  });

  it('should recover when the checker behind rejects', async () => {
    const checkerName = 'two-times-the-charm';
    await fs.promises.writeFile(TwoTimesTheCharm.COUNTER_FILE, '0', 'utf-8');
    await arrangeSut(checkerName);
    const mutant = factory.mutant();
    const actual = await sut.check(checkerName, [mutant]);
    expect(actual[mutant.id]).deep.eq({ status: CheckStatus.Passed });
  });

  it('should provide the nodeArgs', async () => {
    testInjector.options.checkerNodeArgs = ['--title=shouldProvideNodeArgs'];
    const checkerName = 'verify-title';
    await arrangeSut(checkerName);
    const passedMutant = factory.mutant({ fileName: 'shouldProvideNodeArgs' });
    const failedMutant = factory.mutant({ fileName: 'somethingElse' });
    const passed = await sut.check(checkerName, [passedMutant]);
    const failed = await sut.check(checkerName, [failedMutant]);

    expect(passed[passedMutant.id]).deep.eq(factory.checkResult({ status: CheckStatus.Passed }));
    expect(failed[failedMutant.id]).deep.eq(factory.checkResult({ status: CheckStatus.CompileError }));
  });
});
