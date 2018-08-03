import { ProjectKind } from '../StrykerKarmaSetup';
import * as angularStarter from './angularStarter';
import * as karmaStarter from './karmaStarter';

export default class ProjectStarter {
  constructor(private kind: ProjectKind) { }
  start() {
    if (this.kind === 'angular-cli') {
      return angularStarter.start();
    } else {
      return karmaStarter.start();
    }
  }
}