import { ElementFinder } from 'protractor';

export default class MutantSelection {
  constructor(private button: ElementFinder, private originalCodeSpan: ElementFinder, private mutantReplacementSpan: ElementFinder) { }

  mutantId = () => this.button.getAttribute('data-mutant');

  isMutantReplacementCodeVisible = () => this.mutantReplacementSpan.isDisplayed();
  originalCodeTextDecoration = () => this.originalCodeSpan.getCssValue('text-decoration')
    .then(textDecoration => /* like "none solid rgb(68, 68, 68)" */ textDecoration.split(' ')[0])
  mutantStatusAnnotation = () => this.button.getAttribute('data-mutant-status-annotation');
  originalCode = () => this.originalCodeSpan.getText();
  isButtonVisible = () => this.button.isDisplayed();

  enableMutant = () => this.button.click();
}