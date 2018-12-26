import fileUrl = require('file-url');
import * as path from 'path';
import { Config } from 'stryker-api/config';
import { getLogger } from 'stryker-api/logging';
import { MutantResult, Reporter, ScoreResult, SourceFile } from 'stryker-api/report';
import Breadcrumb from './Breadcrumb';
import * as templates from './templates';
import * as util from './util';

const DEFAULT_BASE_FOLDER = path.normalize('reports/mutation/html');
export const RESOURCES_DIR_NAME = 'strykerResources';

export default class HtmlReporter implements Reporter {

  private get baseDir() {
    if (!this._baseDir) {
      if (this.options.htmlReporter && this.options.htmlReporter.baseDir) {
        this._baseDir = this.options.htmlReporter.baseDir;
        this.log.debug(`Using configured output folder ${this._baseDir}`);
      } else {
        this.log.debug(`No base folder configuration found (using configuration: htmlReporter: { baseDir: 'output/folder' }), using default ${DEFAULT_BASE_FOLDER}`);
        this._baseDir = DEFAULT_BASE_FOLDER;
      }
    }

    return this._baseDir;
  }

  private get resourcesDir() {
    return path.join(this.baseDir, RESOURCES_DIR_NAME);
  }
  private _baseDir: string;
  private files: SourceFile[];
  private readonly log = getLogger(HtmlReporter.name);
  private mainPromise: Promise<void>;
  private mutantResults: MutantResult[];
  private scoreResult: ScoreResult;

  constructor(private readonly options: Config) {
  }

  public onAllMutantsTested(results: MutantResult[]) {
    this.mutantResults = results;
  }

  public onAllSourceFilesRead(files: SourceFile[]) {
    this.files = files;
  }

  public onScoreCalculated(score: ScoreResult) {
    this.scoreResult = score;
    this.mainPromise = this.generateReport();
  }

  public wrapUp() {
    return this.mainPromise;
  }

  private cleanBaseFolder(): Promise<void> {
    return util.deleteDir(this.baseDir).then(() => util.mkdir(this.baseDir));
  }

  private copyBootstrapAndHighlightResources() {
    const resourcesDir = path.join(__dirname, '..', 'resources');

    return util.copyFolder(resourcesDir, this.resourcesDir);
  }

  private copyStrykerResources() {
    const resourcesDir = path.join(__dirname, 'resources', 'stryker');

    return util.copyFolder(resourcesDir, this.resourcesDir);
  }

  private findFile(filePath: string) {
    return this.files.find(file => file.path === filePath);
  }

  private findMutants(filePath: string) {
    return this.mutantResults.filter(mutant => mutant.sourceFilePath === filePath);
  }

  private generateReport() {
    return this.cleanBaseFolder()
      .then(() => this.writeCommonResources())
      .then(() => this.writeReportDirectory())
      .then(location => this.log.info(`Your report can be found at: ${fileUrl(location)}`));
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

  private writeCommonResources() {
    return Promise.all([this.copyStrykerResources(), this.copyBootstrapAndHighlightResources()]);
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

  private writeReportFile(scoreResult: ScoreResult, baseDir: string, breadcrumb: Breadcrumb) {
    if (scoreResult.representsFile) {
      const fileContent = templates.sourceFile(scoreResult, this.findFile(scoreResult.path), this.findMutants(scoreResult.path), breadcrumb, this.options.thresholds);

      return util.writeFile(path.join(baseDir, `${scoreResult.name}.html`), fileContent);
    } else {
      return Promise.resolve(); // not a report file
    }
  }

}
