/**
 * @param {Partial<Drink>} [overrides]
 * @returns {Drink}
 */
export function createDrink(overrides) {
  return {
    isAlcoholic: false,
    name: 'Virgin Mojito',
    price: 5,
    ...overrides,
  };
}

/**
 * @param {Partial<OrderItem>} [overrides]
 * @returns {OrderItem}
 */
export function createOrderItem(overrides) {
  return {
    isAlcoholic: false,
    name: 'Virgin Mojito',
    price: 5,
    amount: 1,
    ...overrides,
  };
}
