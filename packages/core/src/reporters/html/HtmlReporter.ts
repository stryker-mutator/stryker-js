import * as path from 'path';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { mutationTestReportSchema, Reporter } from '@stryker-mutator/api/report';

import fileUrl = require('file-url');

import { bindMutationTestReport } from './templates/bindMutationTestReport';
import * as HtmlReporterUtil from './HtmlReporterUtil';
import { singleFileTemplate } from './single-file-template/single-file-template';

const DEFAULT_BASE_FOLDER = path.normalize('reports/mutation/html');
export const RESOURCES_DIR_NAME = 'strykerResources';

export default class HtmlReporter implements Reporter {
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
    const indexFileName = path.resolve(this.baseDir, 'index.html');
    const singleFile = await singleFileTemplate(report);

    await this.cleanBaseFolder();
    await Promise.all([
      HtmlReporterUtil.copyFile(
        require.resolve('mutation-testing-elements/dist/mutation-test-elements.js'),
        path.resolve(this.baseDir, 'mutation-test-elements.js')
      ),
      HtmlReporterUtil.writeFile(path.resolve(this.baseDir, 'singleFile.html'), singleFile),
      HtmlReporterUtil.copyFile(path.resolve(__dirname, 'templates', 'stryker-80x80.png'), path.resolve(this.baseDir, 'stryker-80x80.png')),
      HtmlReporterUtil.copyFile(path.resolve(__dirname, 'templates', 'index.html'), path.resolve(this.baseDir, 'index.html')),
      HtmlReporterUtil.writeFile(path.resolve(this.baseDir, 'bind-mutation-test-report.js'), bindMutationTestReport(report)),
    ]);
    this.log.info(`Your report can be found at: ${fileUrl(indexFileName)}`);
  }

  private get baseDir(): string {
    if (!this._baseDir) {
      if (this.options.htmlReporter && this.options.htmlReporter.baseDir) {
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
    await HtmlReporterUtil.deleteDir(this.baseDir);
    await HtmlReporterUtil.mkdir(this.baseDir);
  }
}
