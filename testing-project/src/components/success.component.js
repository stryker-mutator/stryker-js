import { drinksSummary } from '../pipes/drinks-summary.pipe.js';
import { orderService } from '../services/order.service.js';

import { cloneTemplate, RoboComponent } from './robo.component.js';

const template = document.createElement('template');
template.innerHTML = `<div class="row">
    <h2 class="roboDrinks col-12 display-4"></h2>
  </div>
  <div class="row">
    <div class="col-12">
      <p>Coming right up! ~bzzzt~</p>
      <form>
        <a href="#/" type="button" class="btn btn-primary">New order</a>
      </form>
    </div>
  </div>`;

export class SuccessComponent extends RoboComponent {
  connectedCallback() {
    this.appendChild(cloneTemplate(template));
    this.by.class.roboDrinks.innerText = drinksSummary(orderService.currentOrder);
  }
}

customElements.define('robo-success', SuccessComponent);
