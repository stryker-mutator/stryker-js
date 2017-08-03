import * as path from 'path';
import HtmlReporter from '../../src/HtmlReporter';
import { browser } from 'protractor';
import EventPlayer from '../helpers/EventPlayer';

export const baseDir = path.join(__dirname, '../../reports/mutation/uiTest');

before(() => {
  browser.ignoreSynchronization = true;
  const reporter = new HtmlReporter({ htmlReporter: { baseDir } });
  return new EventPlayer('testResources/mathEvents')
    .replay(reporter)
    .then(() => reporter.wrapUp());
});