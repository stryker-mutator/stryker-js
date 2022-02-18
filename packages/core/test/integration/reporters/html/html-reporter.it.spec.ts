import fs from 'fs';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { HtmlReporter } from '../../../../src/reporters/html-reporter.js';
import { fileUtils } from '../../../../src/utils/file-utils.js';

import { simpleReport } from './simple-report.js';

describe('HtmlReporter with example math project', () => {
  it('should have created the "index.html" file in the configured directory', async () => {
    const fileName = 'reports/mutation/math.html';
    testInjector.options.htmlReporter = { fileName };
    const sut = testInjector.injector.injectClass(HtmlReporter);
    sut.onMutationTestReportReady(simpleReport);
    await sut.wrapUp();
    expect(await fileUtils.exists(fileName), `file ${fileName} does not exist`).true;
    const bindMutationTestReportContent = await fs.promises.readFile(fileName, 'utf8');
    expect(bindMutationTestReportContent).include(JSON.stringify(simpleReport));
  });
});
