import { ElementFinder, by } from 'protractor';

export default class Breadcrumb {
  constructor(private readonly host: ElementFinder) { }

  public items() {
    return this.host.$$('li').map(item => (item as ElementFinder).getText());
  }

  public navigate(to: string) {
    return this.host.element(by.linkText(to)).click();
  }
}
