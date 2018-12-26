import { $ } from 'protractor';
import Breadcrumb from './Breadcrumb';

export default abstract class Page {

  public get breadcrumb() {
    return new Breadcrumb($('.breadcrumb'));
  }

  public title() {
    return $('h1').getText();
  }
}
