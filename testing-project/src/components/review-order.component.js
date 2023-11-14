import { currency } from '../pipes/currency.pipe.js';
import { drinksSummary } from '../pipes/drinks-summary.pipe.js';

import { router } from '../router.js';
import { orderService } from '../services/order.service.js';

import { reviewOrderTemplate, reviewRowTemplate } from './review-order.template.js';
import { cloneTemplate, RoboComponent, Selector } from './robo.component.js';

export class ReviewOrderComponent extends RoboComponent {
  #age = 0;
  /** @type {OrderItem[]} */
  #order;
  /** @type {string | undefined}  */
  error;

  /** @type {HTMLInputElement} */
  #ageInput;

  get age() {
    return this.#age;
  }
  set age(val) {
    this.#age = val;
    this.#render();
  }

  constructor() {
    super();
    this.#order = orderService.currentOrder;
  }

  /** @param {Event} event */
  submit(event) {
    event.preventDefault();
    if (!this.ageCheck || this.isAllowedToBuyAlcohol()) {
      this.error = undefined;
      router.next('/success');
    } else {
      this.error = 'Only adults can buy alcohol!';
      this.#render();
    }
  }

  updateInput() {
    this.age = this.#ageInput.valueAsNumber;
  }

  cancel() {
    orderService.clear();
    router.next('/');
  }

  isAllowedToBuyAlcohol() {
    return this.age > 18;
  }

  get ageCheck() {
    return this.#order.some((drink) => drink.isAlcoholic);
  }

  connectedCallback() {
    if (orderService.currentOrder.length) {
      this.appendChild(cloneTemplate(reviewOrderTemplate));
      this.#ageInput = /** @type {HTMLInputElement} */ (this.by.id.ageInput);
      this.#ageInput.addEventListener('input', this.updateInput.bind(this));
      this.by.class.roboSubmitForm.addEventListener('submit', this.submit.bind(this));
      this.by.class.roboCancel.addEventListener('click', this.cancel.bind(this));
      this.#render();
    } else {
      router.next('/');
    }
  }

  #render() {
    this.by.class.roboTotalAmount.innerText = drinksSummary(this.#order);
    this.by.class.roboAlert.hidden = !this.error;
    this.by.class.roboAlertText.innerText = this.error;
    this.by.class.roboAgeCheck.hidden = !this.ageCheck;
    /** @type {HTMLButtonElement} */ (this.by.class.roboSubmit).disabled = this.ageCheck && !this.age;
    this.#renderReviewTableBody();
  }

  #renderReviewTableBody() {
    this.by.class.roboReviewTableBody.replaceChildren(
      ...this.#order.map((orderItem) => {
        const row = cloneTemplate(reviewRowTemplate);
        const selector = new Selector(row);

        selector.class.roboName.innerText = orderItem.name;
        selector.class.roboAmount.innerText = orderItem.amount.toString();
        selector.class.roboPricePerDrink.innerText = currency(orderItem.price);
        selector.class.roboPrice.innerText = currency(orderItem.price * orderItem.amount);
        return row;
      }),
    );
  }
}

customElements.define('robo-review-order', ReviewOrderComponent);
