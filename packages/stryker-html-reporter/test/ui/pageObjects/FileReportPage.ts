import ProgressBar from './ProgressBar';
import MutantSelection from './MutantSelection';

export default class FilePage {

  constructor() { }

  title = () => $('h1').getText();

  mutationButtonCount = () => element.all(by.css('.stryker-mutant-button')).count();
  mutantSelection = (index: number) => new MutantSelection($(`.stryker-mutant-button[data-mutant="${index}"]`), $(`.stryker-original-code[data-mutant="${index}"]`), $(`.stryker-mutant-replacement[data-mutant="${index}"]`));
  displayKilledCheckbox = () => $('.stryker-display-killed');
}