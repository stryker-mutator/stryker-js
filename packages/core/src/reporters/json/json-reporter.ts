import * as path from 'path';

import fileUrl = require('file-url');

import { Logger } from '@stryker-mutator/api/logging';
import { mutationTestReportSchema, Reporter } from '@stryker-mutator/api/report';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';

import { mkdir, deleteDir, writeFile } from './json-reporter-util';

const DEFAULT_BASE_FOLDER = path.normalize('reports/mutation/json');

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

  public async generateReport(report: mutationTestReportSchema.MutationTestResult) {
    const indexFileName = path.resolve(this.baseDir, 'report.json');

    await this.cleanBaseFolder();
    await writeFile(indexFileName, JSON.stringify(report));

    this.log.info(`Your report can be found at: ${fileUrl(indexFileName)}`);
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
    await deleteDir(this.baseDir);
    await mkdir(this.baseDir);
  }
}
