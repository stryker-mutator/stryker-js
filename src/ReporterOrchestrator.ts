import {StrykerOptions} from 'stryker-api/core';
import {Reporter, ReporterFactory} from 'stryker-api/report';
import ClearTextReporter from './reporters/ClearTextReporter';
import ProgressReporter from './reporters/ProgressReporter';
import EventRecorderReporter from './reporters/EventRecorderReporter';
import BroadcastReporter, {NamedReporter} from './reporters/BroadcastReporter';
import * as log4js from 'log4js';

const log = log4js.getLogger('ReporterOrchestrator');


export default class ReporterOrchestrator {

  constructor(private options: StrykerOptions) {
    this.registerDefaultReporters();
  }

  public createBroadcastReporter(): Reporter {
    let reporters: NamedReporter[] = [];
    let reporterOption = this.options.reporter;
    if (reporterOption) {
      if (Array.isArray(reporterOption)) {
        reporterOption.forEach(reporterName => reporters.push({ name: reporterName, reporter: ReporterFactory.instance().create(reporterName, this.options) }));
      } else {
        reporters.push({ name: reporterOption, reporter: ReporterFactory.instance().create(reporterOption, this.options) });
      }
    } else {
      log.warn(`No reporter configured. Please configure one or more reporters in the (for example: reporter: 'progress')`);
      this.logPossibleReporters();
    }
    return new BroadcastReporter(reporters);
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

  private registerDefaultReporters() {
    ReporterFactory.instance().register('progress', ProgressReporter);
    ReporterFactory.instance().register('clear-text', ClearTextReporter);
    ReporterFactory.instance().register('event-recorder', EventRecorderReporter); 
 }
}