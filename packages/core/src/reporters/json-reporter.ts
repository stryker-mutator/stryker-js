import * as path from 'path';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { mutationTestReportSchema, Reporter } from '@stryker-mutator/api/report';

import fileUrl = require('file-url');

import * as HtmlReporterUtil from './html/html-reporter-util';

const DEFAULT_BASE_FOLDER = path.normalize('reports/mutation');
const DEFAULT_INDENTION = 0;
export const RESOURCES_DIR_NAME = 'strykerResources';

export default class JsonReporter implements Reporter {
  private _baseDir!: string;
  private mainPromise: Promise<void> | undefined;

  constructor(private readonly options: StrykerOptions, private readonly log: Logger) {}

  public static readonly inject = tokens(commonTokens.options, commonTokens.logger);

  public onMutationTestReportReady(report: mutationTestReportSchema.MutationTestResult) {
    this.mainPromise = this.generateReport(report);
  }

  public wrapUp() {
    return this.mainPromise;
  }

  private async generateReport(report: mutationTestReportSchema.MutationTestResult) {
    const jsonReportFile = path.resolve(this.baseDir, 'mutation.json');
    await this.cleanBaseFolder();
    let indent = DEFAULT_INDENTION
    if (this.options.jsonReporter && this.options.jsonReporter.spacing) {
      indent = this.options.jsonReporter.spacing
    }
    await HtmlReporterUtil.writeFile(jsonReportFile, JSON.stringify(report, null, indent));
    this.log.info(`Your report can be found at: ${fileUrl(jsonReportFile)}`);
  }

  private get baseDir(): string {
    if (!this._baseDir) {
      if (this.options.jsonReporter && this.options.jsonReporter.baseDir) {
        this._baseDir = this.options.jsonReporter.baseDir;
        this.log.debug(`Using configured output folder ${this._baseDir}`);
      } else {
        this.log.debug(
          `No base folder configuration found (using configuration: jsonReporter: { baseDir: 'output/folder' }), using default ${DEFAULT_BASE_FOLDER}`
        );
        this._baseDir = DEFAULT_BASE_FOLDER;
      }
    }
    return this._baseDir;
  }

  private async cleanBaseFolder(): Promise<void> {
    await HtmlReporterUtil.deleteDir(this.baseDir);
    await HtmlReporterUtil.mkdir(this.baseDir);
  }
}
