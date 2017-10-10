import MutantSelection from './MutantSelection';
import { element, by, $ } from 'protractor';
import Legend from './Legend';
import Page from './Page';

export default class FilePage extends Page {

  mutationButtonCount = () => element.all(by.css('.stryker-mutant-button')).count();
  mutantSelection = (index: number) => new MutantSelection($(`.stryker-mutant-button[data-mutant="${index}"]`), $(`.stryker-original-code[data-mutant="${index}"]`), $(`.stryker-mutant-replacement[data-mutant="${index}"]`));

  get legend() {
    return new Legend($('.legend'));
  }
}