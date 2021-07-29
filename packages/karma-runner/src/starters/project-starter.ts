import { LoggerFactoryMethod } from '@stryker-mutator/api/logging';

import { StrykerKarmaSetup } from '../../src-generated/karma-runner-options';

import * as angularStarter from './angular-starter';
import * as karmaStarter from './karma-starter';
import { StartedProject } from './started-project';

export class ProjectStarter {
  constructor(private readonly getLogger: LoggerFactoryMethod, private readonly setup: StrykerKarmaSetup) {}
  public start(): Promise<StartedProject> {
    if (this.setup.projectType === 'angular-cli') {
      return angularStarter.start(this.getLogger, this.setup.ngConfig);
    } else {
      return karmaStarter.start();
    }
  }
}
