import { Reporter, MutantResult, SourceFile } from 'stryker-api/report';
import { StrykerOptions } from 'stryker-api/core';
import SourceFileTreeNode from './SourceFileTreeNode';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import * as log4js from 'log4js';
import * as handlebars from 'handlebars';
import * as util from './util';
import fileUrl = require('file-url');

const log = log4js.getLogger('HtmlReporter');
const DEFAULT_BASE_FOLDER = 'reports/mutation/html';

export default class HtmlReporter implements Reporter {

  private rootNode: SourceFileTreeNode;
  private _baseDir: string;
  private templates: { node: HandlebarsTemplateDelegate, header: HandlebarsTemplateDelegate, footer: HandlebarsTemplateDelegate };
  private mainPromise: Promise<void>;

  constructor(private options: StrykerOptions) {
    this.rootNode = new SourceFileTreeNode('/');
    log4js.setGlobalLogLevel(options.logLevel || 'info');
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
    return util.copyFolder(resourcesDir, this.baseDir);
  }

  private writeStrykerResources() {
    let resourcesDir = path.join(__dirname, 'resources', 'stryker');
    return util.copyFolder(resourcesDir, this.baseDir);
  }

  private writeCommonResources() {
    return Promise.all([this.writeStrykerResources(), this.writeBootstrapAndHighlightResources()]);
  }

  private writeReport() {
    this.rootNode.calculateModel('');
    this.rootNode.writeReportNodeRecursive(this.baseDir);
    log.info(`Your report can be found at: ${fileUrl(path.resolve(this.baseDir, 'index.html'))}`);
  }


  private get baseDir() {
    if (!this._baseDir) {
      if (this.options['htmlReporter'] && this.options['htmlReporter']['baseDir']) {
        this._baseDir = this.options['htmlReporter']['baseDir'];
        log.debug(`Using configured output folder ${this._baseDir}`);
      } else {
        log.debug(`No base folder configuration found (using configuration: htmlReporter: { baseDir: 'output/folder' }), using default ${DEFAULT_BASE_FOLDER}`);
        this._baseDir = DEFAULT_BASE_FOLDER;
      }
    }
    return this._baseDir;
  }

  private cleanBaseFolder(): Promise<void> {
    return util.deleteDir(this.baseDir).then(() => util.mkdirRecursive(this.baseDir));
  }

  wrapUp() {
    return this.mainPromise;
  }

}