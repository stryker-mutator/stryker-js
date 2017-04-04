import * as log4js from 'log4js';
import * as path from 'path';
import { StrykerOptions } from 'stryker-api/core';
import { SourceFile, MutantResult, MatchedMutant, Reporter } from 'stryker-api/report';
import * as fileUtils from '../utils/fileUtils';
import StrictReporter from './StrictReporter';

const log = log4js.getLogger('EventRecorderReporter');
const DEFAULT_BASE_FOLDER = 'reports/mutation/events';

export default class EventRecorderReporter implements StrictReporter {

  private allWork: Promise<any>[] = [];
  private createBaseFolderTask: Promise<any>;
  private _baseFolder: string;
  private index = 0;

  constructor(private options: StrykerOptions) {
    this.createBaseFolderTask = fileUtils.cleanFolder(this.baseFolder);
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


  private writeToFile(index: number, methodName: keyof Reporter, data: any) {
    let filename = path.join(this.baseFolder, `${this.format(index)}-${methodName}.json`);
    log.debug(`Writing event ${methodName} to file ${filename}`);
    return fileUtils.writeFile(filename, JSON.stringify(data));
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

  onSourceFileRead(file: SourceFile): void {
    this.allWork.push(this.createBaseFolderTask
      .then(() => this.writeToFile(this.index++, 'onSourceFileRead', file)));
  }

  onAllSourceFilesRead(files: SourceFile[]): void {
    this.allWork.push(this.createBaseFolderTask.then(() => this.writeToFile(this.index++, 'onAllSourceFilesRead', files)));
  }

  onAllMutantsMatchedWithTests(results: ReadonlyArray<MatchedMutant>): void {
    this.allWork.push(this.createBaseFolderTask.then(() => this.writeToFile(this.index++, 'onAllMutantsMatchedWithTests', results)));
  }

  onMutantTested(result: MutantResult): void {
    this.allWork.push(this.createBaseFolderTask.then(() => this.writeToFile(this.index++, 'onMutantTested', result)));
  }

  onAllMutantsTested(results: MutantResult[]): void {
    this.allWork.push(this.createBaseFolderTask.then(() => this.writeToFile(this.index++, 'onAllMutantsTested', results)));
  }

  async wrapUp(): Promise<any> {
    await this.createBaseFolderTask;
    return Promise.all(this.allWork);
  }
}
