import os from 'os';
import path from 'path';
import { promises as fsPromises } from 'fs';

import mkdirp from 'mkdirp';

import { expect } from 'chai';
import { File } from '@stryker-mutator/util';
import nodeGlob from 'glob';
import { assertions } from '@stryker-mutator/test-helpers';

import { fileUtils } from '../../../src/utils/file-utils.js';

describe('fileUtils', () => {
  describe('moveDirectoryRecursiveSync', () => {
    const from = path.resolve(os.tmpdir(), 'moveDirectoryRecursiveSyncFrom');
    const to = path.resolve(os.tmpdir(), 'moveDirectoryRecursiveSyncTo');

    afterEach(async () => {
      await Promise.all([fileUtils.deleteDir(from), fileUtils.deleteDir(to)]);
    });

    it('should override target files', async () => {
      // Arrange
      const fromFileA = new File(path.resolve(from, 'a.js'), 'original a');
      const fromFileB = new File(path.resolve(from, 'b', 'b.js'), 'original b');
      const toFileA = new File(path.resolve(to, 'a.js'), 'mutated a');
      const toFileB = new File(path.resolve(to, 'b', 'b.js'), 'mutated b');
      await writeAll(fromFileA, fromFileB, toFileA, toFileB);

      // Act
      fileUtils.moveDirectoryRecursiveSync(from, to);

      // Assert
      const files = await readDirRecursive(to);
      assertions.expectTextFilesEqual(files, [new File(toFileA.name, fromFileA.content), new File(toFileB.name, fromFileB.content)]);
    });

    it("should create dirs that don't exist", async () => {
      // Arrange
      const fromFileA = new File(path.resolve(from, 'a.js'), 'original a');
      const fromFileB = new File(path.resolve(from, 'b', 'b.js'), 'original b');
      await writeAll(fromFileA, fromFileB);

      // Act
      fileUtils.moveDirectoryRecursiveSync(from, to);

      // Assert
      const files = await readDirRecursive(to);
      assertions.expectTextFilesEqual(files, [
        new File(path.resolve(to, 'a.js'), fromFileA.content),
        new File(path.resolve(to, 'b', 'b.js'), fromFileB.content),
      ]);
    });

    it('should remove the from directory', async () => {
      // Arrange
      const fromFileA = new File(path.resolve(from, 'a.js'), 'original a');
      const fromFileB = new File(path.resolve(from, 'b', 'b.js'), 'original b');
      await writeAll(fromFileA, fromFileB);

      // Act
      fileUtils.moveDirectoryRecursiveSync(from, to);

      // Assert
      await expect(fsPromises.access(from)).rejected;
    });
  });

  async function readDirRecursive(dir: string): Promise<File[]> {
    return new Promise<File[]>((res, rej) => {
      nodeGlob(path.join(dir, '**/*'), { nodir: true }, (err, matches) => {
        if (err) {
          rej(err);
        }
        // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
        matches.sort();
        res(
          Promise.all(
            matches.map(async (fileName) => {
              const content = await fsPromises.readFile(fileName);
              return new File(path.normalize(fileName), content);
            })
          )
        );
      });
    });
  }

  async function writeAll(...files: File[]): Promise<void> {
    await Promise.all(
      files.map(async (file) => {
        await mkdirp(path.dirname(file.name));
        await fsPromises.writeFile(file.name, file.content);
      })
    );
  }
});
