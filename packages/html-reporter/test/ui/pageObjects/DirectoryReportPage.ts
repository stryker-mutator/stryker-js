import ResultTable from './ResultTable';
import { $ } from 'protractor';
import Page from './Page';

export default class DirectoryReportPage extends Page {

  public strykerImageSize = () => $('.stryker-image').getSize();
  public strykerImageLocation = () => $('.stryker-image').getLocation();

  public resultTable = () => new ResultTable($('.totals table'));

  // Don't use elements.all(...).map directly as the implementation is broken in protractor when putting the same element as property of the new object

}
