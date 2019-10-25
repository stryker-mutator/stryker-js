import StrykerCli from '../../src/StrykerCli';
import { Command } from 'commander';
import * as sinon from 'sinon';
import LogConfigurator from '../../src/logging/LogConfigurator';
import { Logger } from '@stryker-mutator/api/logging';
import { logger } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import { DashboardOptions, StrykerOptions } from '@stryker-mutator/api/core';

describe(StrykerCli.name, () => {
  let runMutationTestingStub: sinon.SinonStub;
  let configureLoggerStub: sinon.SinonStub;
  let logMock: sinon.SinonStubbedInstance<Logger>;

  beforeEach(() => {
    runMutationTestingStub = sinon.stub();
    logMock = logger();
    configureLoggerStub = sinon.stub(LogConfigurator, 'configureMainProcess');
  });

  it('should configure the logger with argument', () => {
    runMutationTestingStub.resolves();
    actRun(['--logLevel', 'error']);
    expect(configureLoggerStub).calledWith('error');
  });

  describe('dashboard options', () => {
    beforeEach(() => {
      runMutationTestingStub.resolves();
    });
    it('should parse options to a deep object', () => {
      const expectedDashboardOptions: Required<DashboardOptions> = {
        baseUrl: 'https://dashboard.qux.io',
        module: 'baz/module',
        project: 'github.com/fooOrg/barProject',
        version: '1.5.3',
        fullReport: false
      };
      actRun([
        '--dashboard.version',
        expectedDashboardOptions.version,
        '--dashboard.project',
        expectedDashboardOptions.project,
        '--dashboard.module',
        expectedDashboardOptions.module,
        '--dashboard.baseUrl',
        expectedDashboardOptions.baseUrl,
        '--dashboard.noFullReport'
      ]);
      expect(runMutationTestingStub).calledWithMatch({
        dashboard: expectedDashboardOptions
      });
    });

    it('should remove any lingering options', () => {
      actRun(['--dashboard.version', 'foo', '--dashboard.project', 'bar', '--dashboard.module', 'baz', '--dashboard.baseUrl', 'quux']);
      const call = runMutationTestingStub.getCall(0);
      const actualOptions: StrykerOptions = call.args[0];
      const dashboardKeys = Object.keys(actualOptions).filter(key => key.startsWith('dashboard.'));
      expect(dashboardKeys, JSON.stringify(dashboardKeys)).lengthOf(0);
    });
  });

  function actRun(args: string[]) {
    new StrykerCli(['node', 'stryker', 'run', ...args], new Command(), runMutationTestingStub, logMock).run();
  }
});
