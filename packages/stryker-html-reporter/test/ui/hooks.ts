import * as path from 'path';
import { browser } from 'protractor';
import { Config } from 'stryker-api/config';
import HtmlReporter from '../../src/HtmlReporter';
import EventPlayer from '../helpers/EventPlayer';

export const baseDir = path.join(__dirname, '../../reports/mutation/uiTest');

before(() => {
  browser.ignoreSynchronization = true;
  const config = new Config();
  config.set({ htmlReporter: { baseDir } });
  const reporter = new HtmlReporter(config);
  return new EventPlayer('testResources/mathEvents')
    .replay(reporter)
    .then(() => reporter.wrapUp());
});
