import { Reporter } from 'stryker-api/report';
import { StrykerOptions } from 'stryker-api/core';
import { ALL_EVENT_METHOD_NAMES } from './BroadcastReporter';
import * as fileUtils from '../utils/fileUtils';
import * as log4js from 'log4js';
import * as path from 'path';

const log = log4js.getLogger('EventRecorderReporter');
const DEFAULT_BASE_FOLDER = 'reports/mutation/events';

export default class EventRecorderReporter implements Reporter {

  private allWork: Promise<any>[] = [];
  private createBaseFolderTask: Promise<any>;
  private _baseFolder: string;

  constructor(private options: StrykerOptions) {
    let index = 0;
    this.createBaseFolderTask = fileUtils.cleanFolder(this.baseFolder);
    ALL_EVENT_METHOD_NAMES.forEach(method => {
      (<any>this)[method] = (data: any) => {
        this.allWork.push(this.createBaseFolderTask.then(() => this.writeToFile(index++, method, data)));
      };
    });
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


  private writeToFile(index: number, methodName: string, data: any) {
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

  async wrapUp(): Promise<any> {
    await this.createBaseFolderTask;

    return Promise.all(this.allWork);
  }
}
