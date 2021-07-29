import { Task } from '@stryker-mutator/util';
import type { Config, ConfigOptions } from 'karma';

import { karma } from '../karma-wrapper';

import { StartedProject } from './started-project';

export async function start(): Promise<StartedProject> {
  const configFile = require.resolve('./stryker-karma.conf');
  let config: Config | ConfigOptions = {
    configFile,
  };
  if (karma.config?.parseConfig) {
    config = await karma.config.parseConfig(configFile, {}, { promiseConfig: true, throwErrors: true });
  }

  const exitTask = new Task<number>();
  await new karma.Server(config, exitTask.resolve).start();
  return {
    exitPromise: exitTask.promise,
  };
}
