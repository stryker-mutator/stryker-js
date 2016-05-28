
import {Reporter, SourceFile, MutantResult} from '../api/report';
import {StrykerOptions} from '../api/core';
import * as log4js from 'log4js';

const log = log4js.getLogger('BroadcastReporter');

export interface NamedReporter {
  name: string,
  reporter: Reporter
}

export default class BroadcastReporter implements Reporter {

  constructor(private reporters: NamedReporter[]) {
    ['onSourceFileRead', 'onAllSourceFilesRead', 'onMutantTested', 'onAllMutantsTested', 'onConfigRead'].forEach(method => {
      (<any>this)[method] = (arg: any) => {
        this.broadcast(method, arg);
      }
    })
  }

  private broadcast(methodName: string, eventArgs: any) {
    this.reporters.forEach(namedReporter => {
      let reporter = <any>namedReporter.reporter;
      if (reporter[methodName] && typeof reporter[methodName] === 'function') {
        try {
          reporter[methodName](eventArgs);
        } catch (error) {
          log.error(`An error occurred during '${methodName}' on reporter '${namedReporter.name}'. Error was: ${error}`);
        }
      }
    })
  }
}