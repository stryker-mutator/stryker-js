import * as log4js from 'log4js';
import * as path from 'path';
import * as fs from 'mz/fs';
import { StrykerOptions } from 'stryker-api/core';
import { SourceFile, MutantResult, MatchedMutant, Reporter, ScoreResult } from 'stryker-api/report';
import { cleanFolder } from '../utils/fileUtils';
import StrictReporter from './StrictReporter';

const log = log4js.getLogger('EventRecorderReporter');
const DEFAULT_BASE_FOLDER = 'reports/mutation/events';

export default class EventRecorderReporter implements StrictReporter {

  private allWork: Promise<any>[] = [];
  private createBaseFolderTask: Promise<any>;
  private _baseFolder: string;
  private index = 0;

  constructor(private options: StrykerOptions) {
    this.createBaseFolderTask = cleanFolder(this.baseFolder);
  }

  private get baseFolder() {
    if (!this._baseFolder) {
      if (this.options['eventReporter'] && this.options['eventReporter']['baseDir']) {
        this._baseFolder = this.options['eventReporter']['baseDir'];
        log.debug(`Using configured output folder ${this._baseFolder}`);
      } else {
        log.debug(`No base folder configuration found (using configuration: eventReporter: { baseDir: 'output/folder' }), using default ${DEFAULT_BASE_FOLDER}`);
        this._baseFolder = DEFAULT_BASE_FOLDER;
      }
    }
    return this._baseFolder;
  }

  private writeToFile(methodName: keyof Reporter, data: any) {
    let filename = path.join(this.baseFolder, `${this.format(this.index++)}-${methodName}.json`);
    log.debug(`Writing event ${methodName} to file ${filename}`);
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

  work(eventName: keyof Reporter, data: any) {
    this.allWork.push(this.createBaseFolderTask.then(() => this.writeToFile(eventName, data)));
  }

  onSourceFileRead(file: SourceFile): void {
    this.work('onSourceFileRead', file);
  }

  onAllSourceFilesRead(files: SourceFile[]): void {
    this.work('onAllSourceFilesRead', files);
  }

  onAllMutantsMatchedWithTests(results: ReadonlyArray<MatchedMutant>): void {
    this.work('onAllMutantsMatchedWithTests', results);
  }

  onMutantTested(result: MutantResult): void {
    this.work('onMutantTested', result);
  }

  onScoreCalculated(score: ScoreResult): void {
    this.work('onScoreCalculated', score);
  }

  onAllMutantsTested(results: MutantResult[]): void {
    this.work('onAllMutantsTested', results);
  }

  async wrapUp(): Promise<any> {
    await this.createBaseFolderTask;
    return Promise.all(this.allWork);
  }
}
