import path from 'path';
import type { Dirent } from 'fs';

import { MutateDescription, MutationRange } from '@stryker-mutator/api/core';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import {
  I,
  normalizeFileName,
  normalizeWhitespaces,
} from '@stryker-mutator/util';
import { expect } from 'chai';
import sinon from 'sinon';

import { ProjectReader } from '../../../src/fs/project-reader.js';
import { coreTokens } from '../../../src/di/index.js';
import { FileSystem } from '../../../src/fs/file-system.js';
import { createDirent, createFileSystemMock } from '../../helpers/producers.js';

describe(ProjectReader.name, () => {
  let fsMock: sinon.SinonStubbedInstance<I<FileSystem>>;

  beforeEach(() => {
    fsMock = createFileSystemMock();
  });

  describe('file resolving', () => {
    it('should log a warning if no files were resolved', async () => {
      stubFileSystem({}); // empty dir
      const sut = createSut();
      await sut.read(undefined);
      expect(testInjector.logger.warn).calledWith(
        `No files found in directory ${process.cwd()} using ignore rules: ["node_modules",".git","*.tsbuildinfo","/stryker.log",".next",".nuxt",".svelte-kit",".stryker-tmp","reports/stryker-incremental.json","reports/mutation/mutation.html","reports/mutation/mutation.json"]. Make sure you run Stryker from the root directory of your project with the correct "ignorePatterns".`,
      );
    });
    it('should discover files recursively using readdir', async () => {
      // Arrange
      stubFileSystem({
        app: {
          'app.component.js': '@Component()',
        },
        util: {
          'index.js': 'foo.bar',
          object: {
            'object-helper.js': 'export const helpers = {}',
          },
        },
      });
      const sut = createSut();

      // Act
      const result = await sut.read(undefined);

      // Assert
      expect([...result.files.keys()]).deep.eq([
        path.resolve('app', 'app.component.js'),
        path.resolve('util', 'index.js'),
        path.resolve('util', 'object', 'object-helper.js'),
      ]);
      expect(
        await result.files
          .get(path.resolve('app', 'app.component.js'))!
          .readContent(),
      ).eq('@Component()');
      expect(
        await result.files.get(path.resolve('util', 'index.js'))!.readContent(),
      ).eq('foo.bar');
      expect(
        await result.files
          .get(path.resolve('util', 'object', 'object-helper.js'))!
          .readContent(),
      ).eq('export const helpers = {}');
      expect(fsMock.readdir).calledWith(process.cwd(), { withFileTypes: true });
    });
    it('should respect ignore patterns', async () => {
      stubFileSystem({
        src: { 'index.js': 'export * from "./app"' },
        dist: { 'index.js': 'module.exports = require("./app")' },
      });
      testInjector.options.ignorePatterns = ['dist'];
      const sut = createSut();
      const result = await sut.read(undefined);
      expect([...result.files.keys()]).deep.eq([
        path.resolve('src', 'index.js'),
      ]);
    });
    it('should respect deep ignore patterns', async () => {
      stubFileSystem({
        packages: {
          app: {
            src: { 'index.js': 'export * from "./app"' },
            dist: { 'index.js': 'module.exports = require("./app")' },
          },
        },
      });
      testInjector.options.ignorePatterns = ['/packages/*/dist'];
      const sut = createSut();
      const { files } = await sut.read(undefined);
      expect(files).lengthOf(1);
      expect(files.keys().next().value).eq(
        path.resolve('packages', 'app', 'src', 'index.js'),
      );
    });
    it('should ignore default files', async () => {
      // Arrange
      stubFileSystem({
        '.git': { config: '' },
        node_modules: { rimraf: { 'index.js': '' } },
        '.stryker-tmp': { 'stryker-sandbox-123': { src: { 'index.js': '' } } },
        'index.js': '',
        'stryker.log': '',
        'tsconfig.src.tsbuildinfo': '',
        dist: {
          'tsconfig.tsbuildinfo': '',
        },
        reports: {
          'stryker-incremental.json': '',
          mutation: { 'mutation.html': '', 'mutation.json': '' },
        },
      });
      const sut = createSut();

      // Act
      const { files } = await sut.read(undefined);

      // Assert
      expect(files).lengthOf(1);
      expect(files.keys().next().value).eq(path.resolve('index.js'));
    });
    it('should ignore alternative configuration properties by default', async () => {
      // Arrange
      stubFileSystem({
        'foo.json': '',
        bar: { 'index.js': '' },
        baz: { 'index.html': '', 'index.json': '' },
        '.stryker-tmp': { 'index.js': '' },
        reports: {
          'stryker-incremental.json': '',
          mutation: { 'mutation.html': '', 'mutation.json': '' },
        },
      });
      testInjector.options.incrementalFile = 'foo.json';
      testInjector.options.tempDirName = 'bar';
      testInjector.options.htmlReporter.fileName = 'baz/index.html';
      testInjector.options.jsonReporter.fileName = 'baz/index.json';
      const sut = createSut();

      // Act
      const { files } = await sut.read(undefined);

      // Assert
      expect(files).lengthOf(4);
      const keys = files.keys();
      expect(keys.next().value).eq(path.resolve('.stryker-tmp', 'index.js'));
      expect(keys.next().value).eq(
        path.resolve('reports', 'stryker-incremental.json'),
      );
      expect(keys.next().value).eq(
        path.resolve('reports', 'mutation', 'mutation.html'),
      );
      expect(keys.next().value).eq(
        path.resolve('reports', 'mutation', 'mutation.json'),
      );
    });
    it('should not ignore deep report directories by default', async () => {
      // Arrange
      stubFileSystem({
        app: { reports: { 'reporter.component.js': '' } },
      });
      const sut = createSut();
      // Act
      const { files } = await sut.read(undefined);
      // Assert
      expect(files).lengthOf(1);
      expect(files.keys().next().value).eq(
        path.resolve('app', 'reports', 'reporter.component.js'),
      );
    });
    it('should ignore a deep node_modules directory by default', async () => {
      // Arrange
      stubFileSystem({
        testResources: {
          'require-resolve': { node_modules: { bar: { 'index.js': '' } } },
        },
      });
      const sut = createSut();
      // Act
      const { files } = await sut.read(undefined);
      // Assert
      expect(files).lengthOf(0);
    });
    it('should allow un-ignore', async () => {
      // Arrange
      stubFileSystem({
        '.git': { config: '' },
        node_modules: { rimraf: { 'index.js': '' } },
        '.stryker-tmp': { 'stryker-sandbox-123': { src: { 'index.js': '' } } },
        'index.js': '',
      });
      testInjector.options.ignorePatterns = ['!node_modules'];
      const sut = createSut();
      // Act
      const { files } = await sut.read(undefined);
      // Assert
      expect(files).lengthOf(2);
      expect(new Set(files.keys())).deep.eq(
        new Set([
          path.resolve('index.js'),
          path.resolve('node_modules', 'rimraf', 'index.js'),
        ]),
      );
    });
    it('should allow un-ignore deep node_modules directory', async () => {
      // Arrange
      stubFileSystem({
        node_modules: { rimraf: { 'index.js': '' } },
        testResources: {
          'require-resolve': { node_modules: { bar: { 'index.js': '' } } },
        },
      });
      testInjector.options.ignorePatterns = ['!testResources/**/node_modules'];
      const sut = createSut();
      // Act
      const { files } = await sut.read(undefined);
      // Assert
      expect(files).lengthOf(1);
      expect(files.keys().next().value).eq(
        path.resolve(
          'testResources',
          'require-resolve',
          'node_modules',
          'bar',
          'index.js',
        ),
      );
    });
    it('should reject if fs commands fail', async () => {
      const expectedError = factory.fileNotFoundError();
      fsMock.readdir.rejects(expectedError);
      await expect(createSut().read(undefined)).rejectedWith(expectedError);
    });
    it('should allow whitelisting with "**"', async () => {
      stubFileSystem({
        src: { 'index.js': 'export * from "./app"' },
        dist: { 'index.js': 'module.exports = require("./app")' },
      });
      testInjector.options.ignorePatterns = ['**', '!src/**/*.js'];
      const sut = createSut();
      const { files } = await sut.read(undefined);
      expect(files).lengthOf(1);
      expect(files.keys().next().value).eq(path.resolve('src', 'index.js'));
    });
    it('should allow deep whitelisting with "**"', async () => {
      stubFileSystem({
        app: {
          src: { 'index.js': 'export * from "./app"' },
        },
        dist: { 'index.js': 'module.exports = require("./app")' },
      });
      testInjector.options.ignorePatterns = ['**', '!app/src/index.js'];
      const sut = createSut();
      const { files } = await sut.read(undefined);
      expect(files).lengthOf(1);
      expect(files.keys().next().value).eq(
        path.resolve('app', 'src', 'index.js'),
      );
    });
    it('should mutate file when supplied twice', async () => {
      // Arrange
      stubFileSystem({
        'mute1.js': 'mutate 1 content',
      });
      testInjector.options.mutate = ['mute1.js', 'mute1.js'];
      const sut = createSut();

      // Act
      const result = await sut.read(undefined);

      // Assert
      const expectedFileName = path.resolve('mute1.js');
      expect([...result.filesToMutate.keys()]).deep.eq([expectedFileName]);
      expect(result.filesToMutate.get(expectedFileName)!.mutate).to.be.true;
    });
    it('should mutate when the full file is negated earlier', async () => {
      stubFileSystem({
        'mute1.js': 'mutate 1 content',
      });
      testInjector.options.mutate = ['!mute1.js', 'mute1.js'];
      const sut = createSut();
      const result = await sut.read(undefined);
      expect(result.filesToMutate).lengthOf(1);
      expect(result.filesToMutate.get(path.resolve('mute1.js'))!.mutate).to.be
        .true;
    });

    it('should not mutate when the full file is negated after', async () => {
      stubFileSystem({
        'mute1.js': 'mutate 1 content',
      });
      testInjector.options.mutate = ['mute1.js', '!mute1.js'];
      const sut = createSut();
      const result = await sut.read(undefined);
      expect(result.filesToMutate).lengthOf(0);
    });
    describe('without mutate files', () => {
      it('should warn about dry-run', async () => {
        // Arrange
        stubFileSystem({
          'file1.js': 'file 1 content',
          'file2.js': 'file 2 content',
          'file3.js': 'file 3 content',
          'mute1.js': 'mutate 1 content',
          'mute2.js': 'mutate 2 content',
        });
        // Act
        const sut = createSut();
        await sut.read(undefined);

        // Assert
        expect(testInjector.logger.warn).calledWith(
          normalizeWhitespaces(`Warning: No files found for mutation with the given glob expressions.
            As a result, a dry-run will be performed without actually modifying anything. 
            If you intended to mutate files, please check and adjust the configuration. 
            Current glob pattern(s) used: "{src,lib}/**/!(*.+(s|S)pec|*.+(t|T)est).+(cjs|mjs|js|ts|mts|cts|jsx|tsx|html|vue|svelte)" and 
            "!{src,lib}/**/__tests__/**/*.+(cjs|mjs|js|ts|mts|cts|jsx|tsx|html|vue|svelte)".
            To enable file mutation, consider configuring the \`mutate\` 
            property in your configuration file or using the --mutate option via the command line.`),
        );
      });
    });
    function stubFileSystemWith5Files() {
      stubFileSystem({
        'file1.js': 'file 1 content',
        'file2.js': 'file 2 content',
        'file3.js': 'file 3 content',
        'mute1.js': 'mutate 1 content',
        'mute2.js': 'mutate 2 content',
      });
    }
    describe('with mutation range definitions', () => {
      beforeEach(() => {
        stubFileSystem({
          'file1.js': 'file 1 content',
          'file2.js': 'file 2 content',
          'file3.js': 'file 3 content',
          'mute1.js': 'mutate 1 content',
          'mute2.js': 'mutate 2 content',
        });
      });
      it('should parse the mutation range', async () => {
        // Arrange
        testInjector.options.mutate = ['mute1.js:1:2-2:2'];
        const sut = createSut();

        // Act
        const result = await sut.read(undefined);

        // Assert
        const expectedFileName = path.resolve('mute1.js');
        const expectedRanges: MutationRange[] = [
          {
            start: {
              column: 2,
              line: 0, // internally, Stryker works 0-based
            },
            end: {
              column: 2,
              line: 1,
            },
          },
        ];
        expect([...result.filesToMutate.keys()]).deep.eq([expectedFileName]);
        expect(result.filesToMutate.get(expectedFileName)!.mutate).deep.eq(
          expectedRanges,
        );
      });

      it('should default column numbers if not present', async () => {
        testInjector.options.mutate = ['mute1.js:6-12'];
        const sut = createSut();
        const result = await sut.read(undefined);
        const expectedMutate: MutateDescription = [
          mutateRange(5, 0, 11, Number.MAX_SAFE_INTEGER),
        ];
        expect(result.filesToMutate).lengthOf(1);
        expect(
          result.filesToMutate.get(path.resolve('mute1.js'))!.mutate,
        ).deep.eq(expectedMutate);
      });

      it('should allow multiple mutation ranges', async () => {
        testInjector.options.mutate = ['mute1.js:6-12', 'mute1.js:50-60'];
        const sut = createSut();
        const result = await sut.read(undefined);
        const expectedMutate: MutateDescription = [
          mutateRange(5, 0, 11, Number.MAX_SAFE_INTEGER),
          mutateRange(49, 0, 59, Number.MAX_SAFE_INTEGER),
        ];
        expect(result.filesToMutate).lengthOf(1);
        expect(
          result.filesToMutate.get(path.resolve('mute1.js'))!.mutate,
        ).deep.eq(expectedMutate);
      });

      it('should mutate a specific range when the full file is negated earlier', async () => {
        testInjector.options.mutate = ['!mute1.js', 'mute1.js:6-12'];
        const sut = createSut();
        const result = await sut.read(undefined);
        const expectedMutate: MutateDescription = [
          mutateRange(5, 0, 11, Number.MAX_SAFE_INTEGER),
        ];
        expect(result.filesToMutate).lengthOf(1);
        expect(
          result.filesToMutate.get(path.resolve('mute1.js'))!.mutate,
        ).to.deep.equal(expectedMutate);
      });

      it('should not mutate a specific range after the full file is negated', async () => {
        testInjector.options.mutate = ['mute1.js:6-12', '!mute1.js'];
        const sut = createSut();
        const result = await sut.read(undefined);
        expect(result.filesToMutate).lengthOf(0);
      });

      it('should mutate the complete file when both a range and no range are specified', async () => {
        testInjector.options.mutate = ['mute1.js:6-12', 'mute1.js'];
        const sut = createSut();
        const result = await sut.read(undefined);
        expect(result.filesToMutate).lengthOf(1);
        expect(result.filesToMutate.get(path.resolve('mute1.js'))!.mutate).to.be
          .true;
      });

      it('should mutate the complete file when both no range and a range are specified', async () => {
        testInjector.options.mutate = ['mute1.js', 'mute1.js:6-12'];
        const sut = createSut();
        const result = await sut.read(undefined);
        expect(result.filesToMutate).lengthOf(1);
        expect(result.filesToMutate.get(path.resolve('mute1.js'))!.mutate).to.be
          .true;
      });
    });
    describe('with mutate file patterns', () => {
      it('should result in the expected mutate files', async () => {
        stubFileSystemWith5Files();
        testInjector.options.mutate = ['mute*'];
        const sut = createSut();
        const result = await sut.read(undefined);
        expect([...result.filesToMutate.keys()]).to.deep.equal([
          path.resolve('mute1.js'),
          path.resolve('mute2.js'),
        ]);
        expect([...result.files.keys()]).to.deep.equal([
          path.resolve('file1.js'),
          path.resolve('file2.js'),
          path.resolve('file3.js'),
          path.resolve('mute1.js'),
          path.resolve('mute2.js'),
        ]);
      });

      it('mutates an explicit file when already mutating all files in a folder', async () => {
        stubFileSystem({
          folder: {
            'mute1.js': 'mutate 1 content',
          },
        });
        testInjector.options.mutate = ['folder/', 'folder/mute1.js'];
        const sut = createSut();
        const result = await sut.read(undefined);
        expect([...result.filesToMutate.keys()]).to.deep.equal([
          path.resolve('folder/mute1.js'),
        ]);
      });
      it('should only report a mutate file when it is included in the resolved files', async () => {
        stubFileSystemWith5Files();
        testInjector.options.mutate = ['mute*'];
        testInjector.options.ignorePatterns = ['mute2.js'];
        const sut = createSut();
        const result = await sut.read(undefined);
        expect([...result.filesToMutate.keys()]).to.deep.equal([
          path.resolve('mute1.js'),
        ]);
      });
      it('should warn about useless patterns custom "mutate" patterns', async () => {
        testInjector.options.mutate = [
          'src/**/*.js',
          '!src/index.js',
          'types/global.d.ts',
        ];
        stubFileSystem({
          src: {
            'foo.js': 'foo();',
          },
        });
        const sut = createSut();
        await sut.read(undefined);
        expect(testInjector.logger.warn).calledTwice;
        expect(testInjector.logger.warn).calledWith(
          'Glob pattern "!src/index.js" did not exclude any files.',
        );
        expect(testInjector.logger.warn).calledWith(
          'Glob pattern "types/global.d.ts" did not result in any files.',
        );
      });
      it('should not warn about useless patterns if "mutate" isn\'t overridden', async () => {
        stubFileSystem({
          src: {
            'foo.js': 'foo();',
          },
        });
        const sut = createSut();
        await sut.read(undefined);
        expect(testInjector.logger.warn).not.called;
      });

      describe('with targetMutatePatterns', () => {
        it('should result in the expected mutate files', async () => {
          stubFileSystemWith5Files();
          testInjector.options.mutate = ['mute*'];
          const sut = createSut();
          const result = await sut.read(['mute1.js', 'mute2.js']);
          expect([...result.filesToMutate.keys()]).to.deep.equal([
            path.resolve('mute1.js'),
            path.resolve('mute2.js'),
          ]);
          expect([...result.files.keys()]).to.deep.equal([
            path.resolve('file1.js'),
            path.resolve('file2.js'),
            path.resolve('file3.js'),
            path.resolve('mute1.js'),
            path.resolve('mute2.js'),
          ]);
        });
        it('should not mutate any files if targetMutatePatterns is empty', async () => {
          stubFileSystemWith5Files();
          testInjector.options.mutate = ['*'];
          const sut = createSut();
          const targetMutatePatterns: string[] = [];
          const result = await sut.read(targetMutatePatterns);
          expect([...result.filesToMutate.keys()]).to.deep.equal([]);
        });

        it('should not mutate any files if mutate patterns is empty', async () => {
          stubFileSystemWith5Files();
          testInjector.options.mutate = [];
          const sut = createSut();
          const targetMutatePatterns = ['**/*'];
          const result = await sut.read(targetMutatePatterns);
          expect([...result.filesToMutate.keys()]).to.deep.equal([]);
        });

        it('should only mutate files that match both targetMutatePatterns and mutate patterns', async () => {
          stubFileSystemWith5Files();
          testInjector.options.mutate = ['mute*'];
          const sut = createSut();
          // Only mute1.js is in the target scope and matches mutate
          const targetMutatePatterns = ['mute1.js'];
          const result = await sut.read(targetMutatePatterns);
          expect([...result.filesToMutate.keys()]).to.deep.equal([
            path.resolve('mute1.js'),
          ]);
          expect(result.filesToMutate.get(path.resolve('mute1.js'))!.mutate).to
            .be.true;
        });

        it('should not mutate files not in targetMutatePatterns, even if mutate matches files', async () => {
          stubFileSystemWith5Files();
          testInjector.options.mutate = ['mute*'];
          const sut = createSut();
          // No files in the target scope match mutate
          const targetMutatePatterns = ['file3.js'];
          const result = await sut.read(targetMutatePatterns);
          expect([...result.filesToMutate.keys()]).to.deep.equal([]);
        });

        it('should have all files in project result', async () => {
          stubFileSystemWith5Files();
          testInjector.options.mutate = ['mute*'];
          const sut = createSut();
          const targetMutatePatterns = ['**/*'];
          const result = await sut.read(targetMutatePatterns);
          expect([...result.filesToMutate.keys()]).to.deep.equal([
            path.resolve('mute1.js'),
            path.resolve('mute2.js'),
          ]);
          expect([...result.files.keys()]).to.deep.equal([
            path.resolve('file1.js'),
            path.resolve('file2.js'),
            path.resolve('file3.js'),
            path.resolve('mute1.js'),
            path.resolve('mute2.js'),
          ]);
        });

        describe('with ranges', () => {
          it('should support targetMutatePatterns with ranges', async () => {
            stubFileSystemWith5Files();
            testInjector.options.mutate = ['mute*'];
            const sut = createSut();
            // Only mute1.js is in the target scope, and only a range is allowed
            const targetMutatePatterns = ['mute1.js:2-3'];
            const result = await sut.read(targetMutatePatterns);
            expect([...result.filesToMutate.keys()]).to.deep.equal([
              path.resolve('mute1.js'),
            ]);
            expect(
              result.filesToMutate.get(path.resolve('mute1.js'))!.mutate,
            ).to.deep.equal([
              {
                start: { line: 1, column: 0 },
                end: { line: 2, column: Number.MAX_SAFE_INTEGER },
              },
            ]);
          });

          it('should mutate only the overlapping part between mutate and targetMutatePatterns when only mutate has ranges', async () => {
            stubFileSystem({
              'mute.js': 'file content',
            });

            testInjector.options.mutate = ['mute.js:3-10'];
            const sut = createSut();
            const targetMutatePatterns = ['mute.js'];
            const result = await sut.read(targetMutatePatterns);
            expect([...result.filesToMutate.keys()]).to.deep.equal([
              path.resolve('mute.js'),
            ]);
            expect(
              result.filesToMutate.get(path.resolve('mute.js'))!.mutate,
            ).to.deep.equal([
              {
                start: { line: 2, column: 0 },
                end: { line: 9, column: Number.MAX_SAFE_INTEGER },
              },
            ]);
          });

          it('should only mutate the single overlapping part between mutate and targetMutatePatterns', async () => {
            stubFileSystemWith5Files();
            testInjector.options.mutate = ['mute1.js:3-10'];
            const sut = createSut();
            // Only mute1.js is in the target scope, and only a range is allowed
            const targetMutatePatterns = ['mute1.js:1-4'];
            const result = await sut.read(targetMutatePatterns);
            expect([...result.filesToMutate.keys()]).to.deep.equal([
              path.resolve('mute1.js'),
            ]);
            expect(
              result.filesToMutate.get(path.resolve('mute1.js'))!.mutate,
            ).to.deep.equal([
              {
                start: { line: 2, column: 0 },
                end: { line: 3, column: Number.MAX_SAFE_INTEGER },
              },
            ]);
          });

          it('should support mutate with multiple overlapping line parts between mutate and targetMutatePatterns', async () => {
            stubFileSystemWith5Files();
            testInjector.options.mutate = ['mute1.js:3-10'];
            const sut = createSut();
            // Only mute1.js is in the target scope, and only a range is allowed
            const targetMutatePatterns = ['mute1.js:1-4', 'mute1.js:8-12'];
            const result = await sut.read(targetMutatePatterns);
            expect([...result.filesToMutate.keys()]).to.deep.equal([
              path.resolve('mute1.js'),
            ]);
            expect(
              result.filesToMutate.get(path.resolve('mute1.js'))!.mutate,
            ).to.deep.equal([
              {
                start: { line: 2, column: 0 },
                end: { line: 3, column: Number.MAX_SAFE_INTEGER },
              },
              {
                start: { line: 7, column: 0 },
                end: { line: 9, column: Number.MAX_SAFE_INTEGER },
              },
            ]);
          });

          it('should only mutate the overlapping columns parts between mutate and targetMutatePatterns', async () => {
            stubFileSystem({
              'mute1.js': 'file content',
            });
            testInjector.options.mutate = ['mute1.js:3:4-10:9'];
            const sut = createSut();
            // Only mute1.js is in the target scope, and only a range is allowed
            const targetMutatePatterns = [
              'mute1.js:1:1-4:6',
              'mute1.js:8:10-12:10',
            ];
            const result = await sut.read(targetMutatePatterns);
            expect([...result.filesToMutate.keys()]).to.deep.equal([
              path.resolve('mute1.js'),
            ]);
            expect(
              result.filesToMutate.get(path.resolve('mute1.js'))!.mutate,
            ).to.deep.equal([
              {
                // internally, Stryker works 0-based for lines, not for columns
                start: { line: 2, column: 4 },
                end: { line: 3, column: 6 },
              },
              {
                start: { line: 7, column: 10 },
                end: { line: 9, column: 9 },
              },
            ]);
          });

          it('should not mutate if file is not targeted entirely', async () => {
            stubFileSystem({
              'mute1.js': 'file content',
            });
            testInjector.options.mutate = ['mute1.js'];
            const sut = createSut();
            const targetMutatePatterns: string[] = [];
            const result = await sut.read(targetMutatePatterns);
            expect([...result.filesToMutate.keys()]).to.deep.equal([]);
          });

          it('should not mutate if not targeted but within mutate patterns with specified lines', async () => {
            stubFileSystem({
              'mute1.js': 'file content',
            });
            testInjector.options.mutate = ['mute1.js:1-2'];
            const sut = createSut();
            const targetMutatePatterns: string[] = [];
            const result = await sut.read(targetMutatePatterns);
            expect([...result.filesToMutate.keys()]).to.deep.equal([]);
          });

          it('should not mutate if targeted but file not within mutate pattern', async () => {
            stubFileSystem({
              'mute1.js': 'file content',
            });
            testInjector.options.mutate = [];
            const sut = createSut();
            const targetMutatePatterns: string[] = ['mute1.js'];
            const result = await sut.read(targetMutatePatterns);
            expect([...result.filesToMutate.keys()]).to.deep.equal([]);
          });

          it('should not mutate if targeted with specified lines but file not within mutate pattern', async () => {
            stubFileSystem({
              'mute1.js': 'file content',
            });
            testInjector.options.mutate = [];
            const sut = createSut();
            const targetMutatePatterns: string[] = ['mute1.js:1-2'];
            const result = await sut.read(targetMutatePatterns);
            expect([...result.filesToMutate.keys()]).to.deep.equal([]);
          });
        });
      });
    });
  });

  describe('incremental report', () => {
    it('should not be read if incremental = false', async () => {
      stubFileSystem({}); // empty dir
      const sut = createSut();
      await sut.read(undefined);
      sinon.assert.notCalled(fsMock.readFile);
    });
    it('should be read if incremental = true', async () => {
      testInjector.options.incremental = true;
      stubFileSystem({}); // empty dir
      const sut = createSut();
      await sut.read(undefined);
      sinon.assert.calledOnceWithExactly(
        fsMock.readFile,
        'reports/stryker-incremental.json',
        'utf-8',
      );
    });
    it('should be read when incremental = true and force = true', async () => {
      testInjector.options.incremental = true;
      testInjector.options.force = true;
      stubFileSystem({
        reports: {
          'stryker-incremental.json': JSON.stringify(
            factory.mutationTestReportSchemaMutationTestResult({}),
          ),
        },
      });
      const sut = createSut();
      const actualProject = await sut.read(undefined);
      expect(actualProject.incrementalReport).not.undefined;
      sinon.assert.calledOnceWithExactly(
        fsMock.readFile,
        'reports/stryker-incremental.json',
        'utf-8',
      );
    });
    it('should handle file not found correctly', async () => {
      // Arrange
      testInjector.options.incremental = true;
      stubFileSystem({}); // empty dir
      const sut = createSut();

      // Act
      const actualProject = await sut.read(undefined);

      // Assert
      expect(actualProject.incrementalReport).undefined;
      sinon.assert.calledWithExactly(
        testInjector.logger.info,
        'No incremental result file found at %s, a full mutation testing run will be performed.',
        'reports/stryker-incremental.json',
      );
    });
    it('should be corrected for file locations', async () => {
      // Arrange
      testInjector.options.incremental = true;
      stubFileSystem({
        reports: {
          'stryker-incremental.json': JSON.stringify(
            factory.mutationTestReportSchemaMutationTestResult({
              files: {
                'foo.js': factory.mutationTestReportSchemaFileResult({
                  mutants: [
                    factory.mutationTestReportSchemaMutantResult({
                      location: {
                        start: { line: 1, column: 2 },
                        end: { line: 3, column: 4 },
                      },
                    }),
                  ],
                }),
              },
              testFiles: {
                'foo.spec.js': factory.mutationTestReportSchemaTestFile({
                  tests: [
                    factory.mutationTestReportSchemaTestDefinition({
                      location: undefined,
                    }),
                    factory.mutationTestReportSchemaTestDefinition({
                      location: { start: { line: 1, column: 2 } },
                    }),
                    factory.mutationTestReportSchemaTestDefinition({
                      location: {
                        start: { line: 3, column: 4 },
                        end: { line: 5, column: 6 },
                      },
                    }),
                  ],
                }),
              },
            }),
          ),
        },
      });
      const sut = createSut();

      // Act
      const actualProject = await sut.read(undefined);

      // Assert
      const expected = factory.mutationTestReportSchemaMutationTestResult({
        files: {
          'foo.js': factory.mutationTestReportSchemaFileResult({
            mutants: [
              factory.mutationTestReportSchemaMutantResult({
                location: {
                  start: { line: 0, column: 1 },
                  end: { line: 2, column: 3 },
                }, // Stryker works 0-based internally
              }),
            ],
          }),
        },
        testFiles: {
          'foo.spec.js': factory.mutationTestReportSchemaTestFile({
            tests: [
              factory.mutationTestReportSchemaTestDefinition({
                location: undefined,
              }),
              factory.mutationTestReportSchemaTestDefinition({
                location: { start: { line: 0, column: 1 }, end: undefined },
              }),
              factory.mutationTestReportSchemaTestDefinition({
                location: {
                  start: { line: 2, column: 3 },
                  end: { line: 4, column: 5 },
                },
              }),
            ],
          }),
        },
      });
      expect(actualProject.incrementalReport).deep.eq(expected);
    });
    it('should respect the incremental file location', async () => {
      testInjector.options.incremental = true;
      testInjector.options.incrementalFile = 'some/other/file.json';
      stubFileSystem({}); // empty dir
      const sut = createSut();
      await sut.read(undefined);
      sinon.assert.calledOnceWithExactly(
        fsMock.readFile,
        'some/other/file.json',
        'utf-8',
      );
    });
  });

  function mutateRange(
    startLine: number,
    startColumn: number,
    endLine: number,
    endColumn: number,
  ): MutationRange {
    return {
      start: { line: startLine, column: startColumn },
      end: { line: endLine, column: endColumn },
    };
  }

  function createSut() {
    return testInjector.injector
      .provideValue(coreTokens.fs, fsMock)
      .injectClass(ProjectReader);
  }

  type DirectoryEntry = string | { [name: string]: DirectoryEntry };

  function stubFileSystem(dirEntry: DirectoryEntry, fullName = process.cwd()) {
    if (typeof dirEntry === 'string') {
      fsMock.readFile.withArgs(fullName).resolves(dirEntry);
      const relativeName = path.relative(process.cwd(), fullName);
      // Make sure both forward slash and backslashes are stubbed on windows os's
      fsMock.readFile.withArgs(relativeName).resolves(dirEntry);
      fsMock.readFile
        .withArgs(normalizeFileName(relativeName))
        .resolves(dirEntry);
    } else {
      fsMock.readdir.withArgs(fullName, sinon.match.object).resolves(
        Object.entries(dirEntry).map(
          ([name, value]) =>
            createDirent({
              name,
              isDirectory: typeof value !== 'string',
            }) as unknown as Dirent<Buffer<ArrayBufferLike>>,
        ),
      );
      Object.entries(dirEntry).map(([name, value]) =>
        stubFileSystem(value, path.resolve(fullName, name)),
      );
    }
    fsMock.readFile.rejects(factory.fileNotFoundError());
  }
});
