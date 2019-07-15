import * as fs from 'fs';
import { expect } from 'chai';
import HtmlReporter from '../../src/HtmlReporter';
import { TEST_INJECTOR } from '@stryker-mutator/test-helpers';
import { SIMPLE_REPORT } from './simpleReport';

describe('HtmlReporter with example math project', () => {
  let sut: HtmlReporter;
  const baseDir = 'reports/mutation/math';

  beforeEach(async () => {
    TEST_INJECTOR.options.htmlReporter = { baseDir };
    sut = TEST_INJECTOR.injector.injectClass(HtmlReporter);
    sut.onMutationTestReportReady(SIMPLE_REPORT);
    await sut.wrapUp();
  });

  it('should have created "index.html", "mutation-test-elements.js", "stryker-80x80.png" and "bind-mutation-test-report.js" file in the configured directory', () => {
    expectFileExists(`${baseDir}/index.html`, true);
    expectFileExists(`${baseDir}/stryker-80x80.png`, true);
    expectFileExists(`${baseDir}/mutation-test-elements.js`, true);
    expectFileExists(`${baseDir}/bind-mutation-test-report.js`, true);
    const bindMutationTestReportContent = fs.readFileSync(`${baseDir}/bind-mutation-test-report.js`, 'utf8');
    expect(bindMutationTestReportContent).include(JSON.stringify(SIMPLE_REPORT));
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
