
export default class MutantSelection {
  constructor(private button: protractor.ElementFinder, private originalCodeSpan: protractor.ElementFinder, private mutantReplacementSpan: protractor.ElementFinder){}

  mutantId = () => this.button.getAttribute('data-mutant');

  mutantReplacementCode = () => this.mutantReplacementSpan.isDisplayed();
  originalCodeTextDecoration = () => this.originalCodeSpan.getCssValue('text-decoration');
  mutantStatusAnnotation = () => this.button.getAttribute('data-mutant-status-annotation');
  
  enableMutant = () => this.button.click();
}