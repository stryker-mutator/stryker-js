import * as path from 'path';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { mutationTestReportSchema, Reporter } from '@stryker-mutator/api/report';

import fileUrl = require('file-url');

import * as ReporterUtil from './reporter-util';

const INDENTION_LEVEL = 0;
export const RESOURCES_DIR_NAME = 'strykerResources';

export default class JsonReporter implements Reporter {
  private readonly _filePath: string;
  private mainPromise: Promise<void> | undefined;

  constructor(private readonly options: StrykerOptions, private readonly log: Logger) {
    this._filePath = path.resolve(this.options.jsonReporter.baseDir, this.options.jsonReporter.filename);
  }

  public static readonly inject = tokens(commonTokens.options, commonTokens.logger);

  public onMutationTestReportReady(report: mutationTestReportSchema.MutationTestResult) {
    this.mainPromise = this.generateReport(report);
  }

  public wrapUp() {
    return this.mainPromise;
  }

  private async generateReport(report: mutationTestReportSchema.MutationTestResult) {
    await ReporterUtil.writeFile(this.filePath, JSON.stringify(report, null, INDENTION_LEVEL));
    this.log.info(`Your report can be found at: ${fileUrl(this.filePath)}`);
  }

  private get filePath(): string {
    this.log.debug(`Using path ${this._filePath}`);
    return this._filePath;
  }
}
