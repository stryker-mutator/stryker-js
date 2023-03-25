import {Component, HostListener, Inject} from '@angular/core';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'ksw-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Kantishop';

  constructor(@Inject(DOCUMENT) document) {
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(e) {
    // @ts-expect-error
    if (window.pageYOffset > document.getElementById('banner').offsetHeight) {
      const element = document.getElementById('kanti-menu');
      element.classList.add('kanti-sticky');
      document.getElementsByTagName('main').item(0).setAttribute('style', 'margin-top: 50px');
    } else {
      const element = document.getElementById('kanti-menu');
      element.classList.remove('kanti-sticky');
      document.getElementsByTagName('main').item(0).removeAttribute('style');
    }
  }
}
