import path from 'path';

import fileUrl from 'file-url';
import { schema, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';

import { reporterUtil } from '../reporter-util.js';

import { reportTemplate as reportTemplate } from './report-template.js';

const DEFAULT_BASE_FOLDER = path.normalize('reports/mutation/html');
export const RESOURCES_DIR_NAME = 'strykerResources';

export class HtmlReporter implements Reporter {
  private _baseDir!: string;
  private mainPromise: Promise<void> | undefined;

  constructor(private readonly options: StrykerOptions, private readonly log: Logger) {}

  public static readonly inject = tokens(commonTokens.options, commonTokens.logger);

  public onMutationTestReportReady(report: schema.MutationTestResult): void {
    this.mainPromise = this.generateReport(report);
  }

  public wrapUp(): Promise<void> | undefined {
    return this.mainPromise;
  }

  private async generateReport(report: schema.MutationTestResult) {
    const indexFileName = path.resolve(this.baseDir, 'index.html');
    const singleFile = await reportTemplate(report);
    await this.cleanBaseFolder();
    await reporterUtil.writeFile(path.resolve(this.baseDir, 'index.html'), singleFile);
    this.log.info(`Your report can be found at: ${fileUrl(indexFileName)}`);
  }

  private get baseDir(): string {
    if (!this._baseDir) {
      if (this.options.htmlReporter?.baseDir) {
        this._baseDir = this.options.htmlReporter.baseDir;
        this.log.debug(`Using configured output folder ${this._baseDir}`);
      } else {
        this.log.debug(
          `No base folder configuration found (using configuration: htmlReporter: { baseDir: 'output/folder' }), using default ${DEFAULT_BASE_FOLDER}`
        );
        this._baseDir = DEFAULT_BASE_FOLDER;
      }
    }
    return this._baseDir;
  }

  private async cleanBaseFolder(): Promise<void> {
    await reporterUtil.deleteDir(this.baseDir);
    await reporterUtil.mkdir(this.baseDir);
  }
}
