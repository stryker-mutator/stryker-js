import path from 'path';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { mutationTestReportSchema, Reporter } from '@stryker-mutator/api/report';

import fileUrl from 'file-url';

import * as ReporterUtil from './reporter-util';

const INDENTION_LEVEL = 0;
export const RESOURCES_DIR_NAME = 'strykerResources';

export class JsonReporter implements Reporter {
  private mainPromise: Promise<void> | undefined;

  constructor(private readonly options: StrykerOptions, private readonly log: Logger) {}

  public static readonly inject = tokens(commonTokens.options, commonTokens.logger);

  public onMutationTestReportReady(report: mutationTestReportSchema.MutationTestResult): void {
    this.mainPromise = this.generateReport(report);
  }

  public wrapUp(): Promise<void> | undefined {
    return this.mainPromise;
  }

  private async generateReport(report: mutationTestReportSchema.MutationTestResult) {
    const filePath = path.normalize(this.options.jsonReporter.fileName);
    this.log.debug(`Using relative path ${filePath}`);
    await ReporterUtil.writeFile(path.resolve(filePath), JSON.stringify(report, null, INDENTION_LEVEL));
    this.log.info(`Your report can be found at: ${fileUrl(filePath)}`);
  }
}
