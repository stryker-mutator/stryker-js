import { Command } from 'commander';
import sinon from 'sinon';
import { expect } from 'chai';
import { DashboardOptions, StrykerOptions, ReportType, PartialStrykerOptions } from '@stryker-mutator/api/core';

import { LogConfigurator } from '../../src/logging/index.js';
import { guardMinimalNodeVersion, StrykerCli } from '../../src/stryker-cli.js';

describe(StrykerCli.name, () => {
  let runMutationTestingStub: sinon.SinonStub;
  let configureLoggerStub: sinon.SinonStub;

  beforeEach(() => {
    runMutationTestingStub = sinon.stub();
    configureLoggerStub = sinon.stub(LogConfigurator, 'configureMainProcess');
  });

  it('should configure the logger with argument', () => {
    runMutationTestingStub.resolves();
    actRun(['--logLevel', 'error']);
    expect(configureLoggerStub).calledWith('error');
  });

  it('should accept a config file as last argument', () => {
    arrangeActAssertConfigOption(['stryker.foo.js'], { configFile: 'stryker.foo.js' });
  });

  describe('flat options', () => {
    const testCases: Array<[string[], PartialStrykerOptions]> = [
      [['--files', 'foo.js,bar.js'], { files: ['foo.js', 'bar.js'] }],
      [['--ignorePatterns', 'foo.js,bar.js'], { ignorePatterns: ['foo.js', 'bar.js'] }],
      [['--buildCommand', 'npm run build'], { buildCommand: 'npm run build' }],
      [['-b', 'npm run build'], { buildCommand: 'npm run build' }],
      [['--checkers', 'foo,bar'], { checkers: ['foo', 'bar'] }],
      [['--checkers', 'foo'], { checkers: ['foo'] }],
      [['--checkers', ''], { checkers: [] }],
      [['--checkerNodeArgs', '--inspect=1337 --gc'], { checkerNodeArgs: ['--inspect=1337', '--gc'] }],
      [['--disableBail'], { disableBail: true }],
      [['--dryRunOnly'], { dryRunOnly: true }],
      [['--allowEmpty'], { allowEmpty: true }],
      [['--mutate', 'foo.js,bar.js'], { mutate: ['foo.js', 'bar.js'] }],
      [['--reporters', 'foo,bar'], { reporters: ['foo', 'bar'] }],
      [['--plugins', 'foo,bar'], { plugins: ['foo', 'bar'] }],
      [['--appendPlugins', 'foo,bar'], { appendPlugins: ['foo', 'bar'] }],
      [['--timeoutMS', '42'], { timeoutMS: 42 }],
      [['--timeoutFactor', '42'], { timeoutFactor: 42 }],
      [['--dryRunTimeoutMinutes', '10'], { dryRunTimeoutMinutes: 10 }],
      [['--maxConcurrentTestRunners', '42'], { maxConcurrentTestRunners: 42 }],
      [['--tempDirName', 'foo-tmp'], { tempDirName: 'foo-tmp' }],
      [['--testRunner', 'foo-running'], { testRunner: 'foo-running' }],
      [['--testRunnerNodeArgs', '--inspect=1337 --gc'], { testRunnerNodeArgs: ['--inspect=1337', '--gc'] }],
      [['--coverageAnalysis', 'all'], { coverageAnalysis: 'all' }],
      [['--incremental'], { incremental: true }],
      [['--incrementalFile', 'some-file.json'], { incrementalFile: 'some-file.json' }],
      [['--inPlace'], { inPlace: true }],
      [['--force'], { force: true }],
      [['--ignoreStatic'], { ignoreStatic: true }],
      [['--concurrency', '5'], { concurrency: 5 }],
      [['--cleanTempDir', 'false'], { cleanTempDir: false }],
      [['--cleanTempDir', 'always'], { cleanTempDir: 'always' }],
      [['-c', '6'], { concurrency: 6 }],
      [['--maxTestRunnerReuse', '3'], { maxTestRunnerReuse: 3 }],
    ];
    testCases.forEach(([args, expected]) => {
      it(`should parse option "${args.map((arg) => (arg === '' ? "''" : arg)).join(' ')}" as ${JSON.stringify(expected)}"`, () => {
        arrangeActAssertConfigOption(args, expected);
      });
    });
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
        reportType: ReportType.Full,
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
        '--dashboard.reportType',
        'full',
      ]);
      expect(runMutationTestingStub).calledWithMatch({
        dashboard: expectedDashboardOptions,
      });
    });

    it('should remove any lingering options', () => {
      actRun(['--dashboard.version', 'foo', '--dashboard.project', 'bar', '--dashboard.module', 'baz', '--dashboard.baseUrl', 'quux']);
      const call = runMutationTestingStub.getCall(0);
      const actualOptions: StrykerOptions = call.args[0];
      const dashboardKeys = Object.keys(actualOptions).filter((key) => key.startsWith('dashboard.'));
      expect(dashboardKeys, JSON.stringify(dashboardKeys)).lengthOf(0);
    });
  });

  describe(guardMinimalNodeVersion.name, () => {
    it('should fail for < v16.0.0', () => {
      expect(() => guardMinimalNodeVersion('v16.20.2')).throws(
        'Node.js version v16.20.2 detected. StrykerJS requires version to match >=18.0.0. Please update your Node.js version or visit https://nodejs.org/ for additional instructions',
      );
    });
    it('should not fail for >= v18.0.0', () => {
      expect(() => guardMinimalNodeVersion('v18.0.0')).not.throws();
    });
  });

  function actRun(args: string[]): void {
    new StrykerCli(['node', 'stryker', 'run', ...args], new Command(), runMutationTestingStub).run();
  }

  function arrangeActAssertConfigOption(args: string[], expectedOptions: PartialStrykerOptions): void {
    runMutationTestingStub.resolves();
    actRun(args);
    expect(runMutationTestingStub).called;
    expect(runMutationTestingStub).calledWith(expectedOptions);
  }
});
