import ResultTable from './ResultTable';
import { browser, by, $ } from 'protractor';

export default class DirectoryReportPage {

  title = () => browser.element(by.tagName('h1')).getText();

  strykerImageSize = () => $('.stryker-image').getSize();
  strykerImageLocation = () => $('.stryker-image').getLocation();

  resultTable = () => new ResultTable($('.totals table'));

  // Don't use elements.all(...).map directly as the implementation is broken in protractor when putting the same element as property of the new object

}
