import { Reporter, MutantResult, SourceFile } from 'stryker-api/report';
import { StrykerOptions } from 'stryker-api/core';
import SourceFileTreeNode from './SourceFileTreeNode';
import * as fs from 'fs';
import * as path from 'path';
import * as log4js from 'log4js';
import * as handlebars from 'handlebars';
import * as util from './util';

const log = log4js.getLogger('HtmlReporter');
const DEFAULT_BASE_FOLDER = 'reports/mutation/html';

export default class HtmlReporter implements Reporter {

  private rootNode: SourceFileTreeNode;
  private _baseFolder: string;
  private templates: { node: HandlebarsTemplateDelegate, header: HandlebarsTemplateDelegate, footer: HandlebarsTemplateDelegate };
  private mainPromise: Promise<void>;

  constructor(private options: StrykerOptions) {
    this.rootNode = new SourceFileTreeNode('/');
    log4js.setGlobalLogLevel(options.logLevel);
  }

  onAllSourceFilesRead(files: SourceFile[]) {
    files.forEach(f => this.rootNode.addSourceFile(f));
  }

  onAllMutantsTested(results: MutantResult[]) {
    results.forEach(r => this.rootNode.addMutantResult(r));
    this.generateReport();
  }

  private generateReport() {
    this.rootNode.normalizeNames();
    this.mainPromise = this.cleanBaseFolder().then(() => this.writeCommonResources()).then(() => {
      this.writeReport();
    });
  }

  private writeBootstrapAndHighlightResources() {
    let resourcesDir = path.join(__dirname, '..', 'resources');
    return util.copyFolder(resourcesDir, this.baseFolder);
  }

  private writeStrykerResources() {
    let resourcesDir = path.join(__dirname, 'resources', 'stryker');
    return util.copyFolder(resourcesDir, this.baseFolder);
  }

  private writeCommonResources() {
    return Promise.all([this.writeStrykerResources(), this.writeBootstrapAndHighlightResources()]);
  }

  private writeReport() {
    this.rootNode.calculateModel('');
    this.rootNode.writeReportNodeRecursive(this.baseFolder);
  }


  private get baseFolder() {
    if (!this._baseFolder) {
      if (this.options['htmlReporter'] && this.options['htmlReporter']['baseDir']) {
        this._baseFolder = this.options['htmlReporter']['baseDir'];
        log.debug(`Using configured output folder ${this._baseFolder}`);
      } else {
        log.debug(`No base folder configuration found (using configuration: htmlReporter: { baseDir: 'output/folder' }), using default ${DEFAULT_BASE_FOLDER}`);
        this._baseFolder = DEFAULT_BASE_FOLDER;
      }
    }
    return this._baseFolder;
  }

  private cleanBaseFolder(): Promise<void> {
    return util.deleteDir(this.baseFolder).then(() => util.mkdirRecursive(this.baseFolder));
  }

  wrapUp() {
    return this.mainPromise;
  }

}