import { ElementFinder } from 'protractor';

export default class Checkbox {
  constructor(private host: ElementFinder) { }

  isChecked() {
    return this.host.getAttribute('checked').then(val => !!val);
  }

  click() {
    return this.host.click();
  }
}