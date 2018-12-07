import * as decamelize from 'decamelize';
import * as semver from 'semver';
import { requireModule } from '../utils';
import { NgConfigOptions, NgTestArguments } from '../StrykerKarmaSetup';
import { getLogger, Logger } from 'stryker-api/logging';
import * as path from 'path';

const MIN_ANGULAR_CLI_VERSION = '6.1.0';

export async function start(ngConfig?: NgConfigOptions): Promise<void> {
  const logger: Logger = getLogger(path.basename(__filename));
  // Make sure require angular cli from inside this function, that way it won't break if angular isn't installed and this file is required.
  const version = semver.coerce(requireModule('@angular/cli/package').version);
  if (!version || semver.lt(version, MIN_ANGULAR_CLI_VERSION)) {
    throw new Error(
      `Your @angular/cli version (${version}) is not supported. Please install ${MIN_ANGULAR_CLI_VERSION} or higher`
    );
  }
  let cli = requireModule('@angular/cli');
  if ('default' in cli) {
    cli = cli.default;
  }
  const cliArgs = [
    'test',
    '--progress=false',
    `--karma-config=${require.resolve('./stryker-karma.conf')}`
  ];
  if (ngConfig && ngConfig.testArguments) {
    const testArguments: NgTestArguments = ngConfig.testArguments;
    Object.keys(testArguments).forEach(key => {
      const decamelizedKey = decamelize(key);
      if (
        'progress' !== key &&
        'karma-config' !== decamelizedKey &&
        !decamelizedKey.trim().startsWith('-')
      ) {
        cliArgs.push(`--${decamelizedKey}=${testArguments[key]}`);
      }
    });
  }
  logger.debug('Starting Angular tests: ng', cliArgs.join(' '));
  return cli({
    cliArgs,
    inputStream: process.stdin,
    outputStream: process.stdout
  });
}
