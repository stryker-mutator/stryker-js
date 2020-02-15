import * as path from 'path';

import { expect } from 'chai';

import InputFileSystem from '../../src/fs/InputFileSystem';

function testResourcePath(...pathSegments: string[]) {
  return path.resolve(__dirname, '..', '..', 'testResources', ...pathSegments);
}

describe('InputFileSystem integration', () => {
  let sut: InputFileSystem;

  beforeEach(() => {
    sut = new InputFileSystem();
  });

  it('should be able to list all physical directories', done => {
    const tempFile = testResourcePath('inputFileSystem', 'dir1', 'tempFile');
    sut.writeFileSync(tempFile, 'some content');
    sut.readdir(testResourcePath('inputFileSystem'), (err, dirs) => {
      if (err) {
        done(err);
      } else if (!dirs) {
        done('no dirs');
      } else {
        // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
        dirs.sort();
        expect(dirs).deep.eq(['dir1', 'dir2', 'dir3']);
        done();
      }
    });

    it('should be able to stat a dir', done => {
      testResourcePath('inputFileSystem', 'dir1', 'tempFile');
      sut.stat(testResourcePath('inputFileSystem', 'dir2'), (err, stats: any) => {
        if (err) {
          done(err);
        } else {
          expect(stats.isDirectory()).ok;
          done();
        }
      });
    });
  });
});
