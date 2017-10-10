import * as path from 'path';
import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import EventPlayer from '../helpers/EventPlayer';
import HtmlReporter from '../../src/HtmlReporter';
import { readDirectoryTree } from '../helpers/fsHelpers';
import { fs } from 'mz';

const REPORT_DIR = 'reports/mutation/singleFileInFolder';

describe('HtmlReporter single file in a folder', () => {
  let sut: HtmlReporter;

  beforeEach(() => {
    const config = new Config();
    config.set({ htmlReporter: { baseDir: REPORT_DIR } });
    sut = new HtmlReporter(config);
    return new EventPlayer(path.join('testResources', 'singleFileInFolder'))
      .replay(sut)
      .then(() => sut.wrapUp());
  });

  it('should build all files in the report', () => {
    const dir = readDirectoryTree(REPORT_DIR);
    expect(dir).to.be.deep.include({
      'Array.js.html': 'Array.js.html',
      'index.html': 'index.html',
    });
    expect(dir.math).deep.eq({
      'Add.js.html': 'Add.js.html'
    });
    expect(fs.readFileSync(path.resolve(REPORT_DIR, 'math', 'Add.js.html'), 'utf8')).contains('"../__resources/bootstrap/css/bootstrap.min.css"');
  });
});