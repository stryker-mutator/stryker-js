import StrykerKarmaSetup from '../StrykerKarmaSetup';
import * as angularStarter from './angularStarter';
import * as karmaStarter from './karmaStarter';

export default class ProjectStarter {
  constructor(private readonly setup: StrykerKarmaSetup) {}
  public start() {
    if (this.setup.projectType === 'angular-cli') {
      return angularStarter.start(this.setup.ngConfig);
    } else {
      return karmaStarter.start();
    }
  }
}
