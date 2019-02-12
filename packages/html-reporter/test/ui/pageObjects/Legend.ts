import { ElementFinder } from 'protractor';
import { MutantStatus } from '@stryker-mutator/api/report';
import Checkbox from './Checkbox';

export default class Legend {
  constructor(private readonly host: ElementFinder) { }

  public displayButton(mutantState: MutantStatus): Checkbox {
    return new Checkbox(this.host.$(`input[value="${mutantState}"]`));
  }
}
