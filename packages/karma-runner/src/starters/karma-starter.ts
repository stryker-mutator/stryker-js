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
      config = await karma.config.parseConfig(
        configFile,
        {},
        { promiseConfig: true, throwErrors: true },
      );
    }

    const exitTask = new Task<number>();
    await new karma.Server(config, exitTask.resolve).start();
    return {
      exitPromise: exitTask.promise,
    };
  },
};
