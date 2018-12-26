import { browser, by, element } from 'protractor';

export class AppPage {
  public getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }
  public navigateTo() {
    return browser.get('/');
  }
}
