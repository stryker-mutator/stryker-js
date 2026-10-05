import fs from 'fs';
import os from 'os';
import path from 'path';

import { expect } from 'chai';

import { isStale } from './check-injected-deps.js';

describe(isStale.name, () => {
  /** @type {string} */
  let tmpDir;
  /** @type {string} */
  let sourceDist;
  /** @type {string} */
  let injectedDist;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-injected-deps-'));
    sourceDist = path.join(tmpDir, 'source', 'dist');
    injectedDist = path.join(tmpDir, 'injected', 'dist');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  /**
   * @param {string} dir
   * @param {string} relative
   * @param {string} content
   */
  function writeFile(dir, relative, content) {
    const file = path.join(dir, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }

  it('should not be stale when the copy is still hard-linked to the source', () => {
    writeFile(sourceDist, 'src/index.js', 'export {};');
    fs.mkdirSync(path.join(injectedDist, 'src'), { recursive: true });
    fs.linkSync(
      path.join(sourceDist, 'src/index.js'),
      path.join(injectedDist, 'src/index.js'),
    );

    expect(isStale(sourceDist, injectedDist)).false;
  });

  it('should not be stale when an unlinked copy has the same content', () => {
    writeFile(sourceDist, 'src/index.js', 'export {};');
    writeFile(injectedDist, 'src/index.js', 'export {};');

    expect(isStale(sourceDist, injectedDist)).false;
  });

  it('should be stale when the copy differs from the source', () => {
    writeFile(sourceDist, 'src/index.js', 'export const a = 1;');
    writeFile(injectedDist, 'src/index.js', 'export const a = 2;');

    expect(isStale(sourceDist, injectedDist)).true;
  });

  it('should be stale when a copied file is missing from the source', () => {
    writeFile(sourceDist, 'src/index.js', 'export {};');
    writeFile(injectedDist, 'src/index.js', 'export {};');
    writeFile(injectedDist, 'src/removed.js', 'export {};');

    expect(isStale(sourceDist, injectedDist)).true;
  });

  it('should be stale when the copy has no output but the source does (installed before the first build)', () => {
    writeFile(sourceDist, 'src/index.js', 'export {};');

    expect(isStale(sourceDist, injectedDist)).true;
  });

  it('should not be stale when neither the source nor the copy has output', () => {
    expect(isStale(sourceDist, injectedDist)).false;
  });
});
