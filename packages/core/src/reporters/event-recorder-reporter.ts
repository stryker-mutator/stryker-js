import path from 'path';
import { promises as fsPromises } from 'fs';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { MatchedMutant, MutantResult, mutationTestReportSchema, Reporter, SourceFile } from '@stryker-mutator/api/report';

import { cleanFolder } from '../utils/file-utils';

import { StrictReporter } from './strict-reporter';

export class EventRecorderReporter implements StrictReporter {
  public static readonly inject = tokens(commonTokens.logger, commonTokens.options);

  private readonly allWork: Array<Promise<void>> = [];
  private readonly createBaseFolderTask: Promise<string | undefined>;
  private index = 0;

  constructor(private readonly log: Logger, private readonly options: StrykerOptions) {
    this.createBaseFolderTask = cleanFolder(this.options.eventReporter.baseDir);
  }

  private writeToFile(methodName: keyof Reporter, data: any) {
    const filename = path.join(this.options.eventReporter.baseDir, `${this.format(this.index++)}-${methodName}.json`);
    this.log.debug(`Writing event ${methodName} to file ${filename}`);
    return fsPromises.writeFile(filename, JSON.stringify(data), { encoding: 'utf8' });
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

  public async wrapUp(): Promise<void[]> {
    await this.createBaseFolderTask;
    return Promise.all(this.allWork);
  }
}
