import { ElementFinder } from 'protractor';
import { MutantStatus } from 'stryker-api/report';
import Checkbox from './Checkbox';

export default class Legend {
  constructor(private host: ElementFinder) {
  }

  displayButton(mutantState: MutantStatus): Checkbox {
    return new Checkbox(this.host.$(`input[value="${mutantState}"]`));
  }
}