import {SourceFile, MutantResult, MutantStatus} from 'stryker-api/report';
import * as log4js from 'log4js';
import * as path from 'path';
import * as util from './util';
import * as fs from 'fs';
import HandlebarsModel from './HandlebarsModel';
import SourceFileTreeLeaf from './SourceFileTreeLeaf';

const log = log4js.getLogger('HtmlReporter');

/**
 * Represents a node (directory) which can contain source files which in turn include mutant results
 */
export default class SourceFileTreeNode {

  leafs: SourceFileTreeLeaf[] = [];
  children: SourceFileTreeNode[] = [];
  model: HandlebarsModel;
  urlPrefix: string;

  /**
   * @param name - The name of the directory which this node represents
   */
  constructor(public name: string) { }

  /**
   * Adds a source file to this node or one of its children
   * @param file - The file to add
   * @param pathComponents - The path components of the file. Leave empty, should only be used for recursive calls.
   */
  public addSourceFile(file: SourceFile, pathComponents?: string[]) {
    if (!pathComponents) {
      pathComponents = file.path.split(path.sep);
    }
    let nextPathComponent = pathComponents.shift();

    if (!pathComponents.length) {
      this.leafs.push(new SourceFileTreeLeaf(file));
    } else {
      let nodeToAddTo = this.children.filter(node => node.name === nextPathComponent).pop();
      if (!nodeToAddTo) {
        nodeToAddTo = new SourceFileTreeNode(nextPathComponent)
        this.children.push(nodeToAddTo);
      }
      nodeToAddTo.addSourceFile(file, pathComponents);
    }
  }

  /**
   * Adds a mutant result to the correct leaf in this node or one of the children
   * Warning: All source files need to be added before mutant results should be added
   * @param result - the mutant result to add
   * @param pathComponents - The path components of the result. Leave empty, should only be used for recursive calls.
   */
  public addMutantResult(result: MutantResult, pathComponents?: string[]) {
    if (!pathComponents) {
      pathComponents = result.sourceFilePath.split(path.sep);
    }
    let nextPathComponent = pathComponents.shift();
    let childNode = this.children.filter(n => n.name === nextPathComponent).pop();
    if (childNode) {
      childNode.addMutantResult(result, pathComponents);
    } else {
      let leaf = this.leafs.filter(leaf => leaf.file.path === result.sourceFilePath).pop();
      if (leaf) {
        leaf.results.push(result);
      } else {
        log.warn(`Reported a mutant result for "${result.sourceFilePath}" but could not find source code for a file with that name. Skipping the result. Result was ${JSON.stringify(result)}.`);
      }
    }
  }

  public normalizeNames() {

    // Merge together empty container nodes
    while (this.leafs.length === 0 && this.children.length === 1) {
      this.name = path.join(this.name, this.children[0].name);
      this.leafs = this.children[0].leafs;
      this.children = this.children[0].children;
    }

    // Remove illegal path characters
    this.name = this.name.replace(/:/g, '');

    // Recursively do the same
    this.children.forEach(child => child.normalizeNames());
  }

  public calculateModel(urlPrefix: string) {
    let totalKilled = 0, totalSurvived = 0, totalUntested = 0;
    this.children.forEach(child => {
      child.calculateModel(`../${urlPrefix}`);
      totalKilled += child.model.totalKilled;
      totalSurvived += child.model.totalSurvived;
      totalUntested += child.model.totalUntested;
    });

    this.leafs.forEach(leaf => {
      leaf.calculateModel(urlPrefix);
      totalKilled += leaf.model.totalKilled;
      totalSurvived += leaf.model.totalSurvived;
      totalUntested += leaf.model.totalUntested;
    });
    this.model = new HandlebarsModel(this.name, urlPrefix, `${this.name}/index.html`, totalKilled, totalSurvived, totalUntested);
  }

  public writeReportNodeRecursive(directory: string) {
    util.mkdirRecursiveSync(directory);
    fs.writeFileSync(path.join(directory, 'index.html'), util.nodeTemplate(this));
    this.children.forEach(child => child.writeReportNodeRecursive(path.join(directory, child.name)));
    this.leafs.forEach(leaf => leaf.writeFileReport(directory));
  }

  public toString(offset = 0) {
    let prefix = '';
    for (let i = 0; i < offset; i++) {
      prefix += '.';
    }
    let str = `${prefix}${this.name}\n`;
    this.leafs.forEach(l => {
      str += `${prefix}./${l.name}`;
      if (l.results.length) {
        str += ' [';
        l.results.forEach(m => str += SourceFileTreeNode.mutantStatusToString(m.status));
        str += ']';
      }
      str += '\n';
    });
    this.children.forEach(n => str += n.toString(offset + 1));
    return str;
  }

  private static mutantStatusToString(status: MutantStatus) {
    switch (status) {
      case MutantStatus.KILLED:
        return '.';
      case MutantStatus.SURVIVED:
        return 'S';
      case MutantStatus.TIMEDOUT:
        return 'T';
      case MutantStatus.UNTESTED:
        return 'O';
    }
  }
}

