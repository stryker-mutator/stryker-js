import * as semver from 'semver';
import { requireModule } from '../utils';
import { NgConfigOptions } from '../StrykerKarmaSetup';

const MIN_ANGULAR_CLI_VERSION = '6.1.0';

export async function start(ngConfig?: NgConfigOptions): Promise<void> {
  
  // Make sure require angular cli from inside this function, that way it won't break if angular isn't installed and this file is required.
  const version = semver.coerce(requireModule('@angular/cli/package').version);
  if (!version || semver.lt(version, MIN_ANGULAR_CLI_VERSION)) {
    throw new Error(`Your @angular/cli version (${version}) is not supported. Please install ${MIN_ANGULAR_CLI_VERSION} or higher`);
  }
  let cli = requireModule('@angular/cli/lib/cli');
  if ('default' in cli) {
    cli = cli.default;
  }
  let cliArgs = ['test', '--progress=false', `--karma-config=${require.resolve('./stryker-karma.conf')}`];
  if (ngConfig && ngConfig.testArguments) {
    cliArgs = cliArgs.concat(ngConfig.testArguments || []);
  }
  return cli({
    cliArgs: cliArgs,
    inputStream: process.stdin,
    outputStream: process.stdout
  });
}
