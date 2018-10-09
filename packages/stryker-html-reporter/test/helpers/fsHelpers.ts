import * as path from 'path';
import * as fs from 'fs';

type File = string | Directory;

export interface Directory {
  [dirName: string]: File;
}

export function readDirectoryTree(current: string): Directory {
  const dir: Directory = Object.create(null);
  return fs.readdirSync(current)
    .sort()
    .map(fileName => ({ fileName, stats: fs.statSync(path.join(current, fileName)) }))
    .reduce((dir, { fileName, stats }) => {
      if (stats.isDirectory()) {
        dir[fileName] = readDirectoryTree(path.join(current, fileName));
      } else {
        dir[fileName] = fileName;
      }
      return dir;
    }, dir);
}
