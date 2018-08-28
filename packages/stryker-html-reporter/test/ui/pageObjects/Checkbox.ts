import { ElementFinder } from 'protractor';

export default class Checkbox {
  constructor(private readonly host: ElementFinder) { }

  public isChecked() {
    return this.host.getAttribute('checked').then(val => !!val);
  }

  public click() {
    return this.host.click();
  }
}
