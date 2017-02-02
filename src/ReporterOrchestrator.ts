import { StrykerOptions } from 'stryker-api/core';
import { ReporterFactory } from 'stryker-api/report';
import ClearTextReporter from './reporters/ClearTextReporter';
import ProgressReporter from './reporters/ProgressReporter';
import ProgressAppendOnlyReporter from './reporters/ProgressAppendOnlyReporter';
import DotsReporter from './reporters/DotsReporter';
import EventRecorderReporter from './reporters/EventRecorderReporter';
import BroadcastReporter, { NamedReporter } from './reporters/BroadcastReporter';
import StrictReporter from './reporters/StrictReporter';
import * as log4js from 'log4js';

const log = log4js.getLogger('ReporterOrchestrator');

function registerDefaultReporters() {
  ReporterFactory.instance().register('progress-append-only', ProgressAppendOnlyReporter);
  ReporterFactory.instance().register('progress', ProgressReporter);
  ReporterFactory.instance().register('dots', DotsReporter);
  ReporterFactory.instance().register('clear-text', ClearTextReporter);
  ReporterFactory.instance().register('event-recorder', EventRecorderReporter);
}
registerDefaultReporters();

export default class ReporterOrchestrator {

  constructor(private options: StrykerOptions) {
  }

  public createBroadcastReporter(): StrictReporter {
    let reporters: NamedReporter[] = [];
    let reporterOption = this.options.reporter;
    if (reporterOption) {
      if (Array.isArray(reporterOption)) {
        reporterOption.forEach(reporterName => reporters.push(this.createReporter(reporterName)));
      } else {
        reporters.push(this.createReporter(reporterOption));
      }
    } else {
      log.warn(`No reporter configured. Please configure one or more reporters in the (for example: reporter: 'progress')`);
      this.logPossibleReporters();
    }
    return new BroadcastReporter(reporters) as any;
  }

  private createReporter(name: string) {
    if (name === 'progress' && !(process.stdout as any)['isTTY']) {
      log.info('Detected that current console does not support the "progress" reporter, downgrading to "progress-append-only" reporter');
      return { name: 'progress-append-only', reporter: ReporterFactory.instance().create('progress-append-only', this.options) };
    } else {
      return { name, reporter: ReporterFactory.instance().create(name, this.options) };
    }
  }

  private logPossibleReporters() {
    let possibleReportersCsv = '';
    ReporterFactory.instance().knownNames().forEach(name => {
      if (possibleReportersCsv.length) {
        possibleReportersCsv += ', ';
      }
      possibleReportersCsv += name;
    });
    log.warn(`Possible reporters: ${possibleReportersCsv}`);
  }

}