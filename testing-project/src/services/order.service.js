export class OrderService {
  /** @type {OrderItem[] | undefined} */
  #currentOrder;

  /**
   * @param {Storage} localStorage
   */
  constructor(localStorage) {
    this.localStorage = localStorage;
  }

  /**
   * @type {OrderItem[]}
   */
  get currentOrder() {
    if (!this.#currentOrder && this.localStorage.getItem('currentOrder')) {
      this.#currentOrder = JSON.parse(this.localStorage.getItem('currentOrder'));
    }
    return this.#currentOrder;
  }
  /**
   * @param {OrderItem[]} value
   */
  set currentOrder(value) {
    this.#currentOrder = value;
    this.localStorage.setItem('currentOrder', JSON.stringify(value));
  }

  clear() {
    this.currentOrder = undefined;
  }
}

export const orderService = new OrderService(localStorage);
