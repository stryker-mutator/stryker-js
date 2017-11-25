import * as fs from 'fs';
import * as path from 'path';
import { createFile } from './producers';
import { TextFile, FileKind } from 'stryker-api/core';

export class ProjectLoader {
  public static _knownExtensions = ['js', 'jsx', 'ts'];

  public static load(basePath: string): Array<TextFile> {
    const files: Array<TextFile> = [];
    const entries = fs.readdirSync(basePath);

    entries.forEach((entry) => {
      files.concat(this.processEntry(basePath, entry));
    });

    return files;
  }

  private static processEntry(basePath: string, entry: string): Array<TextFile> {
    const stats = fs.statSync(entry);    
    
    if(stats.isDirectory()) {
      return this.load(path.join(basePath, entry));
    } else {
      if(this._knownExtensions.indexOf(path.extname(entry)) !== -1) {
        return [this.createTextFile(entry)];
      }
    }
  }

  private static createTextFile(entry: string): TextFile {
    const content = fs.readFileSync(entry, 'utf8');

    // We are providing FileKind.Text so we can safely cast to TextFile
    return createFile(path.basename(entry), content, FileKind.Text) as TextFile;
  }

  public static loadBabelRc(basePath: string) {
    return JSON.parse(fs.readFileSync(path.join(basePath, '.babelrc'), 'utf8'));
  }
}

