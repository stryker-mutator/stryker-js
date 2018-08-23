import * as fs from 'mz/fs';
import * as path from 'path';
import { File } from 'stryker-api/core';
import * as glob from 'glob';

const CARRIAGE_RETURN = '\r'.charCodeAt(0);

export class ProjectLoader {

  public static getFiles(basePath: string) {
    return this.load(basePath)
      .then(files => files.sort((a, b) => a.name.localeCompare(b.name)));
  }

  private static load(basePath: string): Promise<File[]> {
    return this.glob(basePath)
      .then(fileNames => fileNames.map(fileName => path.join(basePath, fileName)))
      .then(fileNames => Promise.all(fileNames.map(fileName =>
        fs.readFile(fileName).then(content => new File(fileName, this.normalize(content))))));
  }

  private static normalize(content: Buffer) {
    // Remove carriage returns from the content buffer
    return Buffer.from(content.filter(byte => byte !== CARRIAGE_RETURN) as any);
  }

  private static glob(basePath: string): Promise<string[]> {
    return new Promise<string[]>((res, rej) => glob('**/*.*', { cwd: basePath }, (err, matches) => {
      if (err) {
        rej(err);
      } else {
        res(matches);
      }
    }));
  }
}
