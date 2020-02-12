import * as path from 'path';
import { promises as fs } from 'fs';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { MatchedMutant, MutantResult, mutationTestReportSchema, Reporter, ScoreResult, SourceFile } from '@stryker-mutator/api/report';

import { cleanFolder } from '../utils/fileUtils';

import StrictReporter from './StrictReporter';

const DEFAULT_BASE_FOLDER = 'reports/mutation/events';

export default class EventRecorderReporter implements StrictReporter {
  public static readonly inject = tokens(commonTokens.logger, commonTokens.options);

  private readonly allWork: Array<Promise<void>> = [];
  private readonly createBaseFolderTask: Promise<any>;
  private _baseFolder: string;
  private index = 0;

  constructor(private readonly log: Logger, private readonly options: StrykerOptions) {
    this.createBaseFolderTask = cleanFolder(this.baseFolder);
  }

  private get baseFolder() {
    if (!this._baseFolder) {
      if (this.options.eventReporter && this.options.eventReporter.baseDir) {
        this._baseFolder = this.options.eventReporter.baseDir;
        this.log.debug(`Using configured output folder ${this._baseFolder}`);
      } else {
        this.log.debug(
          `No base folder configuration found (using configuration: eventReporter: { baseDir: 'output/folder' }), using default ${DEFAULT_BASE_FOLDER}`
        );
        this._baseFolder = DEFAULT_BASE_FOLDER;
      }
    }
    return this._baseFolder;
  }

  private writeToFile(methodName: keyof Reporter, data: any) {
    const filename = path.join(this.baseFolder, `${this.format(this.index++)}-${methodName}.json`);
    this.log.debug(`Writing event ${methodName} to file ${filename}`);
    return fs.writeFile(filename, JSON.stringify(data), { encoding: 'utf8' });
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

  public onAllMutantsMatchedWithTests(results: readonly MatchedMutant[]): void {
    this.work('onAllMutantsMatchedWithTests', results);
  }

  public onMutantTested(result: MutantResult): void {
    this.work('onMutantTested', result);
  }

  public onMutationTestReportReady(report: mutationTestReportSchema.MutationTestResult): void {
    this.work('onMutationTestReportReady', report);
  }

  public onAllMutantsTested(results: MutantResult[]): void {
    this.work('onAllMutantsTested', results);
  }

  public async wrapUp(): Promise<any> {
    await this.createBaseFolderTask;
    return Promise.all(this.allWork);
  }
}
