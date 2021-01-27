import * as fs from 'fs';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { HtmlReporter } from '../../../../src/reporters/html/html-reporter';

import { simpleReport } from './simple-report';

describe('HtmlReporter with example math project', () => {
  let sut: HtmlReporter;
  const baseDir = 'reports/mutation/math';

  beforeEach(async () => {
    testInjector.options.htmlReporter = { baseDir };
    sut = testInjector.injector.injectClass(HtmlReporter);
    sut.onMutationTestReportReady(simpleReport);
    await sut.wrapUp();
  });

  it('should have created the "index.html" file in the configured directory', () => {
    expectFileExists(`${baseDir}/index.html`, true);
    const bindMutationTestReportContent = fs.readFileSync(`${baseDir}/index.html`, 'utf8');
    expect(bindMutationTestReportContent).include(JSON.stringify(simpleReport));
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
