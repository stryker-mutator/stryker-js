import { browser, by, element } from 'protractor';
import {Page} from './page';

export class CatalogusPage extends Page {

  getEmptyCatalogusMessage() {
    return element(by.css('#catalogus h5')).getText();
  }
}
