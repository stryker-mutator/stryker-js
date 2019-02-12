import { ElementFinder } from 'protractor';

export default class MutantSelection {
  constructor(private readonly button: ElementFinder, private readonly originalCodeSpan: ElementFinder, private readonly mutantReplacementSpan: ElementFinder) { }

  public mutantId = () => this.button.getAttribute('data-mutant');

  public isMutantReplacementCodeVisible = () => this.mutantReplacementSpan.isDisplayed();
  public originalCodeTextDecoration = () => this.originalCodeSpan.getCssValue('text-decoration')
    .then(textDecoration => /* like "none solid rgb(68, 68, 68)" */ textDecoration.split(' ')[0])
  public mutantStatusAnnotation = () => this.button.getAttribute('data-mutant-status-annotation');
  public originalCode = () => this.originalCodeSpan.getText();
  public isButtonVisible = () => this.button.isDisplayed();

  public enableMutant = () => this.button.click();
}
