import { $, by, element } from 'protractor';
import Legend from './Legend';
import MutantSelection from './MutantSelection';
import Page from './Page';

export default class FilePage extends Page {

  public get legend() {
    return new Legend($('.legend'));
  }
  public mutantSelection = (index: number) => new MutantSelection($(`.stryker-mutant-button[data-mutant="${index}"]`), $(`.stryker-original-code[data-mutant="${index}"]`), $(`.stryker-mutant-replacement[data-mutant="${index}"]`));

  public mutationButtonCount = () => element.all(by.css('.stryker-mutant-button')).count();
}
