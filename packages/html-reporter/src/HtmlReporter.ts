import { Logger } from '@stryker-mutator/api/logging';
import * as path from 'path';
import { Reporter, mutationTestReportSchema } from '@stryker-mutator/api/report';
import * as util from './util';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { tokens, COMMON_TOKENS } from '@stryker-mutator/api/plugin';
import fileUrl = require('file-url');
import { bindMutationTestReport } from './templates/bindMutationTestReport';

const defaultBaseFolder = path.normalize('reports/mutation/html');
export const RESOURCES_DIR_NAME = 'strykerResources';

export default class HtmlReporter implements Reporter {
  private innerBaseDir!: string;
  private mainPromise: Promise<void> | undefined;

  constructor(private readonly options: StrykerOptions, private readonly log: Logger) {
  }

  public static readonly inject = tokens(COMMON_TOKENS.options, COMMON_TOKENS.logger);

  public onMutationTestReportReady(report: mutationTestReportSchema.MutationTestResult) {
    this.mainPromise = this.generateReport(report);
  }

  public wrapUp() {
    return this.mainPromise;
  }

  private async generateReport(report: mutationTestReportSchema.MutationTestResult) {
    const indexFileName = path.resolve(this.baseDir, 'index.html');
    await this.cleanBaseFolder();
    await Promise.all([
      util.copyFile(require.resolve('mutation-testing-elements/dist/mutation-test-elements.js'), path.resolve(this.baseDir, 'mutation-test-elements.js')),
      util.copyFile(path.resolve(__dirname, 'templates', 'stryker-80x80.png'), path.resolve(this.baseDir, 'stryker-80x80.png')),
      util.copyFile(path.resolve(__dirname, 'templates', 'index.html'), path.resolve(this.baseDir, 'index.html')),
      util.writeFile(path.resolve(this.baseDir, 'bind-mutation-test-report.js'), bindMutationTestReport(report))
    ]);
    this.log.info(`Your report can be found at: ${fileUrl(indexFileName)}`);
  }

  private get baseDir(): string {
    if (!this.innerBaseDir) {
      if (this.options.htmlReporter && this.options.htmlReporter.baseDir) {
        this.innerBaseDir = this.options.htmlReporter.baseDir;
        this.log.debug(`Using configured output folder ${this.innerBaseDir}`);
      } else {
        this.log.debug(`No base folder configuration found (using configuration: htmlReporter: { baseDir: 'output/folder' }), using default ${defaultBaseFolder}`);
        this.innerBaseDir = defaultBaseFolder;
      }
    }
    return this.innerBaseDir;
  }

  private async cleanBaseFolder(): Promise<void> {
    await util.DELETE_DIR(this.baseDir);
    await util.MK_DIR(this.baseDir);
  }

}
