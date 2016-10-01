
export default class MutantSelection {
  constructor(private button: protractor.ElementFinder, private originalCodeSpan: protractor.ElementFinder, private mutantReplacementSpan: protractor.ElementFinder) { }

  mutantId = () => this.button.getAttribute('data-mutant');

  isMutantReplacementCodeVisible = () => this.mutantReplacementSpan.isDisplayed();
  originalCodeTextDecoration = () => this.originalCodeSpan.getCssValue('text-decoration');
  mutantStatusAnnotation = () => this.button.getAttribute('data-mutant-status-annotation');
  isButtonVisible = () => this.button.isDisplayed();

  enableMutant = () => this.button.click();
}