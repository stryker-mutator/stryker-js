import { jest } from '@jest/globals';

import { SuccessComponent } from '../../src/components/success.component.js';
import { orderService } from '../../src/services/order.service.js';
import { createOrderItem } from '../helpers.js';

describe(SuccessComponent.name, () => {
  /** @type {OrderItem[]} */
  let order;
  /** @type {HTMLElement} */
  let sut;

  beforeEach(() => {
    order = [];
    jest.spyOn(orderService, 'currentOrder', 'get').mockReturnValue(order);
  });

  afterEach(() => {
    sut.remove();
  });

  it('should render', () => {
    order.push(createOrderItem({ amount: 0 }));
    sut = document.createElement('robo-success');
    document.body.appendChild(sut);
    expect(sut).toBeTruthy();
  });
});
