import { ElementFinder } from 'protractor';

export default class MutantSelection {
  constructor(private readonly button: ElementFinder, private readonly originalCodeSpan: ElementFinder, private readonly mutantReplacementSpan: ElementFinder) { }

  public enableMutant = () => this.button.click();
  public isButtonVisible = () => this.button.isDisplayed();

  public isMutantReplacementCodeVisible = () => this.mutantReplacementSpan.isDisplayed();

  public mutantId = () => this.button.getAttribute('data-mutant');
  public mutantStatusAnnotation = () => this.button.getAttribute('data-mutant-status-annotation');
  public originalCode = () => this.originalCodeSpan.getText();
  public originalCodeTextDecoration = () => this.originalCodeSpan.getCssValue('text-decoration')
    .then(textDecoration => /* like "none solid rgb(68, 68, 68)" */ textDecoration.split(' ')[0])
}
