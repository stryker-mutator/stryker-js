import { browser, by, element } from 'protractor';

export class Page {
  navigateTo() {
    browser.get('/catalogus');
  }

  getBanner() {
    return element(by.id('banner'));
  }

  getFooter() {
    return element(by.css('footer address'));
  }

  getWinkelwagen() {
   return element(by.className('nav-cart'));
  }

  getMenuItems() {
    return element(by.className('menu-item'));
  }
}
