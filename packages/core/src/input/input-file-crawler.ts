import { promises as fsPromises } from 'fs';
import path from 'path';

import ignore from 'ignore';

export class InputFileCrawler {
  public async resolveFiles(): Promise<string[]> {
    const ignorer = ignore().add('node_modules').add('.git').add('core');

    const crawlDir = async (relativeName: string, rootDir: string): Promise<string[]> => {
      const dirents = await fsPromises.readdir(path.resolve(rootDir, relativeName), { withFileTypes: true });
      const files = await Promise.all(
        dirents
          .filter((dirent) => !ignorer.ignores(path.join(relativeName, dirent.isDirectory() ? `${dirent.name}/` : dirent.name)))
          .map(async (dirent) => {
            if (dirent.isDirectory()) {
              return crawlDir(path.join(relativeName, dirent.name), rootDir);
            } else {
              return path.resolve(rootDir, relativeName, dirent.name);
            }
          })
      );
      return files.flat();
    };
    const files = await crawlDir('.', process.cwd());
    // console.log('found', JSON.stringify(files, null, 2));
    console.log(`Total ${files.length} files`);
    return files;
  }
}
