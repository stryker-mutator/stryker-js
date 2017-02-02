import * as log4js from 'log4js';
import { Reporter } from 'stryker-api/report';
import { isPromise } from '../utils/objectUtils';

const log = log4js.getLogger('BroadcastReporter');

export interface NamedReporter {
  name: string;
  reporter: Reporter;
}

export const ALL_EVENT_METHOD_NAMES = ['onSourceFileRead', 'onAllSourceFilesRead', 'onAllMutantsMatchedWithTests', 'onMutantTested', 'onAllMutantsTested', 'wrapUp'];

export default class BroadcastReporter implements Reporter {

   constructor(private reporters: NamedReporter[]) {
    ALL_EVENT_METHOD_NAMES.concat('wrapUp').forEach(method => {
      (<any>this)[method] = (arg: any) => {
        return this.broadcast(method, arg);
      };
    });
   }

  private broadcast(methodName: string, eventArgs?: any): Promise<any> | void {
    let allPromises: Promise<any>[] = [];
    this.reporters.forEach(namedReporter => {
      let reporter = <any>namedReporter.reporter;
      if (reporter[methodName] && typeof reporter[methodName] === 'function') {
        try {
          let maybePromise: void | Promise<any> = reporter[methodName](eventArgs);
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

  private handleError(error: any, methodName: string, reporterName: string) {
    log.error(`An error occurred during '${methodName}' on reporter '${reporterName}'. Error is: ${error}`);
  }

}