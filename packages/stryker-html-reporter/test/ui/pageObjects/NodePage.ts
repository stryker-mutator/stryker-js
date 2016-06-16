import ProgressBar from './ProgressBar';
import FinegrainedResult from './FinegrainedResult';

export default class NodePage {

  title = browser.element(by.tagName('h1')).getText();

  strykerImageSize = $('.stryker-image').getSize();
  strykerImageLocation = $('.stryker-image').getLocation();

  totalsBar = new ProgressBar(element(by.css('.totals .progress')));

  // Don't use elements.all(...).map directly as the implementation is broken in protractor when putting the same element as property of the new object
  fingrainedResults = element.all(by.css('.finegrained tbody tr'))
    .then(elements => elements.map(m => new FinegrainedResult(m)));
}
