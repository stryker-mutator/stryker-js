import { jest } from '@jest/globals';

import { PlaceOrderComponent } from '../../src/components/place-order.component.js';
import { router } from '../../src/router.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DrinkService, drinkService } from '../../src/services/drink.service.js';
import { orderService } from '../../src/services/order.service.js';
import { createDrink, createOrderItem } from '../helpers.js';

describe(PlaceOrderComponent.name, () => {
  /** @type {PlaceOrderComponent} */
  let sut;

  /** @type {import('jest-mock').SpyInstance<(route: string) => void>} */
  let routerNextStub;
  /** @type {import('jest-mock').SpyInstance<DrinkService['getDrinks']>} */
  let getDrinksStub;
  /** @type {import('jest-mock').SpyInstance<(arg: OrderItem[]) => void>} */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let setOrderStub;

  beforeEach(() => {
    routerNextStub = jest.spyOn(router, 'next').mockImplementation(() => {
      // idle
    });
    getDrinksStub = jest.spyOn(drinkService, 'getDrinks');
    setOrderStub = jest.spyOn(orderService, 'currentOrder', 'set');
  });

  afterEach(() => {
    sut.remove();
  });

  it('should navigate to next page on submit', async () => {
    // Arrange
    const drinks = [createDrink({ name: 'Beer', price: 4.2 })];
    getDrinksStub.mockResolvedValue(drinks);
    createSut();
    await tick();
    sut.increment(sut.orderItems[0]);

    // Act
    sut.submit();

    // Assert
    expect(routerNextStub).toHaveBeenCalled();
  });

  it('should increment the drink amount on increment', () => {
    const roboBeer = createOrderItem({ name: 'Beer', amount: 0 });
    sut.increment(roboBeer);
    expect(roboBeer.amount).toEqual(1);
  });

  it('should decrement the drink amount on decrement', () => {
    const orderItem = createOrderItem({ name: 'Beer', amount: 3 });
    sut.decrement(orderItem);
    expect(orderItem.amount).toBe(2);
  });

  it('should not go below 0 on decrement', () => {
    const roboBeer = createOrderItem({ name: 'Robo Beer', amount: 0 });
    sut.decrement(roboBeer);
    expect(roboBeer.amount).toEqual(0);
  });

  function createSut() {
    sut = /** @type {PlaceOrderComponent} */ (document.createElement('robo-place-order'));
    return document.body.appendChild(sut);
  }

  function tick(n = 0) {
    return new Promise((res) => setTimeout(res, n));
  }
});
