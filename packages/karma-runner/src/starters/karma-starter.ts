import { createRequire } from 'module';

import { Task } from '@stryker-mutator/util';
import type { Config, ConfigOptions } from 'karma';

import { strykerKarmaConfigPath } from '../karma-plugins/index.js';
import { karma } from '../karma-wrapper.js';

import type { ProjectStarter } from './project-starter.js';
import type { StartedProject } from './started-project.js';

export const karmaConfigStarter: ProjectStarter = {
  async start(): Promise<StartedProject> {
    const configFile = strykerKarmaConfigPath;
    let config: Config | ConfigOptions = {
      configFile,
    };
    if (karma.config?.parseConfig) {
      config = await karma.config.parseConfig(configFile, {}, { promiseConfig: true, throwErrors: true });
      config.logLevel = 'debug';
      const require = createRequire(import.meta.url);
      const log4js = require(require.resolve('log4js', { paths: [require.resolve('karma')] }));
      log4js.configure({
        appenders: {
          out: { type: 'stdout' },
        },
        categories: {
          default: { appenders: ['out'], level: 'debug' },
        },
      });
    }

    const exitTask = new Task<number>();
    await new karma.Server(config, exitTask.resolve).start();
    return {
      exitPromise: exitTask.promise,
    };
  },
};
