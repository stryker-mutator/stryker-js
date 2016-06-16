import FileReportPage from './pageObjects/FileReportPage';
import MutantSelection from './pageObjects/MutantSelection';
import * as path from 'path';
import {expect} from 'chai';

describe.only('File report page "Circle.js.html"', () => {

  let page: FileReportPage;

  let forAllMutantSelections = (fn: (mutantSelection: MutantSelection) => any) => {
    for (let i = 0; i < 6; i++) {
      fn(page.mutationButton(i));
    }
  }

  let get = () => {
    let f = `file:///${path.resolve(path.join(__dirname, '../../reports/mutation/html/Circle.js.html')).replace(/\\/g, '/')}`;
    return browser.get(f);
  }

  beforeEach(() => {
    get();
    page = new FileReportPage();
  });

  it('should show title "Circle.js"', () => {
    return expect(page.title()).to.eventually.be.eq('Circle.js - Stryker report');
  });

  it('should show 6 mutants in the file', () => {
    return expect(page.mutationButtonCount()).to.eventually.be.eq(6);
  });

  it('should not strikethrough any of the original code lines', () => forAllMutantSelections(selection => expect(selection.originalCodeTextDecoration()).to.eventually.equal('none')));

  it('should not diaplay any of the mutated code', () => forAllMutantSelections(selection => expect(selection.originalCodeTextDecoration()).to.eventually.equal('none')));

  describe('when first mutant is enabled', () => {

    beforeEach(() => page.mutationButton(0).enableMutant());

    it('should strikethrough the originalCode', () => {
      expect(page.mutationButton(0).originalCodeTextDecoration()).to.eventually.eq('strykethrough');
    })

  });
});

