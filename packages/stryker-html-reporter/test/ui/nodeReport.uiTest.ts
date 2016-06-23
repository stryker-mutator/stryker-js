import NodePage from './pageObjects/NodePage';
import FinegrainedResult from './pageObjects/FinegrainedResult';
import * as path from 'path';
import {expect} from 'chai';

describe('Node results page', () => {

  function get() {
    let f = `file:///${path.resolve(path.join(__dirname, '../../reports/mutation/html/index.html')).replace(/\\/g, '/')}`;
    browser.get(f);
  }

  let page: NodePage;
  before(() => {
    get();
    page = new NodePage();
  });

  // it('should have title "\src - Stryker report"', () => {
  //   return expect(page.title).to.eventually.eq('\src - Stryker report');
  // });

  it('should show the "stryker-image"', () => {
    return (<any>expect(page.strykerImageSize).to.eventually).equalData({ width: 80, height: 80 });
  });

  it('should position the image on the top right', () => {
    return expect(page.strykerImageLocation).to.eventually.satisfy((loc: webdriver.ILocation) => {
      expect(loc.y).to.be.lessThan(10);
      expect(loc.x).to.be.greaterThan(50);
      return true;
    });
  });

  describe('and looking at the "totals" progress bar', () => {
    it('should show "77%"', () => {
      return expect(page.totalsBar.percentageText).to.eventually.eq('77%');
    });

    it('should set the width to 77%', () => {
      return expect(page.totalsBar.relativeBarWidth).to.eventually.be.within(75, 78); // allow for rounding errors
    });
    
  });

  describe('when looking at the "finegrained" results table', () => {
    it('should show 2 records', () => {
      return expect(page.fingrainedResults.then(results => results.length)).to.eventually.eq(2);
    });
    it('show "circle.js" "33%" "2/6" "66%" and "2/3" on the second row', () => {
      return expect(page.fingrainedResults.then(results => results[1])).to.eventually.satisfy((result: FinegrainedResult) => {
        expect(result.name).to.eventually.be.eq('Circle.js');
        expect(result.progressBar.percentageText).to.eventually.be.eq('33%');
        expect(result.scoreBasedOnAllCode).to.eventually.be.eq('2/6');
        expect(result.percentageBasedOnCodeCoverage).to.eventually.be.eq('66%');
        expect(result.scoreBasedOnCodeCoverage).to.eventually.be.eq('2/3');
        return true;
      });
    });
  });
});

