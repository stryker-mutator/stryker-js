import * as path from 'path';
import { baseDir } from './hooks';
import { browser } from 'protractor';
import DirectoryReportPage from './pageObjects/DirectoryReportPage';
import FileReportPage from './pageObjects/FileReportPage';
import { expect } from 'chai';

describe('Navigation', () => {

  let directoryPage: DirectoryReportPage;
  let filePage: FileReportPage;

  const get = (page: string) => {
    const f = `file:///${path.resolve(baseDir, page).replace(/\\/g, '/')}`;
    return browser.get(f);
  };

  const itShouldShowAllFilesPage = () => {
    it('should show "all files"', () => {
      expect(directoryPage.title()).eventually.eq('All files - Stryker report');
    });
  };

  beforeEach(() => {
    directoryPage = new DirectoryReportPage();
    filePage = new FileReportPage();
  });

  describe('when starting at the index page', () => {
    beforeEach(() => {
      get('index.html');
    });

    itShouldShowAllFilesPage();

    describe('and I navigate to "Circle.js.html', () => {

      beforeEach(() => {
        return directoryPage.resultTable().row('Circle.js').then(row => row.navigate() as any);
      });

      it('should show "Circle.js" page', () => {
        expect(filePage.title()).eventually.eq('Circle.js - Stryker report');
      });

      it('should show breadcrumb "All files - Circle.js"', () => {
        expect(filePage.breadcrumb.items()).eventually.deep.equal(['All files', 'Circle.js']);
      });

      describe('when navigating to "All files" using the breadcrumb', () => {
        beforeEach(() => {
          return filePage.breadcrumb.navigate('All files');
        });

        itShouldShowAllFilesPage();
      });
    });
  });
});
