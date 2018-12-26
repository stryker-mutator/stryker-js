import { $ } from 'protractor';
import Page from './Page';
import ResultTable from './ResultTable';

export default class DirectoryReportPage extends Page {

  public resultTable = () => new ResultTable($('.totals table'));
  public strykerImageLocation = () => $('.stryker-image').getLocation();

  public strykerImageSize = () => $('.stryker-image').getSize();

  // Don't use elements.all(...).map directly as the implementation is broken in protractor when putting the same element as property of the new object

}
