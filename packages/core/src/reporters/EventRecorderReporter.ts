import * as path from 'path';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { SourceFile, MutantResult, MatchedMutant, Reporter, ScoreResult, mutationTestReportSchema } from '@stryker-mutator/api/report';
import { cleanFolder } from '../utils/fileUtils';
import StrictReporter from './StrictReporter';
import { fsAsPromised } from '@stryker-mutator/util';
import { COMMON_TOKENS, tokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';

const defaultBaseFolder = 'reports/mutation/events';

export default class EventRecorderReporter implements StrictReporter {
  public static readonly inject = tokens(COMMON_TOKENS.logger, COMMON_TOKENS.options);

  private readonly allWork: Promise<void>[] = [];
  private readonly createBaseFolderTask: Promise<any>;
  private innerBaseFolder: string;
  private index = 0;

  constructor(private readonly log: Logger, private readonly options: StrykerOptions) {
    this.createBaseFolderTask = cleanFolder(this.baseFolder);
  }

  private get baseFolder() {
    if (!this.innerBaseFolder) {
      if (this.options.eventReporter && this.options.eventReporter.baseDir) {
        this.innerBaseFolder = this.options.eventReporter.baseDir;
        this.log.debug(`Using configured output folder ${this.innerBaseFolder}`);
      } else {
        this.log.debug(`No base folder configuration found (using configuration: eventReporter: { baseDir: 'output/folder' }), using default ${defaultBaseFolder}`);
        this.innerBaseFolder = defaultBaseFolder;
      }
    }
    return this.innerBaseFolder;
  }

  private writeToFile(methodName: keyof Reporter, data: any) {
    const filename = path.join(this.baseFolder, `${this.format(this.index++)}-${methodName}.json`);
    this.log.debug(`Writing event ${methodName} to file ${filename}`);
    return fsAsPromised.writeFile(filename, JSON.stringify(data), { encoding: 'utf8' });
  }

  private format(input: number) {
    let str = input.toString();
    for (let i = 10000; i > 1; i = i / 10) {
      if (i > input) {
        str = '0' + str;
      }
    }
    return str;
  }

  private work(eventName: keyof Reporter, data: any) {
    this.allWork.push(this.createBaseFolderTask.then(() => this.writeToFile(eventName, data)));
  }

  public onSourceFileRead(file: SourceFile): void {
    this.work('onSourceFileRead', file);
  }

  public onAllSourceFilesRead(files: SourceFile[]): void {
    this.work('onAllSourceFilesRead', files);
  }

  public onAllMutantsMatchedWithTests(results: ReadonlyArray<MatchedMutant>): void {
    this.work('onAllMutantsMatchedWithTests', results);
  }

  public onMutantTested(result: MutantResult): void {
    this.work('onMutantTested', result);
  }

  public onMutationTestReportReady(report: mutationTestReportSchema.MutationTestResult): void {
    this.work('onMutationTestReportReady', report);
  }

  public onScoreCalculated(score: ScoreResult): void {
    this.work('onScoreCalculated', score);
  }

  public onAllMutantsTested(results: MutantResult[]): void {
    this.work('onAllMutantsTested', results);
  }

  public async wrapUp(): Promise<any> {
    await this.createBaseFolderTask;
    return Promise.all(this.allWork);
  }
}
