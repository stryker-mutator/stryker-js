import * as path from 'path';
import { expect } from 'chai';
import NodePage from './pageObjects/NodePage';
import ResultTableRow from './pageObjects/ResultTableRow';
import { browser } from 'protractor';
import { ILocation } from 'selenium-webdriver';

describe('Node results page', () => {

  function get() {
    let f = `file:///${path.resolve(path.join(__dirname, '../../reports/mutation/html/index.html')).replace(/\\/g, '/')}`;
    browser.get(f);
  }

  let page: NodePage;
  beforeEach(() => {
    get();
    page = new NodePage();
  });

  it(`should have title "${path.sep}sampleProject${path.sep}src - Stryker report"`, () => {
    return expect(page.title()).to.eventually.eq(`${path.sep}sampleProject${path.sep}src - Stryker report`);
  });

  it('should show the "stryker-image"', () => {
    return (<any>expect(page.strykerImageSize()).to.eventually).equalData({ width: 80, height: 80 });
  });

  it('should position the image on the top right', () => {
    return expect(page.strykerImageLocation()).to.eventually.satisfy((loc: ILocation) => {
      expect(loc.y).to.be.lessThan(10);
      expect(loc.x).to.be.greaterThan(50);
      return true;
    });
  });

  describe('and looking at the "totals" progress bar', () => {
    it('should show "77%"', () => {
      return expect(page.totalsBar().percentageText()).to.eventually.eq('77%');
    });

    it('should set the width to 77%', () => {
      return expect(page.totalsBar().relativeBarWidth()).to.eventually.be.within(75, 78); // allow for rounding errors
    });

  });

  describe('when looking at the "finegrained" results table', () => {
    it('should show 2 records', () => {
      return expect(page.fingrainedResults().then(results => results.length)).to.eventually.eq(2);
    });
    it('show "circle.js" "33%" "66%" "2/6" "2" "1" "0" "3" "0" "2" "4" and "6" on the second row', () => {
      return expect(page.fingrainedResults().then(results => results[1])).to.eventually.satisfy((result: ResultTableRow) => {
        expect(result.name()).to.eventually.be.eq('Circle.js');
        expect(result.progressBar().percentageText()).to.eventually.be.eq('33%');
        expect(result.mutationScore()).to.eventually.be.eq('2/6');
        expect(result.killed()).to.eventually.be.eq('2');
        expect(result.survived()).to.eventually.be.eq('1');
        expect(result.timeout()).to.eventually.be.eq('0');
        expect(result.noCoverage()).to.eventually.be.eq('3');
        expect(result.errors()).to.eventually.be.eq('0');
        expect(result.totalDetected()).to.eventually.be.eq('2');
        expect(result.totalUndetected()).to.eventually.be.eq('4');
        expect(result.totalMutants()).to.eventually.be.eq('6');
        return true;
      });
    });
  });
});

