import FileReportPage from './pageObjects/FileReportPage';
import MutantSelection from './pageObjects/MutantSelection';
import * as path from 'path';
import {expect} from 'chai';

describe.only('File report page "Circle.js.html"', () => {

  let page: FileReportPage;

  let forAllMutantSelections = (fn: (mutantSelection: MutantSelection) => any) => {
    for (let i = 0; i < 6; i++) {
      fn(page.mutantSelection(i));
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

  it('should not "line-through" any of the original code lines', () => forAllMutantSelections(selection => expect(selection.originalCodeTextDecoration()).to.eventually.equal('none')));

  it('should not display any of the mutated code', () => forAllMutantSelections(selection => expect(selection.originalCodeTextDecoration()).to.eventually.equal('none')));

  it('should have 2 killed mutants and 4 survived', () => {
    expect(page.mutantSelection(0).mutantStatusAnnotation()).to.eventually.eq('success');
    expect(page.mutantSelection(1).mutantStatusAnnotation()).to.eventually.eq('danger');
    expect(page.mutantSelection(2).mutantStatusAnnotation()).to.eventually.eq('success');
    expect(page.mutantSelection(3).mutantStatusAnnotation()).to.eventually.eq('danger');
    expect(page.mutantSelection(4).mutantStatusAnnotation()).to.eventually.eq('danger');
    expect(page.mutantSelection(5).mutantStatusAnnotation()).to.eventually.eq('danger');
  });

  it('should hide killed mutants', () => {
    expect(page.mutantSelection(0).isButtonVisible()).to.eventually.eq(false);
    expect(page.mutantSelection(2).isButtonVisible()).to.eventually.eq(false);
  });

  it('should show survived mutants', () => {
    expect(page.mutantSelection(1).isButtonVisible()).to.eventually.eq(true);
    expect(page.mutantSelection(3).isButtonVisible()).to.eventually.eq(true);
    expect(page.mutantSelection(4).isButtonVisible()).to.eventually.eq(true);
    expect(page.mutantSelection(5).isButtonVisible()).to.eventually.eq(true);
  });

  describe('when "Also show killed mutants" is enabled', () => {
    beforeEach(() => page.displayKilledCheckbox().click());

    it('should also show the killed mutants', () => {
      expect(page.mutantSelection(0).isButtonVisible()).to.eventually.eq(true);
      expect(page.mutantSelection(2).isButtonVisible()).to.eventually.eq(true);
    });

    describe('and a killed mutant is enabled', () => {
      beforeEach(() => page.mutantSelection(0).enableMutant());

      it('should "line-through" the original code', () => {
        expect(page.mutantSelection(0).originalCodeTextDecoration()).to.eventually.eq('line-through');
      });

      describe('and later the "Also show killed mutants" button is disabled', () => {
        beforeEach(() => page.displayKilledCheckbox().click());

        it('should have removed the "line-through" from the mutant\'s original code', () => {
          expect(page.mutantSelection(0).originalCodeTextDecoration()).to.eventually.eq('none');
        });

        it('should hide the killed mutants', () => {
          expect(page.mutantSelection(0).isButtonVisible()).to.eventually.eq(false);
          expect(page.mutantSelection(2).isButtonVisible()).to.eventually.eq(false);
        });
      });
    });
  });

  describe('when first mutant is enabled', () => {

    beforeEach(() => page.mutantSelection(1).enableMutant());

    it('should "line-through" the originalCode', () => {
      expect(page.mutantSelection(1).originalCodeTextDecoration()).to.eventually.eq('line-through');
    });

    it('should show the mutated code', () => {
      expect(page.mutantSelection(1).isMutantReplacementCodeVisible()).to.eventually.eq(true);
    });

    describe('and later disabled', () => {

      beforeEach(() => page.mutantSelection(1).enableMutant());

      it('should remove the "line-through" from the original code', () => {
        expect(page.mutantSelection(1).originalCodeTextDecoration()).to.eventually.eq('none');
      });

      it('should hide the mutated code', () => {
        expect(page.mutantSelection(1).isMutantReplacementCodeVisible()).to.eventually.eq(false);
      });
    });
  });
});

