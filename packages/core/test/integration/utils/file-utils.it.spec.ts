import os from 'os';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { promisify } from 'util';

import mkdirp from 'mkdirp';
import { expect } from 'chai';
import nodeGlob from 'glob';

import { fileUtils } from '../../../src/utils/file-utils.js';

const glob = promisify(nodeGlob);

describe('fileUtils', () => {
  describe('moveDirectoryRecursiveSync', () => {
    const from = path.resolve(os.tmpdir(), 'moveDirectoryRecursiveSyncFrom');
    const to = path.resolve(os.tmpdir(), 'moveDirectoryRecursiveSyncTo');

    afterEach(async () => {
      await Promise.all([fileUtils.deleteDir(from), fileUtils.deleteDir(to)]);
    });

    it('should override target files', async () => {
      // Arrange
      const expectedFileNameA = path.resolve(to, 'a.js');
      const expectedFileNameB = path.resolve(to, 'b', 'b.js');
      await writeAll({
        [path.resolve(from, 'a.js')]: 'original a',
        [path.resolve(from, 'b', 'b.js')]: 'original b',
        [expectedFileNameA]: 'mutated a',
        [expectedFileNameB]: 'mutated b',
      });

      // Act
      fileUtils.moveDirectoryRecursiveSync(from, to);

      // Assert
      const files = await readDirRecursive(to);
      expect(files).deep.eq({
        [expectedFileNameA]: 'original a',
        [expectedFileNameB]: 'original b',
      });
    });

    it("should create dirs that don't exist", async () => {
      // Arrange
      await writeAll({
        [path.resolve(from, 'a.js')]: 'original a',
        [path.resolve(from, 'b', 'b.js')]: 'original b',
      });

      // Act
      fileUtils.moveDirectoryRecursiveSync(from, to);

      // Assert
      const files = await readDirRecursive(to);
      expect(files).deep.eq({
        [path.resolve(to, 'a.js')]: 'original a',
        [path.resolve(to, 'b', 'b.js')]: 'original b',
      });
    });

    it('should remove the from directory', async () => {
      // Arrange
      await writeAll({
        [path.resolve(from, 'a.js')]: 'original a',
        [path.resolve(from, 'b', 'b.js')]: 'original b',
      });

      // Act
      fileUtils.moveDirectoryRecursiveSync(from, to);

      // Assert
      await expect(fsPromises.access(from)).rejected;
    });
  });

  async function readDirRecursive(dir: string): Promise<Record<string, string>> {
    const fileNames = await glob('**/*', { cwd: dir, nodir: true });
    const files = Object.fromEntries(
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
        fileNames
          .sort()
          .map((fileName) => path.resolve(dir, fileName))
          .map(async (fileName) => {
            const content = await fsPromises.readFile(fileName, 'utf-8');
            return [fileName, content] as const;
          })
      )
    );
    return files;
  }

  async function writeAll(files: Record<string, string>): Promise<void> {
    await Promise.all(
      Object.entries(files).map(async ([fileName, fileContent]) => {
        await mkdirp(path.dirname(fileName));
        await fsPromises.writeFile(fileName, fileContent);
      })
    );
  }
});
