import { ElementFinder } from 'protractor';

export default class Checkbox {
  constructor(private readonly host: ElementFinder) { }

  public click() {
    return this.host.click();
  }

  public isChecked() {
    return this.host.getAttribute('checked').then(val => !!val);
  }
}
