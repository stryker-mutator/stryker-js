import { orderService } from '../services/order.service.js';
import { drinkService } from '../services/drink.service.js';
import { router } from '../router.js';

import { currency } from '../pipes/currency.pipe.js';

import { templatePlaceOrder, templateOrderRow } from './place-order.template.js';
import { cloneTemplate, RoboComponent, Selector } from './robo.component.js';

export class PlaceOrderComponent extends RoboComponent {
  /** @type {OrderItem[]} */
  orderItems = [];

  /** @param {OrderItem} orderItem */
  increment(orderItem) {
    orderItem.amount++;
    this.#render();
  }
  /** @param {OrderItem} orderItem */
  decrement(orderItem) {
    orderItem.amount--;
    if (orderItem.amount < 0) {
      orderItem.amount = 0;
    }
    this.#render();
  }

  get totalPrice() {
    return this.orderItems.reduce((total, drink) => total + drink.amount * drink.price, 0);
  }

  get submitEnabled() {
    return this.orderItems.some((drink) => drink.amount > 0);
  }

  submit() {
    orderService.currentOrder = this.orderItems.filter((drink) => drink.amount);
    router.next('/review');
  }

  connectedCallback() {
    this.appendChild(cloneTemplate(templatePlaceOrder));
    drinkService.getDrinks().then((drinks) => {
      this.orderItems = drinks.map((drink) => ({ ...drink, amount: 0 }));
      this.#render();
    });
    this.by.class.roboSubmit.addEventListener('click', this.submit.bind(this));
    this.#render();
  }

  #render() {
    this.by.class.roboOrderTableBody.replaceChildren(...this.orderItems.map((orderItem) => this.#renderOrderRow(orderItem)));
    this.by.class.roboTotalPrice.innerText = currency(this.totalPrice);
    /** @type {HTMLInputElement} */ (this.by.class.roboSubmit).disabled = !this.submitEnabled;
  }

  /**
   * @param {OrderItem} orderItem
   */
  #renderOrderRow(orderItem) {
    const row = cloneTemplate(templateOrderRow);
    const selector = new Selector(row);
    selector.class.roboName.innerText = orderItem.name;
    selector.class.roboPrice.innerText = currency(orderItem.price);
    /** @type {HTMLInputElement}*/ (selector.class.roboAmount).value = orderItem.amount.toString();
    selector.class.roboIncrement.addEventListener('click', this.increment.bind(this, orderItem));
    selector.class.roboDecrement.addEventListener('click', this.decrement.bind(this, orderItem));
    return row;
  }
}

customElements.define('robo-place-order', PlaceOrderComponent);
