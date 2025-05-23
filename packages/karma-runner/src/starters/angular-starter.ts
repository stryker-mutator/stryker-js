import decamelize from 'decamelize';
import { Logger } from '@stryker-mutator/api/logging';
import semver from 'semver';
import type { requireResolve } from '@stryker-mutator/util';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';

import { NgTestArguments } from '../../src-generated/karma-runner-options.js';
import { strykerKarmaConfigPath } from '../karma-plugins/index.js';
import { KarmaRunnerOptionsWithStrykerOptions } from '../karma-runner-options-with-stryker-options.js';
import { pluginTokens } from '../plugin-tokens.js';

import { StartedProject } from './started-project.js';
import { ProjectStarter } from './project-starter.js';

const MIN_ANGULAR_CLI_VERSION = '6.1.0';

type AngularCli = (options: {
  testing?: boolean;
  cliArgs: string[];
}) => Promise<number>;

export class AngularProjectStarter implements ProjectStarter {
  public static inject = tokens(
    commonTokens.logger,
    commonTokens.options,
    pluginTokens.requireResolve,
  );

  constructor(
    private readonly logger: Logger,
    private readonly options: StrykerOptions,
    private readonly requireFromCwd: typeof requireResolve,
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await -- Any thrown errors need to be translated to rejections
  public async start(): Promise<StartedProject> {
    this.verifyAngularCliVersion();
    const { ngConfig } = (this.options as KarmaRunnerOptionsWithStrykerOptions)
      .karma;

    // Make sure require angular cli from inside this function, that way it won't break if angular isn't installed and this file is required.
    let cli = this.requireFromCwd('@angular/cli') as AngularCli;
    if ('default' in cli) {
      cli = (cli as unknown as { default: AngularCli }).default;
    }
    const cliArgs = [
      'test',
      '--progress=false',
      `--karma-config=${strykerKarmaConfigPath}`,
    ];
    if (ngConfig?.testArguments) {
      const testArguments: NgTestArguments = ngConfig.testArguments;

      const ngTestArguments = Object.keys(testArguments);
      verifyNgTestArguments(ngTestArguments);
      ngTestArguments.forEach((key) => {
        const decamelizedKey = decamelize(key, { separator: '-' });
        if ('progress' !== key && 'karma-config' !== decamelizedKey) {
          cliArgs.push(`--${decamelizedKey}=${testArguments[key]}`);
        }
      });
    }
    const actualCommand = `ng ${cliArgs.join(' ')}`;
    this.logger.debug(`Starting Angular tests: ${actualCommand}`);
    return {
      exitPromise: cli({ cliArgs }),
    };
  }
  private verifyAngularCliVersion() {
    const pkg = this.requireFromCwd('@angular/cli/package') as {
      version: string;
    };
    const version = semver.coerce(pkg.version);
    if (!version || semver.lt(version, MIN_ANGULAR_CLI_VERSION)) {
      throw new Error(
        `Your @angular/cli version (${pkg.version}) is not supported. Please install ${MIN_ANGULAR_CLI_VERSION} or higher`,
      );
    }
  }
}

function verifyNgTestArguments(ngTestArguments: string[]) {
  const prefixedArguments = ngTestArguments.filter((key) =>
    key.trim().startsWith('-'),
  );
  if (prefixedArguments.length > 0) {
    throw new Error(
      `Don't prefix arguments with dashes ('-'). Stryker will do this automatically. Problematic arguments are ${prefixedArguments.join(', ')}.`,
    );
  }
}
