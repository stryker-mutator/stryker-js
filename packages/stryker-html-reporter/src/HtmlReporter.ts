import * as log4js from 'log4js';
import fileUrl = require('file-url');
import * as path from 'path';
import { Config } from 'stryker-api/config';
import { Reporter, MutantResult, SourceFile, ScoreResult } from 'stryker-api/report';
import * as util from './util';
import * as templates from './templates';
import Breadcrumb from './Breadcrumb';

const log = log4js.getLogger('HtmlReporter');
const DEFAULT_BASE_FOLDER = path.normalize('reports/mutation/html');
export const RESOURCES_DIR_NAME = 'strykerResources';

export default class HtmlReporter implements Reporter {

  private _baseDir: string;
  private mainPromise: Promise<void>;
  private mutantResults: MutantResult[];
  private files: SourceFile[];
  private scoreResult: ScoreResult;

  constructor(private options: Config) {
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
      .then(location => log.info(`Your report can be found at: ${fileUrl(location)}`));
  }

  private writeCommonResources() {
    return Promise.all([this.copyStrykerResources(), this.copyBootstrapAndHighlightResources()]);
  }

  private copyBootstrapAndHighlightResources() {
    const resourcesDir = path.join(__dirname, '..', 'resources');
    return util.copyFolder(resourcesDir, this.resourcesDir);
  }

  private copyStrykerResources() {
    const resourcesDir = path.join(__dirname, 'resources', 'stryker');
    return util.copyFolder(resourcesDir, this.resourcesDir);
  }

  private writeReportDirectory(scoreResult = this.scoreResult, currentDirectory = this.baseDir, breadcrumb = Breadcrumb.start)
    : Promise<string> {
    const fileContent = templates.directory(scoreResult, breadcrumb, this.options.thresholds);
    const location = path.join(currentDirectory, 'index.html');
    return util.mkdir(currentDirectory)
      .then(_ => util.writeFile(location, fileContent))
      .then(_ => this.writeChildren(scoreResult, currentDirectory, breadcrumb))
      .then(_ => location);
  }

  private writeChildren(scoreResult: ScoreResult, currentDirectory: string, breadcrumb: Breadcrumb) {
    return Promise.all(scoreResult.childResults.map(child => {
      if (child.representsFile) {
        return this.writeReportFile(child, currentDirectory, breadcrumb.add(child.name, util.countPathSep(child.name)));
      } else {
        return this.writeReportDirectory(child, path.join(currentDirectory, child.name), breadcrumb.add(child.name,  util.countPathSep(child.name) + 1))
          .then(_ => void 0);
      }
    }));
  }

  private writeReportFile(scoreResult: ScoreResult, baseDir: string, breadcrumb: Breadcrumb) {
    if (scoreResult.representsFile) {
      const fileContent = templates.sourceFile(scoreResult, this.findFile(scoreResult.path), this.findMutants(scoreResult.path), breadcrumb, this.options.thresholds);
      return util.writeFile(path.join(baseDir, `${scoreResult.name}.html`), fileContent);
    } else {
      return Promise.resolve(); // not a report file
    }
  }

  private findFile(filePath: string) {
    return this.files.find(file => file.path === filePath);
  }

  private findMutants(filePath: string) {
    return this.mutantResults.filter(mutant => mutant.sourceFilePath === filePath);
  }

  private get resourcesDir() {
    return path.join(this.baseDir, RESOURCES_DIR_NAME);
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