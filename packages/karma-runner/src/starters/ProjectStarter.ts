import { LoggerFactoryMethod } from '@stryker-mutator/api/logging';

import { StrykerKarmaSetup } from '../../src-generated/karma-runner-options';

import * as angularStarter from './angularStarter';
import * as karmaStarter from './karmaStarter';

export default class ProjectStarter {
  constructor(private readonly getLogger: LoggerFactoryMethod, private readonly setup: StrykerKarmaSetup) {}
  public start() {
    if (this.setup.projectType === 'angular-cli') {
      return angularStarter.start(this.getLogger, this.setup.ngConfig);
    }
    return karmaStarter.start();
  }
}
