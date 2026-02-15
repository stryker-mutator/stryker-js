import { Command } from 'commander';
import sinon from 'sinon';
import { expect } from 'chai';
import {
  DashboardOptions,
  StrykerOptions,
  ReportType,
  PartialStrykerOptions,
} from '@stryker-mutator/api/core';

import { guardMinimalNodeVersion, StrykerCli } from '../../src/stryker-cli.js';
import { Injector } from 'typed-inject';
import { factory, tick } from '@stryker-mutator/test-helpers';
import { coreTokens } from '../../src/di/index.js';
import { LoggingBackend } from '../../src/logging/logging-backend.js';
import { LoggingServer } from '../../src/logging/logging-server.js';

describe(StrykerCli.name, () => {
  let runMutationTestingStub: sinon.SinonStub;
  let runMutationTestingServerStub: sinon.SinonStubbedMember<
    NonNullable<ConstructorParameters<typeof StrykerCli>[3]>
  >;

  beforeEach(() => {
    runMutationTestingStub = sinon.stub();
    runMutationTestingServerStub = sinon.stub();
  });

  describe('run', () => {
    it('should accept a config file as last argument', () => {
      arrangeActAssertConfigOption(['stryker.foo.js'], {
        configFile: 'stryker.foo.js',
      });
    });
    describe('flat options', () => {
      const testCases: Array<[string[], PartialStrykerOptions]> = [
        [['--files', 'foo.js,bar.js'], { files: ['foo.js', 'bar.js'] }],
        [
          ['--ignorePatterns', 'foo.js,bar.js'],
          { ignorePatterns: ['foo.js', 'bar.js'] },
        ],
        [
          ['--buildCommand', 'npm run build'],
          { buildCommand: 'npm run build' },
        ],
        [['-b', 'npm run build'], { buildCommand: 'npm run build' }],
        [['--checkers', 'foo,bar'], { checkers: ['foo', 'bar'] }],
        [['--checkers', 'foo'], { checkers: ['foo'] }],
        [['--checkers', ''], { checkers: [] }],
        [
          ['--checkerNodeArgs', '--inspect=1337 --gc'],
          { checkerNodeArgs: ['--inspect=1337', '--gc'] },
        ],
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
        [
          ['--maxConcurrentTestRunners', '42'],
          { maxConcurrentTestRunners: 42 },
        ],
        [['--tempDirName', 'foo-tmp'], { tempDirName: 'foo-tmp' }],
        [['--testRunner', 'foo-running'], { testRunner: 'foo-running' }],
        [
          ['--testRunnerNodeArgs', '--inspect=1337 --gc'],
          { testRunnerNodeArgs: ['--inspect=1337', '--gc'] },
        ],
        [['--coverageAnalysis', 'all'], { coverageAnalysis: 'all' }],
        [['--incremental'], { incremental: true }],
        [
          ['--incrementalFile', 'some-file.json'],
          { incrementalFile: 'some-file.json' },
        ],
        [['--inPlace'], { inPlace: true }],
        [['--force'], { force: true }],
        [['--ignoreStatic'], { ignoreStatic: true }],
        [['--concurrency', '5'], { concurrency: 5 }],
        [['--concurrency', '50%'], { concurrency: '50%' }],
        [['--cleanTempDir', 'false'], { cleanTempDir: false }],
        [['--cleanTempDir', 'always'], { cleanTempDir: 'always' }],
        [['-c', '6'], { concurrency: 6 }],
        [['-c', '12'], { concurrency: 12 }],
        [['-c', '100%'], { concurrency: '100%' }],
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
        actRun(
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
        );
        expect(runMutationTestingStub).calledWithMatch({
          dashboard: expectedDashboardOptions,
        });
      });

      it('should remove any lingering options', () => {
        actRun(
          '--dashboard.version',
          'foo',
          '--dashboard.project',
          'bar',
          '--dashboard.module',
          'baz',
          '--dashboard.baseUrl',
          'quux',
        );
        const call = runMutationTestingStub.getCall(0);
        const actualOptions: StrykerOptions = call.args[0];
        const dashboardKeys = Object.keys(actualOptions).filter((key) =>
          key.startsWith('dashboard.'),
        );
        expect(dashboardKeys, JSON.stringify(dashboardKeys)).lengthOf(0);
      });
    });

    it('should provide a meaningful help', () => {
      const stdoutStub = sinon.stub(process.stdout, 'write');
      expect(() => actRun('-h')).throws('(outputHelp)');
      expect(stdoutStub.callCount).eq(1);
      const helpText = stdoutStub.getCall(0).args[0] as string;
      expect(helpText).matchSnapshot();
    });

    function actRun(...args: string[]): void {
      act(['run', ...args]);
    }

    function arrangeActAssertConfigOption(
      args: string[],
      expectedOptions: PartialStrykerOptions,
    ): void {
      runMutationTestingStub.resolves();
      actRun(...args);
      expect(runMutationTestingStub).called;
      expect(runMutationTestingStub).calledWith(expectedOptions);
    }
  });

  describe('init', () => {
    it('should injected logging classes', async () => {
      const injectorMock = factory.injector();

      actInit(() => injectorMock as Injector);
      await tick();

      expect(injectorMock.provideClass).to.be.calledTwice;
      expect(injectorMock.provideClass).to.be.calledWith(
        coreTokens.loggingSink,
        LoggingBackend,
      );
      expect(injectorMock.provideClass).to.be.calledWith(
        coreTokens.loggingServer,
        LoggingServer,
      );
    });

    it('should dispose of injected classes', async () => {
      const injectorMock = factory.injector();

      actInit(() => injectorMock as Injector);
      await tick();

      expect(injectorMock.dispose).to.be.called;
    });

    it('should provide a meaningful help', () => {
      const stdoutStub = sinon.stub(process.stdout, 'write');
      expect(() => actInit(() => factory.injector() as Injector, '-h')).throws(
        '(outputHelp)',
      );
      expect(stdoutStub.callCount).eq(1);
      const helpText = stdoutStub.getCall(0).args[0] as string;
      expect(helpText).matchSnapshot();
    });

    function actInit(injectorStub: () => Injector, ...args: string[]): void {
      act(['init', ...args], injectorStub);
    }
  });

  describe('runServer [DEPRECATED]', () => {
    let consoleLogStub: sinon.SinonStubbedMember<typeof console.log>;
    let stdoutStub: sinon.SinonStubbedMember<NodeJS.WriteStream['write']>;

    beforeEach(() => {
      consoleLogStub = sinon.stub(console, 'log');
      stdoutStub = sinon.stub(process.stdout, 'write');
    });

    it('should pass options to the Stryker Server', () => {
      actRunServer('--concurrency', '5');
      sinon.assert.calledWithExactly(
        runMutationTestingServerStub,
        { channel: 'socket' },
        {
          concurrency: 5,
        },
      );
    });

    it('should log the port to the console as JSON', async () => {
      const expectedPort = 1337;
      runMutationTestingServerStub.resolves(expectedPort);
      actRunServer();
      await tick();
      sinon.assert.calledWithExactly(
        consoleLogStub,
        JSON.stringify({ port: expectedPort }),
      );
    });

    it('should provide a meaningful help', () => {
      expect(() => actRunServer('-h')).throws('(outputHelp)');
      expect(stdoutStub.callCount).eq(1);
      const helpText = stdoutStub.getCall(0).args[0] as string;
      expect(helpText).matchSnapshot();
    });

    function actRunServer(...args: string[]): void {
      act(['runServer', ...args]);
    }
  });

  describe('serve', () => {
    let consoleLogStub: sinon.SinonStubbedMember<typeof console.log>;
    let stdoutStub: sinon.SinonStubbedMember<NodeJS.WriteStream['write']>;
    let stderrStub: sinon.SinonStubbedMember<NodeJS.WriteStream['write']>;

    beforeEach(() => {
      consoleLogStub = sinon.stub(console, 'log');
      stdoutStub = sinon.stub(process.stdout, 'write');
      stderrStub = sinon.stub(process.stderr, 'write');
    });

    it('should pass stdio as server options', async () => {
      await actServe('stdio');
      sinon.assert.calledWithExactly(
        runMutationTestingServerStub,
        { channel: 'stdio' },
        {},
      );
    });

    it('should pass socket as server options', async () => {
      await actServe('socket', '--port', '1234');
      sinon.assert.calledWithExactly(
        runMutationTestingServerStub,
        { channel: 'socket', port: 1234, address: 'localhost' },
        {},
      );
    });

    it('should allow you to override the address for socket', async () => {
      await actServe('socket', '--port', '1234', '--address', '0.0.0.0');
      sinon.assert.calledWithExactly(
        runMutationTestingServerStub,
        { channel: 'socket', port: 1234, address: '0.0.0.0' },
        {},
      );
    });

    it('should pass additional options after -- as stryker options', async () => {
      await actServe('stdio', '--', '--concurrency', '5');
      sinon.assert.calledWithExactly(
        runMutationTestingServerStub,
        { channel: 'stdio' },
        { concurrency: 5 },
      );
    });

    it('should log stdio channel info to stderr and not stdout', async () => {
      await actServe('stdio');
      sinon.assert.notCalled(consoleLogStub);
      sinon.assert.notCalled(stdoutStub);
      sinon.assert.calledOnceWithExactly(
        stderrStub,
        `Stryker server started on stdio channel\n`,
      );
    });

    it('should log socket channel info to stderr and not stdout', async () => {
      runMutationTestingServerStub.resolves(1234);
      await actServe('socket', '--port', '1234');
      sinon.assert.notCalled(consoleLogStub);
      sinon.assert.notCalled(stdoutStub);
      sinon.assert.calledOnceWithExactly(
        stderrStub,
        `Stryker server listening on localhost:1234\n`,
      );
    });

    it('should provide a meaningful help', async () => {
      await expect(actServe('-h')).rejectedWith('(outputHelp)');
      expect(stdoutStub.callCount).eq(1);
      const helpText = stdoutStub.getCall(0).args[0] as string;
      expect(helpText).matchSnapshot();
    });

    async function actServe(...args: string[]) {
      act(['serve', ...args]);
      await tick();
    }
  });

  describe(guardMinimalNodeVersion.name, () => {
    it('should fail for < v20.0.0', () => {
      expect(() => guardMinimalNodeVersion('v19.99.9')).throws(
        'Node.js version v19.99.9 detected. StrykerJS requires version to match >=20.0.0. Please update your Node.js version or visit https://nodejs.org/ for additional instructions',
      );
    });
    it('should not fail for >= v20.0.0', () => {
      expect(() => guardMinimalNodeVersion('v20.0.0')).not.throws();
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  function act(args: string[], createInjectorImpl?: () => Injector<{}>): void {
    new StrykerCli(
      ['node', 'stryker', ...args],
      new Command()
        .exitOverride((err) => {
          throw err;
        })
        .configureOutput({
          getOutHelpWidth() {
            return 80;
          },
          getErrHelpWidth() {
            return 80;
          },
        }),
      runMutationTestingStub,
      runMutationTestingServerStub,
    ).run(createInjectorImpl);
  }
});
