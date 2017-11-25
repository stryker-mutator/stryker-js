import * as fs from 'fs';
import * as path from 'path';
import { createFile } from './producers';
import { TextFile, FileKind } from 'stryker-api/core';
import { EOL } from 'os';

export class ProjectLoader {
  public static _knownExtensions = ['.js', '.jsx', '.ts'];

  public static getFiles(basePath: string) {
    return this.load(basePath).sort(this.sortFunction);
  }

  private static load(basePath: string): Array<TextFile> {
    let files: Array<TextFile> = [];
    const entries = fs.readdirSync(basePath);

    entries.forEach((entry) => {
      files = files.concat(this.processEntry(basePath, entry));
    });

    return files;
  }

  private static processEntry(basePath: string, entry: string): Array<TextFile> {
    const stats = fs.statSync(path.join(basePath, entry));

    if (stats.isDirectory()) {
      return this.load(path.join(basePath, entry));
    } else {
      if (this._knownExtensions.indexOf(path.extname(entry)) >= 0) {
        return [this.createTextFile(path.join(basePath, entry))];
      }
    }

    return [];
  }

  private static createTextFile(entry: string): TextFile {
    const content = fs.readFileSync(entry, 'utf8');

    // We are providing FileKind.Text so we can safely cast to TextFile
    return createFile(entry, content, FileKind.Text) as TextFile;
  }

  private static sortFunction(a: TextFile, b: TextFile) {
    const textA = path.basename(a.name).toUpperCase();
    const textB = path.basename(b.name).toUpperCase();

    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  }

  public static loadBabelRc(basePath: string) {
    return JSON.parse(fs.readFileSync(path.join(basePath, '.babelrc'), 'utf8'));
  }

  public static removeEOL(files: Array<TextFile>) {
    files.forEach((file) => {
      file.content.replace(EOL, '');
    });

    return files;
  }
}

