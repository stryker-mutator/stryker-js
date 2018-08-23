import * as path from 'path';
import { expect } from 'chai';
import { browser } from 'protractor';
import { MutantStatus } from 'stryker-api/report';
import { baseDir } from './hooks';
import FileReportPage from './pageObjects/FileReportPage';
import MutantSelection from './pageObjects/MutantSelection';

describe('File report page "Add.js.html"', () => {

  let page: FileReportPage;

  const forAllMutantSelections = (fn: (mutantSelection: MutantSelection) => any) => {
    for (let i = 0; i < 6; i++) {
      fn(page.mutantSelection(i));
    }
  };

  const get = () => {
    const f = `file:///${path.resolve(baseDir, 'Add.js.html').replace(/\\/g, '/')}`;
    return browser.get(f);
  };

  beforeEach(() => {
    get();
    page = new FileReportPage();
  });

  it('should show title "Add.js"', () => {
    return expect(page.title()).to.eventually.be.eq('Add.js - Stryker report');
  });

  it('should show 7 mutants in the file', () => {
    return expect(page.mutationButtonCount()).to.eventually.be.eq(17);
  });

  it('should not "line-through" any of the original code lines', () => forAllMutantSelections(selection => expect(selection.originalCodeTextDecoration()).to.eventually.equal('none')));

  it('should not display any of the mutated code', () => forAllMutantSelections(selection => expect(selection.originalCodeTextDecoration()).to.eventually.equal('none')));

  it('should only display Survived and NoCoverage mutants', () => {
    expect(page.legend.displayButton(MutantStatus.Killed).isChecked()).to.eventually.false;
    expect(page.legend.displayButton(MutantStatus.Survived).isChecked()).to.eventually.true;
    expect(page.legend.displayButton(MutantStatus.NoCoverage).isChecked()).to.eventually.true;
    expect(page.legend.displayButton(MutantStatus.RuntimeError).isChecked()).to.eventually.false;
    expect(page.legend.displayButton(MutantStatus.TimedOut).isChecked()).to.eventually.false;
    expect(page.legend.displayButton(MutantStatus.TranspileError).isChecked()).to.eventually.false;
  });

  it('should hide killed mutants', () => {
    expect(page.mutantSelection(0).isButtonVisible()).to.eventually.eq(false);
    expect(page.mutantSelection(9).isButtonVisible()).to.eventually.eq(false);
  });

  it('should not mark the correct piece of code as original', () => {
    // Fix issue https://github.com/stryker-mutator/stryker-html-reporter/issues/5
    expect(page.mutantSelection(1).originalCode()).to.eventually.eq('num1 + num2');
  });

  it('should show Survived mutants', () => {
    expect(page.mutantSelection(1).isButtonVisible()).to.eventually.eq(true);
    expect(page.mutantSelection(6).isButtonVisible()).to.eventually.eq(true);
  });

  it('should show NoCoverage mutants', () => {
    expect(page.mutantSelection(5).isButtonVisible()).to.eventually.eq(true);
    expect(page.mutantSelection(7).isButtonVisible()).to.eventually.eq(true);
    expect(page.mutantSelection(8).isButtonVisible()).to.eventually.eq(true);
  });

  describe('when "Killed" is enabled', () => {
    beforeEach(() => page.legend.displayButton(MutantStatus.Killed).click());

    it('should also show the killed mutants', () => {
      expect(page.mutantSelection(0).isButtonVisible()).to.eventually.eq(true);
      expect(page.mutantSelection(9).isButtonVisible()).to.eventually.eq(true);
    });

    describe('and a killed mutant is enabled', () => {
      beforeEach(() => page.mutantSelection(0).enableMutant());

      it('should "line-through" the original code', () => {
        expect(page.mutantSelection(0).originalCodeTextDecoration()).to.eventually.eq('line-through');
      });

      describe('and later  "Killed" is disabled', () => {
        beforeEach(() => page.legend.displayButton(MutantStatus.Killed).click());

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
