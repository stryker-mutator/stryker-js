import { jest } from '@jest/globals';

import { OrderService } from '../../src/services/order.service.js';
import { createOrderItem } from '../helpers.js';

describe(OrderService, () => {
  /** @type {OrderService} */
  let sut;
  /** @type {jest.Mocked<Storage>} */
  let storageMock;

  beforeEach(() => {
    storageMock = {
      getItem: jest.fn(),
      clear: jest.fn(),
      removeItem: jest.fn(),
      setItem: jest.fn(),
      length: 0,
      key: jest.fn(),
    };
    sut = new OrderService(storageMock);
    sut.clear();
  });

  describe('currentOrder', () => {
    it('should retrieve from storage', () => {
      const expected = [createOrderItem()];
      storageMock.getItem.mockReturnValue(JSON.stringify(expected));
      expect(sut.currentOrder).toStrictEqual(expected);
    });
    it('should retrieve undefined when there is no order yes', () => {
      expect(sut.currentOrder).toBe(undefined);
    });
  });
});
