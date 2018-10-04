import * as path from 'path';
import { expect } from 'chai';
import DirectoryReportPage from './pageObjects/DirectoryReportPage';
import { browser } from 'protractor';
import { baseDir } from './hooks';

describe('Directory results page', () => {

  function get() {
    const f = `file:///${path.resolve(baseDir, 'index.html').replace(/\\/g, '/')}`;
    browser.get(f);
  }

  let page: DirectoryReportPage;
  beforeEach(() => {
    get();
    page = new DirectoryReportPage();
  });

  it(`should have title "All files - Stryker report"`, () => {
    return expect(page.title()).to.eventually.eq(`All files - Stryker report`);
  });

  it('should show the "stryker-image"', async () => {
    const size = await page.strykerImageSize();
    expect(size.width).to.eq(80);
    expect(size.height).to.eq(80);
  });

  it('should position the image on the top right', async () => {
    const location = await page.strykerImageLocation();
    expect(location.y).to.be.lessThan(10);
    expect(location.x).to.be.greaterThan(50);
  });

  describe('the results table', () => {

    it('should show 3 rows in the result table', () => {
      return expect(page.resultTable().rows().then(rows => rows.length)).to.eventually.eq(3);
    });

    it('should show "all files" with "69.57%" mutation score', async () => {
      return page.resultTable().row('All files').then(allFilesRow => {
        return expect(allFilesRow.progressBar().percentageText()).to.eventually.eq('69.57 %');
      });
    });

    it('should show circle.js in the correct way', async () => {
      const circleRow = await page.resultTable().row('Circle.js');
      return Promise.all([
        expect(circleRow.progressBar().percentageText()).to.eventually.be.eq('33.33 %'),
        expect(circleRow.mutationScore()).to.eventually.be.eq('33.33'),
        expect(circleRow.killed()).to.eventually.be.eq('2'),
        expect(circleRow.survived()).to.eventually.be.eq('2'),
        expect(circleRow.timeout()).to.eventually.be.eq('0'),
        expect(circleRow.noCoverage()).to.eventually.be.eq('2'),
        expect(circleRow.runtimeErrors()).to.eventually.be.eq('0'),
        expect(circleRow.totalDetected()).to.eventually.be.eq('2'),
        expect(circleRow.totalUndetected()).to.eventually.be.eq('4'),
        expect(circleRow.totalMutants()).to.eventually.be.eq('6')]);
    });
  });
});
