import { router } from '../router.js';

import { cloneTemplate, RoboComponent } from './robo.component.js';

const template = document.createElement('template');
template.innerHTML = `
<div class="container">
    <div class="row">
        <h1 class="col-12 display-2">Robobar
            <small class="text-muted">Futuristic drinks</small>
        </h1>
    </div>
    <div id="view"><robo-place-order></robo-place-order></div>
    <div class="alert alert-default" role="alert">
        <h4 class="alert-heading">Prrt!</h4>
        Curious about the <a target="_blank" href="reports/coverage/lcov-report/index.html">code coverage report</a> or the <a target="_blank" href="reports/mutation/mutation.html">mutation testing report</a>? 
    </div>
</div>
`;
export class RobobarComponent extends RoboComponent {
  /** @type {string | undefined} */
  currentlyViewedRoute;

  connectedCallback() {
    this.appendChild(cloneTemplate(template));
    this.view = this.by.id.view;
    this.routerSubscription = router.onNext((route) => {
      this.route = route;
      this.render();
    });
    this.render();
  }

  disconnectedCallback() {
    this.routerSubscription();
  }

  render() {
    if (this.currentlyViewedRoute === this.route) {
      return;
    }
    this.currentlyViewedRoute = this.route;
    switch (this.route) {
      case '/review':
        this.view.innerHTML = '<robo-review-order></robo-review-order>';
        break;
      case '/success':
        this.view.innerHTML = '<robo-success></robo-success>';
        break;
      default:
        this.view.innerHTML = '<robo-place-order></robo-place-order>';
        break;
    }
  }
}

customElements.define('robo-bar', RobobarComponent);
