import { $ } from 'protractor';
import Breadcrumb from './Breadcrumb';

export default abstract class Page {

  get breadcrumb() {
    return new Breadcrumb($('.breadcrumb'));
  }

  title() {
    return $('h1').getText();
  }
}