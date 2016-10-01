import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as _ from 'lodash';
import * as mkdirp from 'mkdirp';
import {MutantStatus, MutantResult} from 'stryker-api/report';
import SourceFileTreeNode from './SourceFileTreeNode';
import SourceFileTreeLeaf from './SourceFileTreeLeaf';

export function copyFolder(fromPath: string, to: string): Promise<any> {
  return mkdirRecursive(to).then(() => readdir(fromPath).then(files => {
    let promisses: Promise<void>[] = [];
    files.forEach(file => {
      let currentPath = path.join(fromPath, file);
      let toCurrentPath = path.join(to, file);
      promisses.push(stats(currentPath).then(stats => {
        if (stats.isDirectory()) {
          return copyFolder(currentPath, toCurrentPath);
        } else {
          return copyFile(currentPath, toCurrentPath);
        }
      }));
    });
    return Promise.all(promisses);
  }));
}


export function copyFile(fromFilename: string, toFilename: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let readStream = fs.createReadStream(fromFilename);
    let writeStream = fs.createWriteStream(toFilename);
    readStream.on('error', reject);
    writeStream.on('error', reject);
    readStream.pipe(writeStream);
    readStream.on('end', () => resolve());
  });
}


function rmFile(path: string) {
  return new Promise<void>((fileResolve, fileReject) => {
    fs.unlink(path, error => {
      if (error) {
        fileReject(error);
      } else {
        fileResolve();
      }
    });
  });
}

function mkdir(path: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.mkdir(path, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function stats(path: string): Promise<fs.Stats> {
  return new Promise((resolve, reject) => {
    fs.stat(path, (error, stats) => {
      if (error) {
        reject(error);
      } else {
        resolve(stats);
      }
    });
  });
}

function rmdir(dirToDelete: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.rmdir(dirToDelete, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export function deleteDir(dirToDelete: string): Promise<void> {
  return fileOrFolderExists(dirToDelete).then(exists => {
    if (exists) {
      return readdir(dirToDelete).then(files => {
        let promisses = files.map(file => {
          let currentPath = path.join(dirToDelete, file);
          return stats(currentPath).then(stats => {
            if (stats.isDirectory()) {
              // recursive
              return deleteDir(currentPath);
            } else {
              // delete file
              return rmFile(currentPath);
            }
          });
        });
        // delete dir
        return Promise.all(promisses).then(() => rmdir(dirToDelete));
      });
    }
  });
}


function readdir(path: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(path, (error, files) => {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  });
}

export function mkdirRecursiveSync(folderName: string) {
  mkdirp.sync(folderName);
}

export function mkdirRecursive(folderName: string): Promise<void> {

  return new Promise<void>((resolve, reject) => {
    mkdirp(folderName, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function fileOrFolderExists(path: string): Promise<boolean> {
  return new Promise(resolve => {
    fs.lstat(path, (error, stats) => {
      resolve(!error);
    });
  });
}

function readTemplate(name: string) {
  return fs.readFileSync(path.join(__dirname, 'templates', `${name}.tpl.html`), 'utf8');
}
function compileTemplate(name: string) {
  return handlebars.compile(readTemplate(name));
}

let templates = {
  node: compileTemplate('node'),
  footer: compileTemplate('footer'),
  header: compileTemplate('header'),
  sourceFile: compileTemplate('sourceFile'),
};
handlebars.registerPartial('resultRow', readTemplate('resultRow'));
handlebars.registerPartial('resultTableHead', readTemplate('resultTableHead'));
handlebars.registerHelper('code', function () {
  let leaf: SourceFileTreeLeaf = this;
  let currentBackground: string = null;
  let currentCursorMutantStatusses = {
    killed: 0,
    survived: 0,
    timeout: 0,
    untested: 0
  };
  let maxIndex = leaf.file.content.length - 1;
  let numberedMutants = _.sortBy(leaf.results, m => m.range[0] * 10000 + m.range[1] * -1)
    .map((mutant, index) => ({ mutant, index }));

  let adjustCurrentMutantResult = (valueToAdd: number) => (numberedMutant: { mutant: MutantResult, index: number }) => {
    switch (numberedMutant.mutant.status) {
      case MutantStatus.KILLED:
        currentCursorMutantStatusses.killed += valueToAdd;
        break;
      case MutantStatus.SURVIVED:
        currentCursorMutantStatusses.survived += valueToAdd;
        break;
      case MutantStatus.TIMEDOUT:
        currentCursorMutantStatusses.timeout += valueToAdd;
        break;
      case MutantStatus.UNTESTED:
        currentCursorMutantStatusses.untested += valueToAdd;
        break;
    }
  };

  let determineBackground = () => {
    if (currentCursorMutantStatusses.survived > 0) {
      return getContextClassForStatus(MutantStatus.SURVIVED);
    } else if (currentCursorMutantStatusses.untested > 0) {
      return getContextClassForStatus(MutantStatus.UNTESTED);
    } else if (currentCursorMutantStatusses.timeout > 0) {
      return getContextClassForStatus(MutantStatus.TIMEDOUT);
    } else if (currentCursorMutantStatusses.killed > 0) {
      return getContextClassForStatus(MutantStatus.KILLED);
    }
    return null;
  };

  let annotate = (char: string, index: number) => {
    let mutantsStarting = numberedMutants.filter(m => m.mutant.range[0] === index);
    let mutantsEnding = numberedMutants.filter(m => m.mutant.range[1] === index - 1);
    mutantsStarting.forEach(adjustCurrentMutantResult(1));
    mutantsEnding.forEach(adjustCurrentMutantResult(-1));
    let backgroundColorAnnotation = mutantsStarting.length || mutantsEnding.length || index === 0 ? `<span class="bg-${determineBackground()}">` : '';
    let backgroundColorEndAnnotation = ((mutantsStarting.length || mutantsEnding.length) && index > 0) || index === maxIndex ? '</span>' : '';

    let mutantsAnnotations = mutantsStarting.map(m =>
      `<a href="#" class="stryker-mutant-button" data-mutant-status-annotation="${getContextClassForStatus(m.mutant.status)}" data-mutant="${m.index}">` +
      `<span class="label label-${getContextClassForStatus(m.mutant.status)}">${m.index}</span>` +
      `</a>`
      + `<span class="label label-info stryker-mutant-replacement" hidden data-mutant="${m.index}">${escape(m.mutant.replacement)}</span>`);
    let originalCodeStartAnnotations = mutantsStarting.map(m => `<span class="stryker-original-code" data-mutant="${m.index}">`);
    let originalCodeEndAnnotations = mutantsEnding.map(m => '</span>');
    let mutantReplacements = mutantsEnding.map(m => `<span class="label label-info stryker-mutant-replacement" hidden data-mutant="${m.index}">${escape(m.mutant.replacement)}</span>`);
    return `${backgroundColorEndAnnotation}${originalCodeEndAnnotations.join('')}${mutantsAnnotations.join('')}${originalCodeStartAnnotations.join('')}${backgroundColorAnnotation}${escape(char)}`;
  };

  return new handlebars.SafeString(`<pre><code class="lang-javascript">${mapString(leaf.file.content, annotate).join('')}</code></pre>`);
});


function getContextClassForStatus(status: MutantStatus) {
  switch (status) {
    case MutantStatus.KILLED:
      return 'success';
    case MutantStatus.UNTESTED:
    case MutantStatus.SURVIVED:
      return 'danger';
    case MutantStatus.TIMEDOUT:
      return 'warning';
  }
}

function escape(input: string): string {
  return (<any>handlebars).escapeExpression(input);
}

/**
 * A `map` function, as in [1, 2].map(i => i+1), but for a string 
 */
function mapString<T>(source: string, fn: (char: string, index?: number) => T): T[] {
  let results: T[] = [];
  for (let i = 0; i < source.length; i++) {
    results.push(fn(source[i], i));
  }
  return results;
}

export function nodeTemplate(context: SourceFileTreeNode | SourceFileTreeLeaf) {
  return templates.header(context) + templates.node(context) + templates.footer(context);
}

export function sourceFileTemplate(context: SourceFileTreeLeaf) {
  return templates.header(context) + templates.sourceFile(context) + templates.footer(context);
}