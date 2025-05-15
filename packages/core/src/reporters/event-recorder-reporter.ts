import path from 'path';
import { promises as fsPromises } from 'fs';

import {
  MutantResult,
  schema,
  StrykerOptions,
} from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import {
  DryRunCompletedEvent,
  MutationTestingPlanReadyEvent,
  Reporter,
} from '@stryker-mutator/api/report';

import { fileUtils } from '../utils/file-utils.js';

import { StrictReporter } from './strict-reporter.js';

export class EventRecorderReporter implements StrictReporter {
  public static readonly inject = tokens(
    commonTokens.logger,
    commonTokens.options,
  );

  private readonly allWork: Array<Promise<void>> = [];
  private readonly createBaseFolderTask: Promise<string | undefined>;
  private index = 0;

  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
  ) {
    this.createBaseFolderTask = fileUtils.cleanDir(
      this.options.eventReporter.baseDir,
    );
  }

  private writeToFile(methodName: keyof Reporter, data: any) {
    const filename = path.join(
      this.options.eventReporter.baseDir,
      `${this.format(this.index++)}-${methodName}.json`,
    );
    this.log.debug(`Writing event ${methodName} to file ${filename}`);
    return fsPromises.writeFile(filename, JSON.stringify(data), {
      encoding: 'utf8',
    });
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
    this.allWork.push(
      this.createBaseFolderTask.then(() => this.writeToFile(eventName, data)),
    );
  }

  public onDryRunCompleted(event: DryRunCompletedEvent): void {
    this.work('onDryRunCompleted', event);
  }
  public onMutationTestingPlanReady(
    event: MutationTestingPlanReadyEvent,
  ): void {
    this.work('onMutationTestingPlanReady', event);
  }

  public onMutantTested(result: MutantResult): void {
    this.work('onMutantTested', result);
  }

  public onMutationTestReportReady(report: schema.MutationTestResult): void {
    this.work('onMutationTestReportReady', report);
  }

  public async wrapUp(): Promise<void> {
    await this.createBaseFolderTask;
    await Promise.all(this.allWork);
  }
}
