import { drinksSummary } from '../../src/pipes/drinks-summary.pipe.js';
import { createOrderItem } from '../helpers.js';

describe(drinksSummary.name, () => {
  it('should provide "drink" postfix for 1', () => {
    expect(drinksSummary([createOrderItem({ amount: 1 })])).toContain('1 drink');
  });
  it('should provide "drinks" postfix for 0', () => {
    expect(drinksSummary([createOrderItem({ amount: 0 })])).toContain('0 drinks');
  });
});
