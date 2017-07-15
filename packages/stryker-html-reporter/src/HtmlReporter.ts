import { Reporter, MutantResult, SourceFile, ScoreResult } from 'stryker-api/report';
import { StrykerOptions } from 'stryker-api/core';
import * as fs from 'mz/fs';
import * as path from 'path';
import * as log4js from 'log4js';
import * as util from './util';
import fileUrl = require('file-url');
import * as templates from './templates';

const log = log4js.getLogger('HtmlReporter');
const DEFAULT_BASE_FOLDER = 'reports/mutation/html';

export default class HtmlReporter implements Reporter {

  private _baseDir: string;
  private mainPromise: Promise<void>;
  private mutantResults: MutantResult[];
  private files: SourceFile[];
  private scoreResult: ScoreResult;

  constructor(private options: StrykerOptions) {
    log4js.setGlobalLogLevel(options.logLevel || 'info');
  }

  onAllSourceFilesRead(files: SourceFile[]) {
    this.files = files;
  }

  onAllMutantsTested(results: MutantResult[]) {
    this.mutantResults = results;
  }

  onScoreCalculated(score: ScoreResult) {
    this.scoreResult = score;
    this.mainPromise = this.generateReport();
  }

  wrapUp() {
    return this.mainPromise;
  }

  private generateReport() {
    return this.cleanBaseFolder()
      .then(() => this.writeCommonResources())
      .then(() => this.writeReportDirectory())
      .then(() => log.info(`Your report can be found at: ${fileUrl(path.resolve(this.baseDir, 'index.html'))}`));
  }

  private writeCommonResources() {
    return Promise.all([this.writeStrykerResources(), this.writeBootstrapAndHighlightResources()]);
  }

  private writeBootstrapAndHighlightResources() {
    const resourcesDir = path.join(__dirname, '..', 'resources');
    return util.copyFolder(resourcesDir, this.baseDir);
  }

  private writeStrykerResources() {
    const resourcesDir = path.join(__dirname, 'resources', 'stryker');
    return util.copyFolder(resourcesDir, this.baseDir);
  }

  private writeReportDirectory(scoreResult = this.scoreResult, currentDirectory = this.baseDir, depth = 0, title = 'All files'): Promise<void> {
    const fileContent = templates.directory(title, scoreResult, depth);
    return util.mkdir(currentDirectory)
      .then(_ => fs.writeFile(path.join(currentDirectory, 'index.html'), fileContent))
      .then(_ => this.writeChildren(scoreResult, currentDirectory, depth))
      .then(_ => void 0);
  }

  private writeChildren(scoreResult: ScoreResult, currentDirectory: string, depth: number) {
    return Promise.all(scoreResult.childResults.map(child =>
      child.representsFile ?
        this.writeReportFile(child, currentDirectory, depth) :
        this.writeReportDirectory(child, path.join(currentDirectory, child.name), depth + 1, child.name)));
  }


  private writeReportFile(scoreResult: ScoreResult, baseDir: string, depth: number) {
    const fileContent = templates.sourceFile(scoreResult, this.findFile(scoreResult.path), this.findMutants(scoreResult.path), depth);
    return fs.writeFile(path.join(baseDir, `${scoreResult.name}.html`), fileContent);
  }

  private findFile(filePath: string) {
    return this.files.filter(file => file.path === filePath)[0];
  }

  private findMutants(filePath: string) {
    return this.mutantResults.filter(mutant => mutant.sourceFilePath === filePath);
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
    return util.deleteDir(this.baseDir).then(() => util.mkdir(this.baseDir));
  }

}