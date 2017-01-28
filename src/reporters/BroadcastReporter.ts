
import { Reporter, SourceFile, MutantResult, MatchedMutant } from 'stryker-api/report';
import { StrykerOptions } from 'stryker-api/core';
import * as log4js from 'log4js';
import { isPromise } from '../utils/objectUtils';
import StrictReporter from './StrictReporter';
import ConfigReader from '../ConfigReader';

const log = log4js.getLogger('BroadcastReporter');

export interface NamedReporter {
  name: string;
  reporter: Reporter;
}

export const ALL_EVENT_METHOD_NAMES = ['onSourceFileRead', 'onAllSourceFilesRead', 'onAllMutantsMatchedWithTests', 'onMutantTested', 'onAllMutantsTested'];

export default class BroadcastReporter implements StrictReporter {

  constructor(private reporters: NamedReporter[]) {
    //Empty constructor
  }

  private broadcast(methodName: string, eventArgs?: any) {
    let allPromises: Promise<any>[] = [];
    this.reporters.forEach(namedReporter => {
      let reporter = <any>namedReporter.reporter;
      if (reporter[methodName] && typeof reporter[methodName] === 'function') {
        try {
          let maybePromise: void | Promise<any> = eventArgs ? reporter[methodName](eventArgs) : reporter[methodName]();
          if (isPromise(maybePromise)) {
            allPromises.push(maybePromise.catch(error => {
              this.handleError(error, methodName, namedReporter.name);
            }));
          }
        } catch (error) {
          this.handleError(error, methodName, namedReporter.name);
        }
      }
    });
    if (allPromises.length) {
      return Promise.all(allPromises);
    }
  }

  onSourceFileRead(file: SourceFile): void {
    this.broadcast('onSourceFileRead', file);
  }

  onAllSourceFilesRead(files: SourceFile[]): void {
    this.broadcast('onAllSourceFilesRead', files);
  }

  onAllMutantsMatchedWithTests(results: ReadonlyArray<MatchedMutant>): void {
    this.broadcast('onAllMutantsMatchedWithTests', results);
  }

  onMutantTested(result: MutantResult): void {
    this.broadcast('onMutantTested', result);
  }

  onAllMutantsTested(results: MutantResult[]): void {
    this.broadcast('onAllMutantsTested', results);
  }

  wrapUp(): void | Promise<void> {
    let maybePromise: void | Promise<any> = this.broadcast('wrapUp', 'wrapUp');
    if (isPromise(maybePromise)) {
      return Promise.resolve(maybePromise);
    }
  }

  private handleError(error: any, methodName: string, reporterName: string) {
    log.error(`An error occurred during '${methodName}' on reporter '${reporterName}'. Error is: ${error}`);
  }

}