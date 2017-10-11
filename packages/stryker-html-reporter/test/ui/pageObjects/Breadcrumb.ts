import { ElementFinder, by } from 'protractor';

export default class Breadcrumb {
  constructor(private host: ElementFinder) { }

  items() {
    return this.host.$$('li').map(item => (item as ElementFinder).getText());
  }

  navigate(to: string) {
    return this.host.element(by.linkText(to)).click();
  }
}