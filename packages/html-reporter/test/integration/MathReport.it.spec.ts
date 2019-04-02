import * as fs from 'fs';
import { expect } from 'chai';
import HtmlReporter from '../../src/HtmlReporter';
import { testInjector } from '@stryker-mutator/test-helpers';
import { simpleReport } from './simpleReport';

describe('HtmlReporter with example math project', () => {
  let sut: HtmlReporter;
  const baseDir = 'reports/mutation/math';

  beforeEach(async () => {
    testInjector.options.htmlReporter = { baseDir };
    sut = testInjector.injector.injectClass(HtmlReporter);
    sut.onMutationTestReportReady(simpleReport);
    await sut.wrapUp();
  });

  it('should have created "index.html", "mutation-test-elements.js" and "stryker-80x80.png" file in the configured directory', () => {
    expectFileExists(`${baseDir}/index.html`, true);
    expectFileExists(`${baseDir}/stryker-80x80.png`, true);
    expectFileExists(`${baseDir}/mutation-test-elements.js`, true);
  });
});

function expectFileExists(file: string, expected: boolean) {
  try {
    fs.readFileSync(file);
    expect(expected, `file ${file} does not exist`).to.be.true;
  } catch (err) {
    expect(expected, `file ${file} exists`).to.be.false;
  }
}
